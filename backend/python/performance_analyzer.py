#!/usr/bin/env python3
"""
Performance analyzer for GEO-SEO audit.
Measures page performance metrics, resource breakdown, SERP preview,
compression, and minification status.
"""

import sys
import json
import re
import subprocess
import time
from urllib.parse import urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Required packages not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}


def measure_timing(url: str) -> dict:
    """Measure page load timing using curl."""
    timing = {
        "ttfb_seconds": None,
        "total_time_seconds": None,
        "connect_time_seconds": None,
        "ssl_time_seconds": None,
        "redirect_time_seconds": None,
        "errors": [],
    }

    try:
        curl_format = (
            '{"ttfb": %{time_starttransfer}, '
            '"total": %{time_total}, '
            '"connect": %{time_connect}, '
            '"ssl": %{time_appconnect}, '
            '"redirect": %{time_redirect}, '
            '"http_code": %{http_code}, '
            '"size_download": %{size_download}, '
            '"speed_download": %{speed_download}}'
        )
        result = subprocess.run(
            ["curl", "-sL", "-o", "/dev/null", "-w", curl_format, url],
            capture_output=True, text=True, timeout=30
        )
        data = json.loads(result.stdout)
        timing["ttfb_seconds"] = round(data["ttfb"], 3)
        timing["total_time_seconds"] = round(data["total"], 3)
        timing["connect_time_seconds"] = round(data["connect"], 3)
        timing["ssl_time_seconds"] = round(data["ssl"], 3)
        timing["redirect_time_seconds"] = round(data["redirect"], 3)
        timing["download_size_bytes"] = int(data["size_download"])
        timing["download_speed_bps"] = int(data["speed_download"])
    except Exception as e:
        timing["errors"].append(f"Timing measurement error: {str(e)}")

    return timing


def check_http2(url: str) -> bool:
    """Check if server supports HTTP/2."""
    try:
        result = subprocess.run(
            ["curl", "-sI", "--http2", "-o", "/dev/null", "-w", "%{http_version}", url],
            capture_output=True, text=True, timeout=10
        )
        return result.stdout.strip().startswith("2")
    except Exception:
        return None


def analyze_resources(html: str, base_url: str) -> dict:
    """Analyze page resources (JS, CSS, images, etc.)."""
    soup = BeautifulSoup(html, "lxml")

    resources = {
        "html": {"count": 1, "files": []},
        "js": {"count": 0, "files": []},
        "css": {"count": 0, "files": []},
        "img": {"count": 0, "files": []},
        "font": {"count": 0, "files": []},
        "other": {"count": 0, "files": []},
        "total_count": 0,
    }

    # JavaScript files
    for script in soup.find_all("script", src=True):
        resources["js"]["count"] += 1
        resources["js"]["files"].append(script["src"])

    # CSS files
    for link in soup.find_all("link", rel="stylesheet"):
        href = link.get("href", "")
        if href:
            resources["css"]["count"] += 1
            resources["css"]["files"].append(href)

    # Images
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if src:
            resources["img"]["count"] += 1
            resources["img"]["files"].append(src)

    # Fonts (preloaded)
    for link in soup.find_all("link", rel="preload"):
        if link.get("as") == "font":
            resources["font"]["count"] += 1
            href = link.get("href", "")
            if href:
                resources["font"]["files"].append(href)

    # Other preloaded resources
    for link in soup.find_all("link", rel="preload"):
        as_type = link.get("as", "")
        if as_type and as_type not in ("font", "style", "script", "image"):
            resources["other"]["count"] += 1

    resources["total_count"] = (
        resources["html"]["count"] +
        resources["js"]["count"] +
        resources["css"]["count"] +
        resources["img"]["count"] +
        resources["font"]["count"] +
        resources["other"]["count"]
    )

    return resources


def check_compression(headers: dict) -> dict:
    """Check compression from response headers."""
    encoding = headers.get("Content-Encoding", headers.get("content-encoding", ""))
    return {
        "enabled": bool(encoding),
        "type": encoding if encoding else "none",
        "details": {
            "gzip": "gzip" in encoding.lower() if encoding else False,
            "brotli": "br" in encoding.lower() if encoding else False,
            "deflate": "deflate" in encoding.lower() if encoding else False,
        }
    }


def check_minification(html: str) -> dict:
    """Check if JS and CSS are minified."""
    soup = BeautifulSoup(html, "lxml")
    result = {
        "js_minified": None,
        "css_minified": None,
        "js_details": "",
        "css_details": "",
    }

    # Check inline scripts
    scripts = soup.find_all("script", src=False)
    if scripts:
        total_content = "".join(s.string or "" for s in scripts)
        if len(total_content) > 100:
            lines = total_content.split("\n")
            avg_line = len(total_content) / max(len(lines), 1)
            result["js_minified"] = avg_line > 200
            result["js_details"] = f"Avg line length: {avg_line:.0f} chars ({len(lines)} lines)"

    # Check external JS filenames
    ext_scripts = soup.find_all("script", src=True)
    if ext_scripts:
        min_count = sum(1 for s in ext_scripts if ".min." in s.get("src", ""))
        total = len(ext_scripts)
        if result["js_minified"] is None:
            result["js_minified"] = min_count > total * 0.5
        result["js_details"] += f" | {min_count}/{total} external files have .min."

    # Check inline styles
    styles = soup.find_all("style")
    if styles:
        total_content = "".join(s.string or "" for s in styles)
        if len(total_content) > 100:
            lines = total_content.split("\n")
            avg_line = len(total_content) / max(len(lines), 1)
            result["css_minified"] = avg_line > 200
            result["css_details"] = f"Avg line length: {avg_line:.0f} chars"

    # Check external CSS filenames
    ext_css = soup.find_all("link", rel="stylesheet")
    if ext_css:
        min_count = sum(1 for c in ext_css if ".min." in c.get("href", ""))
        total = len(ext_css)
        if result["css_minified"] is None:
            result["css_minified"] = min_count > total * 0.5
        result["css_details"] += f" | {min_count}/{total} external files have .min."

    return result


def generate_serp_preview(title: str, url: str, description: str) -> dict:
    """Generate SERP (Search Engine Results Page) preview."""
    parsed = urlparse(url)

    # Display URL (Google style)
    display_url = parsed.netloc
    if parsed.path and parsed.path != "/":
        path_parts = parsed.path.strip("/").split("/")
        display_url += " › " + " › ".join(path_parts)

    # Title truncation (Google typically shows ~50-60 chars)
    title_truncated = len(title) > 60
    display_title = title[:57] + "..." if title_truncated else title

    # Description truncation (Google typically shows ~150-160 chars)
    desc_truncated = len(description) > 160
    display_desc = description[:157] + "..." if desc_truncated else description

    # Pixel width estimate (rough: avg 6px per char for desktop)
    title_pixel_est = len(title) * 7.5

    return {
        "display_title": display_title,
        "display_url": display_url,
        "display_description": display_desc,
        "raw_title": title,
        "raw_description": description,
        "title_length": len(title),
        "description_length": len(description),
        "title_truncated": title_truncated,
        "description_truncated": desc_truncated,
        "title_pixel_width_estimate": int(title_pixel_est),
        "title_optimal": 50 <= len(title) <= 60,
        "description_optimal": 120 <= len(description) <= 160,
    }


def check_deprecated_html(html: str) -> list:
    """Check for deprecated HTML tags."""
    soup = BeautifulSoup(html, "lxml")
    deprecated = [
        "font", "center", "marquee", "blink", "big", "strike",
        "tt", "frame", "frameset", "applet", "basefont", "dir",
        "isindex", "menu"
    ]
    found = []
    for tag in deprecated:
        elements = soup.find_all(tag)
        if elements:
            found.append({"tag": tag, "count": len(elements)})
    return found


def check_page_extras(html: str) -> dict:
    """Check for Flash, iFrames, inline styles, favicon, emails."""
    soup = BeautifulSoup(html, "lxml")

    # Flash
    has_flash = False
    for obj in soup.find_all(["object", "embed"]):
        if "flash" in (obj.get("type", "") + obj.get("src", "")).lower():
            has_flash = True
            break

    # iFrames
    iframes = []
    for iframe in soup.find_all("iframe"):
        iframes.append({
            "src": iframe.get("src", ""),
            "title": iframe.get("title", ""),
        })

    # Inline styles
    inline_count = len(soup.find_all(style=True))

    # Favicon
    has_favicon = bool(
        soup.find("link", rel=lambda r: r and "icon" in (r if isinstance(r, list) else [r]))
    )

    # Plaintext emails
    text = soup.get_text(separator=" ")
    emails = list(set(re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', text)))

    # AMP
    html_tag = soup.find("html")
    has_amp = bool(html_tag and (html_tag.get("amp") is not None or html_tag.get("⚡") is not None))
    amp_link = soup.find("link", rel="amphtml")
    amp_url = amp_link.get("href") if amp_link else None

    return {
        "has_flash": has_flash,
        "iframes": iframes,
        "iframes_count": len(iframes),
        "inline_styles_count": inline_count,
        "has_favicon": has_favicon,
        "plaintext_emails": emails,
        "has_amp": has_amp,
        "amp_url": amp_url,
    }


def analyze_performance(url: str) -> dict:
    """Run full performance analysis on a URL."""
    result = {
        "url": url,
        "timing": {},
        "http2": None,
        "compression": {},
        "resources": {},
        "minification": {},
        "serp_preview": {},
        "deprecated_html": [],
        "page_extras": {},
        "page_size": {
            "html_bytes": 0,
            "html_kb": 0,
            "html_mb": 0,
        },
        "errors": [],
    }

    try:
        # Fetch page
        response = requests.get(url, headers=DEFAULT_HEADERS, timeout=30)
        html = response.text

        # Page size
        size_bytes = len(response.content)
        result["page_size"]["html_bytes"] = size_bytes
        result["page_size"]["html_kb"] = round(size_bytes / 1024, 1)
        result["page_size"]["html_mb"] = round(size_bytes / (1024 * 1024), 2)

        # Timing
        result["timing"] = measure_timing(url)

        # HTTP/2
        result["http2"] = check_http2(url)

        # Compression
        result["compression"] = check_compression(dict(response.headers))

        # Resources
        result["resources"] = analyze_resources(html, url)

        # Minification
        result["minification"] = check_minification(html)

        # SERP Preview
        soup = BeautifulSoup(html, "lxml")
        title = soup.find("title")
        title_text = title.get_text(strip=True) if title else ""
        desc_meta = soup.find("meta", attrs={"name": "description"})
        desc_text = desc_meta.get("content", "") if desc_meta else ""
        result["serp_preview"] = generate_serp_preview(title_text, url, desc_text)

        # Deprecated HTML
        result["deprecated_html"] = check_deprecated_html(html)

        # Page extras
        result["page_extras"] = check_page_extras(html)

    except Exception as e:
        result["errors"].append(f"Performance analysis error: {str(e)}")

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python performance_analyzer.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    data = analyze_performance(url)
    print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
