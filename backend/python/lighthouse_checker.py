#!/usr/bin/env python3
"""
Lighthouse / PageSpeed Insights Checker
Google PageSpeed Insights API v5 kullanarak gercek Lighthouse puanlari alir.

Kullanim:
    python3 lighthouse_checker.py <url> [--api-key KEY] [--strategy mobile|desktop|both]

Cikti: JSON (stdout)

Kapsam:
    - 4 Lighthouse kategorisi: Performance, Accessibility, Best Practices, SEO
    - Core Web Vitals: LCP, CLS, INP, FCP, TTFB, TBT, SI
    - Field Data (CrUX) vs Lab Data karsilastirmasi
    - Firsatlar (Opportunities): somut tasarruf miktarlari
    - Teshisler (Diagnostics): detayli bulgular
    - Mobile + Desktop karsilastirmali analiz
    - Genel bir "Lighthouse Skoru" (agirlikli ortalama)
"""

import sys
import json
import time
import argparse
from datetime import datetime
from urllib.parse import urlencode, urlparse

try:
    import requests
except ImportError:
    print(json.dumps({"error": "requests yuklu degil. Calistirin: pip install requests"}))
    sys.exit(1)

PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

# Lighthouse kategori agirliklari (genel GEO skoru icin)
CATEGORY_WEIGHTS = {
    "performance":       0.40,
    "accessibility":     0.25,
    "best-practices":    0.20,
    "seo":               0.15,
}

# Core Web Vitals esik degerleri (Good / Needs Improvement / Poor)
CWV_THRESHOLDS = {
    "lcp": {
        "good": 2500,   # ms
        "poor": 4000,
        "unit": "ms",
        "label": "Largest Contentful Paint",
    },
    "cls": {
        "good": 0.1,    # skor
        "poor": 0.25,
        "unit": "",
        "label": "Cumulative Layout Shift",
    },
    "inp": {
        "good": 200,    # ms
        "poor": 500,
        "unit": "ms",
        "label": "Interaction to Next Paint",
    },
    "fcp": {
        "good": 1800,   # ms
        "poor": 3000,
        "unit": "ms",
        "label": "First Contentful Paint",
    },
    "ttfb": {
        "good": 800,    # ms
        "poor": 1800,
        "unit": "ms",
        "label": "Time to First Byte",
    },
    "tbt": {
        "good": 200,    # ms
        "poor": 600,
        "unit": "ms",
        "label": "Total Blocking Time",
    },
    "si": {
        "good": 3400,   # ms
        "poor": 5800,
        "unit": "ms",
        "label": "Speed Index",
    },
}

# PSI audit ID -> CWV metrik adi eslestirmesi
AUDIT_TO_METRIC = {
    "largest-contentful-paint": "lcp",
    "cumulative-layout-shift":  "cls",
    "total-blocking-time":      "tbt",
    "first-contentful-paint":   "fcp",
    "speed-index":              "si",
    "interactive":              "tti",
    "server-response-time":     "ttfb",
    "experimental-interaction-to-next-paint": "inp",
}


def cwv_rating(metric_key: str, value: float) -> str:
    """Metrik degerine gore Good / Needs Improvement / Poor dondurur."""
    if metric_key not in CWV_THRESHOLDS:
        return "unknown"
    t = CWV_THRESHOLDS[metric_key]
    if value <= t["good"]:
        return "good"
    elif value <= t["poor"]:
        return "needs-improvement"
    else:
        return "poor"


def score_to_label(score: float) -> str:
    if score >= 0.90: return "Mukemmel"
    if score >= 0.75: return "Iyi"
    if score >= 0.50: return "Gelisme Gerekli"
    if score >= 0.25: return "Zayif"
    return "Kritik"


def fetch_psi(url: str, strategy: str, api_key: str = None) -> dict:
    """PSI API'sini cagir, ham sonucu dondur."""
    params = {
        "url": url,
        "strategy": strategy,
        "category": ["performance", "accessibility", "best-practices", "seo"],
        "locale": "tr",
    }
    if api_key:
        params["key"] = api_key

    try:
        resp = requests.get(
            PSI_API,
            params=params,
            timeout=90,
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.Timeout:
        return {"error": f"PSI API zaman asimi ({strategy})"}
    except requests.exceptions.HTTPError as e:
        try:
            err_body = resp.json()
            return {"error": f"PSI API HTTP {resp.status_code}: {err_body}"}
        except Exception:
            return {"error": f"PSI API HTTP hatasi: {e}"}
    except Exception as e:
        return {"error": f"PSI API baglanti hatasi: {e}"}


def parse_psi_response(raw: dict, strategy: str) -> dict:
    """PSI ham JSON'unu okunabilir yapiya donustur."""
    if "error" in raw:
        return {"strategy": strategy, "error": raw["error"]}

    lr = raw.get("lighthouseResult", {})
    categories = lr.get("categories", {})
    audits = lr.get("audits", {})
    loading_exp = raw.get("loadingExperience", {})
    origin_exp  = raw.get("originLoadingExperience", {})

    # --- Kategori puanlari ---
    cat_scores = {}
    for cat_id, cat_data in categories.items():
        score = cat_data.get("score")
        cat_scores[cat_id] = {
            "score": round(score * 100) if score is not None else None,
            "label": score_to_label(score) if score is not None else "N/A",
        }

    # --- Agirlikli genel skor ---
    weighted = 0.0
    total_w  = 0.0
    for cat_id, w in CATEGORY_WEIGHTS.items():
        s = cat_scores.get(cat_id, {}).get("score")
        if s is not None:
            weighted += s * w
            total_w  += w
    overall = round(weighted / total_w) if total_w > 0 else None

    # --- Lab verileri (CWV metrikler) ---
    lab_metrics = {}
    for audit_id, metric_key in AUDIT_TO_METRIC.items():
        audit = audits.get(audit_id, {})
        if not audit:
            continue
        num_val = audit.get("numericValue")
        display = audit.get("displayValue", "")
        score   = audit.get("score")

        if num_val is not None:
            threshold = CWV_THRESHOLDS.get(metric_key, {})
            unit = threshold.get("unit", "ms")
            label = threshold.get("label", metric_key.upper())
            # ms'ye cevir (PSI bazi degerleri ms, bazilari saniye veya skor olarak verir)
            if metric_key == "cls":
                val_display = round(num_val, 3)
            else:
                val_display = round(num_val)

            lab_metrics[metric_key] = {
                "label":   label,
                "value":   val_display,
                "unit":    unit,
                "display": display,
                "rating":  cwv_rating(metric_key, num_val),
                "score":   round(score * 100) if score is not None else None,
            }

    # --- Field verileri (CrUX) ---
    field_metrics = {}
    crux_source = loading_exp if loading_exp.get("metrics") else origin_exp
    crux_metrics = crux_source.get("metrics", {})
    crux_overall = crux_source.get("overall_category", "UNKNOWN")

    crux_map = {
        "LARGEST_CONTENTFUL_PAINT_MS":      "lcp",
        "CUMULATIVE_LAYOUT_SHIFT_SCORE":     "cls",
        "INTERACTION_TO_NEXT_PAINT":         "inp",
        "FIRST_CONTENTFUL_PAINT_MS":         "fcp",
        "EXPERIMENTAL_TIME_TO_FIRST_BYTE":   "ttfb",
    }
    for crux_key, metric_key in crux_map.items():
        m = crux_metrics.get(crux_key, {})
        if not m:
            continue
        pct = m.get("percentile")
        cat = m.get("category", "UNKNOWN").lower().replace("_", "-")
        if pct is not None:
            threshold = CWV_THRESHOLDS.get(metric_key, {})
            val = pct / 1000 if metric_key == "cls" else pct
            field_metrics[metric_key] = {
                "label":   threshold.get("label", metric_key.upper()),
                "value":   round(val, 3) if metric_key == "cls" else pct,
                "unit":    threshold.get("unit", "ms"),
                "rating":  cat,
                "p75":     pct,
            }

    # --- Firsatlar (savings) ---
    opportunities = []
    for audit_id, audit in audits.items():
        if audit.get("details", {}).get("type") != "opportunity":
            continue
        savings_ms = audit.get("details", {}).get("overallSavingsMs", 0)
        savings_bytes = audit.get("details", {}).get("overallSavingsBytes", 0)
        score = audit.get("score", 1)
        if score is not None and score >= 0.9:
            continue  # zaten geciyor, atlat
        opportunities.append({
            "id":           audit_id,
            "title":        audit.get("title", ""),
            "description":  audit.get("description", ""),
            "savings_ms":   round(savings_ms) if savings_ms else None,
            "savings_bytes":round(savings_bytes) if savings_bytes else None,
            "score":        round(score * 100) if score is not None else None,
            "display":      audit.get("displayValue", ""),
        })
    # Tasarrufa gore sirala
    opportunities.sort(key=lambda x: -(x.get("savings_ms") or 0))

    # --- Teshisler (diagnostics) ---
    diagnostics = []
    for audit_id, audit in audits.items():
        details_type = audit.get("details", {}).get("type", "")
        if details_type not in ("table", "list", "criticalrequestchain"):
            continue
        score = audit.get("score", 1)
        if score is not None and score >= 0.9:
            continue
        if audit_id in AUDIT_TO_METRIC:
            continue  # CWV olarak zaten islendi
        if audit.get("details", {}).get("type") == "opportunity":
            continue  # Firsatlar olarak zaten islendi
        diagnostics.append({
            "id":          audit_id,
            "title":       audit.get("title", ""),
            "description": audit.get("description", ""),
            "score":       round(score * 100) if score is not None else None,
            "display":     audit.get("displayValue", ""),
        })

    # --- Gecen / Kalan denetimler ozeti ---
    passed_audits  = sum(1 for a in audits.values() if a.get("score") == 1)
    failed_audits  = sum(1 for a in audits.values()
                         if a.get("score") is not None and a.get("score") < 0.9)
    na_audits      = sum(1 for a in audits.values() if a.get("score") is None)

    # --- Sayfa metadata ---
    final_url   = lr.get("finalUrl", "")
    fetch_time  = lr.get("fetchTime", "")
    lighthouse_v = lr.get("lighthouseVersion", "")
    user_agent  = lr.get("userAgent", "")

    return {
        "strategy":       strategy,
        "url":            final_url,
        "fetch_time":     fetch_time,
        "lighthouse_version": lighthouse_v,
        "overall_score":  overall,
        "overall_label":  score_to_label(overall / 100) if overall is not None else "N/A",
        "categories":     cat_scores,
        "lab_metrics":    lab_metrics,
        "field_metrics":  field_metrics,
        "crux_overall":   crux_overall,
        "opportunities":  opportunities[:10],   # En onemli 10
        "diagnostics":    diagnostics[:10],     # En onemli 10
        "audit_summary": {
            "passed": passed_audits,
            "failed": failed_audits,
            "na":     na_audits,
            "total":  passed_audits + failed_audits + na_audits,
        },
    }


def run_lighthouse(url: str, strategy: str = "both", api_key: str = None) -> dict:
    """Ana giris noktasi: URL icin Lighthouse analizi yap."""
    results = {
        "url":        url,
        "date":       datetime.now().strftime("%Y-%m-%d"),
        "time":       datetime.now().strftime("%H:%M:%S"),
        "strategies": {},
    }

    strategies_to_run = ["mobile", "desktop"] if strategy == "both" else [strategy]

    for strat in strategies_to_run:
        raw = fetch_psi(url, strat, api_key)
        parsed = parse_psi_response(raw, strat)
        results["strategies"][strat] = parsed

        # API rate limit — iki strateji arasinda kisa bekleme
        if strat == "mobile" and "desktop" in strategies_to_run:
            time.sleep(2)

    # --- Karsilastirmali ozet (her iki strateji varsa) ---
    if "mobile" in results["strategies"] and "desktop" in results["strategies"]:
        mob = results["strategies"]["mobile"]
        desk = results["strategies"]["desktop"]
        if "error" not in mob and "error" not in desk:
            comparison = {}
            for cat_id in CATEGORY_WEIGHTS:
                m_score = mob["categories"].get(cat_id, {}).get("score")
                d_score = desk["categories"].get(cat_id, {}).get("score")
                comparison[cat_id] = {
                    "mobile":  m_score,
                    "desktop": d_score,
                    "diff":    (d_score - m_score) if (m_score and d_score) else None,
                }
            results["comparison"] = comparison

            # En dusuk puan hangi strateji?
            m_overall = mob.get("overall_score", 0) or 0
            d_overall = desk.get("overall_score", 0) or 0
            results["worst_strategy"] = "mobile" if m_overall <= d_overall else "desktop"
            results["best_strategy"]  = "desktop" if m_overall <= d_overall else "mobile"

    return results


def format_score_bar(score: int, width: int = 20) -> str:
    """Metin tabanli puan cubugu olustur."""
    if score is None: return "N/A"
    filled = round(score / 100 * width)
    bar = "█" * filled + "░" * (width - filled)
    return f"{bar} {score}/100"


def print_summary(results: dict):
    """Konsol ozeti yazdir (JSON ciktisinin yaninda)."""
    print("\n" + "="*60, file=sys.stderr)
    print(f"  Lighthouse Analizi: {results['url']}", file=sys.stderr)
    print(f"  Tarih: {results['date']} {results['time']}", file=sys.stderr)
    print("="*60, file=sys.stderr)

    for strat, data in results["strategies"].items():
        if "error" in data:
            print(f"\n  [{strat.upper()}] HATA: {data['error']}", file=sys.stderr)
            continue

        print(f"\n  [{strat.upper()}] Genel Skor: {data.get('overall_score', 'N/A')}/100", file=sys.stderr)
        print("  " + "-"*40, file=sys.stderr)
        for cat_id, cat_data in data.get("categories", {}).items():
            s = cat_data.get("score", "?")
            emoji = "✅" if s and s >= 90 else "⚠️" if s and s >= 50 else "❌"
            print(f"  {emoji} {cat_id:<20} {s}/100", file=sys.stderr)

        print("\n  Core Web Vitals (Lab):", file=sys.stderr)
        for metric_key in ["lcp", "cls", "inp", "fcp", "ttfb", "tbt"]:
            m = data.get("lab_metrics", {}).get(metric_key)
            if not m: continue
            rating = m["rating"]
            emoji = "✅" if rating == "good" else "⚠️" if rating == "needs-improvement" else "❌"
            val = f"{m['value']}{m['unit']}" if m["unit"] else str(m["value"])
            print(f"  {emoji} {m['label']:<35} {val}", file=sys.stderr)

    print("\n", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Google PageSpeed Insights / Lighthouse Checker"
    )
    parser.add_argument("url", help="Analiz edilecek URL")
    parser.add_argument("--api-key", default=None,
                        help="Google API anahtari (opsiyonel, rate limit icin)")
    parser.add_argument("--strategy", default="both",
                        choices=["mobile", "desktop", "both"],
                        help="Analiz stratejisi (varsayilan: both)")
    parser.add_argument("--quiet", action="store_true",
                        help="Konsol ozetini bastir, yalnizca JSON yaz")
    parser.add_argument("--output", default=None,
                        help="JSON ciktisini dosyaya kaydet")

    args = parser.parse_args()

    # URL'ye protokol ekle
    url = args.url
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    results = run_lighthouse(url, args.strategy, args.api_key)

    if not args.quiet:
        print_summary(results)

    output_json = json.dumps(results, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Kaydedildi: {args.output}", file=sys.stderr)
    else:
        print(output_json)


if __name__ == "__main__":
    main()
