#!/usr/bin/env python3
"""
Fetch and parse web pages for GEO analysis.
Extracts HTML, text content, meta tags, headers, and structured data.
"""

import sys
import json
import re
import subprocess
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Required packages not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

# Common AI crawler user agents for testing
AI_CRAWLERS = {
    "GPTBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "ClaudeBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +https://www.anthropic.com/claude-bot)",
    "PerplexityBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "GoogleBot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "BingBot": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
}

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
}


def fetch_page(url: str, timeout: int = 30) -> dict:
    """Fetch a page and return structured analysis data."""
    result = {
        "url": url,
        "status_code": None,
        "redirect_chain": [],
        "headers": {},
        "meta_tags": {},
        "title": None,
        "description": None,
        "canonical": None,
        "h1_tags": [],
        "heading_structure": [],
        "word_count": 0,
        "text_content": "",
        "internal_links": [],
        "external_links": [],
        "images": [],
        "structured_data": [],
        "has_ssr_content": True,
        "security_headers": {},
        # --- NEW: Extended detection fields ---
        "analytics_tools": [],
        "social_profiles": [],
        "has_favicon": False,
        "inline_styles_count": 0,
        "deprecated_tags": [],
        "has_flash": False,
        "iframes": [],
        "plaintext_emails": [],
        "is_http2": None,
        "has_amp": False,
        "has_amp_link": None,
        "resource_breakdown": {"js": 0, "css": 0, "img": 0, "other": 0},
        "js_files": [],
        "css_files": [],
        "minification_status": {"js_minified": None, "css_minified": None},
        "has_hreflang": False,
        "hreflang_tags": [],
        "lang_attribute": None,
        "og_tags": {},
        "twitter_tags": {},
        "text_to_html_ratio": 0,
        "html_size_bytes": 0,
        "errors": [],
    }

    try:
        response = requests.get(
            url,
            headers=DEFAULT_HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )

        # Track redirects
        if response.history:
            result["redirect_chain"] = [
                {"url": r.url, "status": r.status_code} for r in response.history
            ]

        result["status_code"] = response.status_code
        result["headers"] = dict(response.headers)

        # Security headers check
        security_headers = [
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Referrer-Policy",
            "Permissions-Policy",
        ]
        for header in security_headers:
            result["security_headers"][header] = response.headers.get(header, None)

        # Parse HTML
        soup = BeautifulSoup(response.text, "lxml")

        # Title
        title_tag = soup.find("title")
        result["title"] = title_tag.get_text(strip=True) if title_tag else None

        # Meta tags
        for meta in soup.find_all("meta"):
            name = meta.get("name", meta.get("property", ""))
            content = meta.get("content", "")
            if name and content:
                result["meta_tags"][name.lower()] = content
                if name.lower() == "description":
                    result["description"] = content

        # Canonical
        canonical = soup.find("link", rel="canonical")
        result["canonical"] = canonical.get("href") if canonical else None

        # Headings
        for level in range(1, 7):
            for heading in soup.find_all(f"h{level}"):
                text = heading.get_text(strip=True)
                result["heading_structure"].append({"level": level, "text": text})
                if level == 1:
                    result["h1_tags"].append(text)

        # Structured data (JSON-LD) — extract before decompose() mutates the tree
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                result["structured_data"].append(data)
            except (json.JSONDecodeError, TypeError):
                result["errors"].append("Invalid JSON-LD detected")

        # --- HTML size and ratio ---
        raw_html = response.text
        result["html_size_bytes"] = len(response.content)

        # --- Lang attribute ---
        html_tag = soup.find("html")
        if html_tag:
            result["lang_attribute"] = html_tag.get("lang", None)

        # --- AMP detection ---
        if html_tag and (html_tag.get("amp") is not None or html_tag.get("⚡") is not None):
            result["has_amp"] = True
        amp_link = soup.find("link", rel="amphtml")
        if amp_link:
            result["has_amp_link"] = amp_link.get("href")

        # --- Hreflang tags ---
        for link in soup.find_all("link", rel="alternate"):
            hreflang = link.get("hreflang")
            if hreflang:
                result["has_hreflang"] = True
                result["hreflang_tags"].append({
                    "lang": hreflang,
                    "href": link.get("href", "")
                })

        # --- Open Graph tags ---
        for meta in soup.find_all("meta", property=re.compile(r"^og:")):
            prop = meta.get("property", "")
            content = meta.get("content", "")
            if prop and content:
                result["og_tags"][prop] = content

        # --- Twitter Card tags ---
        for meta in soup.find_all("meta", attrs={"name": re.compile(r"^twitter:")}):
            name = meta.get("name", "")
            content = meta.get("content", "")
            if name and content:
                result["twitter_tags"][name] = content

        # --- Favicon detection ---
        favicon_rels = ["icon", "shortcut icon", "apple-touch-icon"]
        for rel in favicon_rels:
            if soup.find("link", rel=lambda r: r and rel in (r if isinstance(r, list) else [r])):
                result["has_favicon"] = True
                break

        # --- Analytics & tracking tools detection ---
        analytics_patterns = {
            "Google Analytics (gtag.js)": r"gtag\s*\(",
            "Google Analytics (analytics.js)": r"google-analytics\.com/analytics\.js",
            "Google Analytics 4": r"googletagmanager\.com/gtag",
            "Google Tag Manager": r"googletagmanager\.com/gtm\.js",
            "Facebook Pixel": r"fbq\s*\(|connect\.facebook\.net/",
            "Hotjar": r"hotjar\.com",
            "Microsoft Clarity": r"clarity\.ms",
            "Yandex Metrica": r"mc\.yandex\.ru|yandex\.ru/metrika",
            "Matomo/Piwik": r"matomo|piwik",
            "Plausible": r"plausible\.io",
            "Fathom": r"usefathom\.com",
        }
        for tool_name, pattern in analytics_patterns.items():
            if re.search(pattern, raw_html, re.I):
                result["analytics_tools"].append(tool_name)

        # --- Social profile links detection ---
        social_domains = {
            "facebook": r"(?:facebook\.com|fb\.com)/(?!sharer|share)",
            "twitter": r"(?:twitter\.com|x\.com)/(?!intent|share)",
            "instagram": r"instagram\.com/",
            "linkedin": r"linkedin\.com/(?:company|in)/",
            "youtube": r"youtube\.com/(?:channel|c|@|user)/",
            "tiktok": r"tiktok\.com/@",
            "pinterest": r"pinterest\.com/",
            "github": r"github\.com/(?!login|signup)",
        }
        seen_social = set()
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            for platform, pattern in social_domains.items():
                if platform not in seen_social and re.search(pattern, href, re.I):
                    result["social_profiles"].append({
                        "platform": platform,
                        "url": href
                    })
                    seen_social.add(platform)

        # --- Inline styles count ---
        result["inline_styles_count"] = len(soup.find_all(style=True))

        # --- Deprecated HTML tags ---
        deprecated_tag_names = [
            "font", "center", "marquee", "blink", "big", "strike",
            "tt", "frame", "frameset", "applet", "basefont", "dir",
            "isindex", "menu", "s", "u"
        ]
        dep_counts = {}
        for tag_name in deprecated_tag_names:
            found = soup.find_all(tag_name)
            if found:
                dep_counts[tag_name] = len(found)
        if dep_counts:
            result["deprecated_tags"] = [
                {"tag": k, "count": v} for k, v in dep_counts.items()
            ]

        # --- Flash detection ---
        flash_types = ["application/x-shockwave-flash", "application/x-java-applet"]
        for obj in soup.find_all(["object", "embed"]):
            obj_type = obj.get("type", "")
            if any(ft in obj_type.lower() for ft in flash_types):
                result["has_flash"] = True
                break
            if obj.get("src", "").endswith(".swf"):
                result["has_flash"] = True
                break

        # --- iFrame detection ---
        for iframe in soup.find_all("iframe"):
            result["iframes"].append({
                "src": iframe.get("src", ""),
                "title": iframe.get("title", ""),
            })

        # --- Plaintext email detection ---
        # Get visible text before decompose
        visible_text = soup.get_text(separator=" ", strip=True)
        email_pattern = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'
        found_emails = list(set(re.findall(email_pattern, visible_text)))
        result["plaintext_emails"] = found_emails

        # --- Resource breakdown (JS, CSS, IMG files) ---
        js_files = []
        for s in soup.find_all("script", src=True):
            js_files.append(s["src"])
        result["js_files"] = js_files
        result["resource_breakdown"]["js"] = len(js_files)

        css_files = []
        for link in soup.find_all("link", rel="stylesheet"):
            href = link.get("href", "")
            if href:
                css_files.append(href)
        result["css_files"] = css_files
        result["resource_breakdown"]["css"] = len(css_files)

        img_count = len(soup.find_all("img"))
        result["resource_breakdown"]["img"] = img_count

        # --- Minification heuristic ---
        inline_scripts = soup.find_all("script", src=False)
        inline_styles = soup.find_all("style")

        if inline_scripts:
            total_len = sum(len(s.string or "") for s in inline_scripts)
            total_lines = sum((s.string or "").count("\n") + 1 for s in inline_scripts)
            if total_lines > 0 and total_len > 100:
                avg_line_len = total_len / total_lines
                result["minification_status"]["js_minified"] = avg_line_len > 200
        # Check external JS filenames for .min.
        if js_files:
            min_count = sum(1 for f in js_files if ".min." in f)
            if result["minification_status"]["js_minified"] is None:
                result["minification_status"]["js_minified"] = min_count > len(js_files) * 0.5

        if inline_styles:
            total_len = sum(len(s.string or "") for s in inline_styles)
            total_lines = sum((s.string or "").count("\n") + 1 for s in inline_styles)
            if total_lines > 0 and total_len > 100:
                avg_line_len = total_len / total_lines
                result["minification_status"]["css_minified"] = avg_line_len > 200
        if css_files:
            min_count = sum(1 for f in css_files if ".min." in f)
            if result["minification_status"]["css_minified"] is None:
                result["minification_status"]["css_minified"] = min_count > len(css_files) * 0.5

        # SSR check — must run BEFORE decompose() mutates the tree
        js_app_roots = soup.find_all(
            id=re.compile(r"(app|root|__next|__nuxt)", re.I)
        )

        # Check SSR by measuring content inside framework root divs
        # before decompose() strips elements from the tree
        ssr_check_results = []
        for root_el in js_app_roots:
            inner_text = root_el.get_text(strip=True)
            ssr_check_results.append({
                "id": root_el.get("id", "unknown"),
                "text_length": len(inner_text),
            })

        # Text content — decompose non-content elements (destructive)
        for element in soup.find_all(["script", "style", "nav", "footer", "header"]):
            element.decompose()
        text = soup.get_text(separator=" ", strip=True)
        result["text_content"] = text
        result["word_count"] = len(text.split())

        # Text-to-HTML ratio
        text_len = len(text)
        html_len = len(raw_html) if raw_html else 1
        result["text_to_html_ratio"] = round((text_len / html_len) * 100, 1)

        # Links
        parsed_url = urlparse(url)
        base_domain = parsed_url.netloc
        for link in soup.find_all("a", href=True):
            href = urljoin(url, link["href"])
            link_text = link.get_text(strip=True)
            parsed_href = urlparse(href)
            if parsed_href.netloc == base_domain:
                result["internal_links"].append({"url": href, "text": link_text})
            elif parsed_href.scheme in ("http", "https"):
                result["external_links"].append({"url": href, "text": link_text})

        # Images
        for img in soup.find_all("img"):
            img_data = {
                "src": img.get("src", ""),
                "alt": img.get("alt", ""),
                "width": img.get("width"),
                "height": img.get("height"),
                "loading": img.get("loading"),
            }
            result["images"].append(img_data)

        # SSR assessment — use pre-decompose measurements + overall content
        if js_app_roots:
            for check in ssr_check_results:
                # Only flag as client-rendered if both the root div has
                # minimal content AND the overall page has little text.
                # Sites using SSR/prerendering (WordPress, LiteSpeed Cache,
                # Prerender.io) will have substantial text despite having
                # framework-style root divs.
                if check["text_length"] < 50 and result["word_count"] < 200:
                    result["has_ssr_content"] = False
                    result["errors"].append(
                        f"Possible client-side only rendering detected: "
                        f"#{check['id']} has minimal server-rendered content "
                        f"({result['word_count']} words on page)"
                    )

        # HTTP/2 check
        result["is_http2"] = check_http2(url)

    except requests.exceptions.Timeout:
        result["errors"].append(f"Timeout after {timeout} seconds")
    except requests.exceptions.ConnectionError as e:
        result["errors"].append(f"Connection error: {str(e)}")
    except Exception as e:
        result["errors"].append(f"Unexpected error: {str(e)}")

    return result


def check_http2(url: str) -> bool:
    """Check if server supports HTTP/2 via curl."""
    try:
        result = subprocess.run(
            ["curl", "-sI", "--http2", "-o", "/dev/null", "-w", "%{http_version}", url],
            capture_output=True, text=True, timeout=10
        )
        version = result.stdout.strip()
        return version.startswith("2")
    except Exception:
        return None


def fetch_robots_txt(url: str, timeout: int = 15) -> dict:
    """Fetch and parse robots.txt for AI crawler directives."""
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    ai_crawlers = [
        "GPTBot",
        "OAI-SearchBot",
        "ChatGPT-User",
        "ClaudeBot",
        "anthropic-ai",
        "PerplexityBot",
        "CCBot",
        "Bytespider",
        "cohere-ai",
        "Google-Extended",
        "GoogleOther",
        "Applebot-Extended",
        "FacebookBot",
        "Amazonbot",
    ]

    result = {
        "url": robots_url,
        "exists": False,
        "content": "",
        "ai_crawler_status": {},
        "sitemaps": [],
        "errors": [],
    }

    try:
        response = requests.get(robots_url, headers=DEFAULT_HEADERS, timeout=timeout)

        if response.status_code == 200:
            result["exists"] = True
            result["content"] = response.text

            # Parse for each AI crawler
            lines = response.text.split("\n")
            current_agent = None
            agent_rules = {}

            for line in lines:
                line = line.strip()
                if line.lower().startswith("user-agent:"):
                    current_agent = line.split(":", 1)[1].strip()
                    if current_agent not in agent_rules:
                        agent_rules[current_agent] = []
                elif line.lower().startswith("disallow:") and current_agent:
                    path = line.split(":", 1)[1].strip()
                    agent_rules[current_agent].append(
                        {"directive": "Disallow", "path": path}
                    )
                elif line.lower().startswith("allow:") and current_agent:
                    path = line.split(":", 1)[1].strip()
                    agent_rules[current_agent].append(
                        {"directive": "Allow", "path": path}
                    )
                elif line.lower().startswith("sitemap:"):
                    sitemap_url = line.split(":", 1)[1].strip()
                    # Handle case where "Sitemap:" splits off the "http"
                    if not sitemap_url.startswith("http"):
                        sitemap_url = "http" + sitemap_url
                    result["sitemaps"].append(sitemap_url)

            # Determine status for each AI crawler
            for crawler in ai_crawlers:
                if crawler in agent_rules:
                    rules = agent_rules[crawler]
                    if any(
                        r["directive"] == "Disallow" and r["path"] == "/"
                        for r in rules
                    ):
                        result["ai_crawler_status"][crawler] = "BLOCKED"
                    elif any(
                        r["directive"] == "Disallow" and r["path"] for r in rules
                    ):
                        result["ai_crawler_status"][crawler] = "PARTIALLY_BLOCKED"
                    else:
                        result["ai_crawler_status"][crawler] = "ALLOWED"
                elif "*" in agent_rules:
                    wildcard_rules = agent_rules["*"]
                    if any(
                        r["directive"] == "Disallow" and r["path"] == "/"
                        for r in wildcard_rules
                    ):
                        result["ai_crawler_status"][crawler] = "BLOCKED_BY_WILDCARD"
                    else:
                        result["ai_crawler_status"][crawler] = "ALLOWED_BY_DEFAULT"
                else:
                    result["ai_crawler_status"][crawler] = "NOT_MENTIONED"

        elif response.status_code == 404:
            result["errors"].append("No robots.txt found (404)")
            for crawler in ai_crawlers:
                result["ai_crawler_status"][crawler] = "NO_ROBOTS_TXT"
        else:
            result["errors"].append(
                f"Unexpected status code: {response.status_code}"
            )

    except Exception as e:
        result["errors"].append(f"Error fetching robots.txt: {str(e)}")

    return result


def fetch_llms_txt(url: str, timeout: int = 15) -> dict:
    """Check for llms.txt file."""
    parsed = urlparse(url)
    llms_url = f"{parsed.scheme}://{parsed.netloc}/llms.txt"
    llms_full_url = f"{parsed.scheme}://{parsed.netloc}/llms-full.txt"

    result = {
        "llms_txt": {"url": llms_url, "exists": False, "content": ""},
        "llms_full_txt": {"url": llms_full_url, "exists": False, "content": ""},
        "errors": [],
    }

    for key, check_url in [("llms_txt", llms_url), ("llms_full_txt", llms_full_url)]:
        try:
            response = requests.get(
                check_url, headers=DEFAULT_HEADERS, timeout=timeout
            )
            if response.status_code == 200:
                result[key]["exists"] = True
                result[key]["content"] = response.text
        except Exception as e:
            result["errors"].append(f"Error checking {check_url}: {str(e)}")

    return result


def extract_content_blocks(html: str) -> list:
    """Extract content blocks for citability analysis."""
    soup = BeautifulSoup(html, "lxml")

    # Remove non-content elements
    for element in soup.find_all(
        ["script", "style", "nav", "footer", "header", "aside"]
    ):
        element.decompose()

    blocks = []
    # Extract content sections (between headings)
    current_heading = None
    current_content = []

    for element in soup.find_all(
        ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "table", "blockquote"]
    ):
        tag = element.name

        if tag.startswith("h"):
            # Save previous block
            if current_content:
                text = " ".join(current_content)
                word_count = len(text.split())
                blocks.append(
                    {
                        "heading": current_heading,
                        "content": text,
                        "word_count": word_count,
                        "tag_types": list(
                            set(
                                [
                                    e.name
                                    for e in element.find_all_previous(
                                        ["p", "ul", "ol", "table"]
                                    )
                                ]
                            )
                        ),
                    }
                )
            current_heading = element.get_text(strip=True)
            current_content = []
        else:
            text = element.get_text(strip=True)
            if text:
                current_content.append(text)

    # Don't forget the last block
    if current_content:
        text = " ".join(current_content)
        blocks.append(
            {
                "heading": current_heading,
                "content": text,
                "word_count": len(text.split()),
            }
        )

    return blocks


def crawl_sitemap(url: str, max_pages: int = 50, timeout: int = 15) -> list:
    """Crawl sitemap.xml to discover pages."""
    parsed = urlparse(url)
    sitemap_urls = [
        f"{parsed.scheme}://{parsed.netloc}/sitemap.xml",
        f"{parsed.scheme}://{parsed.netloc}/sitemap_index.xml",
        f"{parsed.scheme}://{parsed.netloc}/sitemap/",
    ]

    discovered_pages = set()

    for sitemap_url in sitemap_urls:
        try:
            response = requests.get(
                sitemap_url, headers=DEFAULT_HEADERS, timeout=timeout
            )
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "lxml")

                # Check for sitemap index
                for sitemap in soup.find_all("sitemap"):
                    loc = sitemap.find("loc")
                    if loc:
                        # Fetch child sitemap
                        try:
                            child_resp = requests.get(
                                loc.text.strip(),
                                headers=DEFAULT_HEADERS,
                                timeout=timeout,
                            )
                            if child_resp.status_code == 200:
                                child_soup = BeautifulSoup(child_resp.text, "lxml")
                                for url_tag in child_soup.find_all("url"):
                                    loc_tag = url_tag.find("loc")
                                    if loc_tag:
                                        discovered_pages.add(loc_tag.text.strip())
                                    if len(discovered_pages) >= max_pages:
                                        break
                        except Exception:
                            pass
                    if len(discovered_pages) >= max_pages:
                        break

                # Direct URL entries
                for url_tag in soup.find_all("url"):
                    loc = url_tag.find("loc")
                    if loc:
                        discovered_pages.add(loc.text.strip())
                    if len(discovered_pages) >= max_pages:
                        break

                if discovered_pages:
                    break

        except Exception:
            continue

    return list(discovered_pages)[:max_pages]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_page.py <url> [mode]")
        print("Modes: page (default), robots, llms, sitemap, blocks, full, extended")
        sys.exit(1)

    target_url = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else "page"

    if mode == "page":
        data = fetch_page(target_url)
    elif mode == "robots":
        data = fetch_robots_txt(target_url)
    elif mode == "llms":
        data = fetch_llms_txt(target_url)
    elif mode == "sitemap":
        pages = crawl_sitemap(target_url)
        data = {"pages": pages, "count": len(pages)}
    elif mode == "blocks":
        response = requests.get(target_url, headers=DEFAULT_HEADERS, timeout=30)
        data = extract_content_blocks(response.text)
    elif mode == "full":
        data = {
            "page": fetch_page(target_url),
            "robots": fetch_robots_txt(target_url),
            "llms": fetch_llms_txt(target_url),
            "sitemap": crawl_sitemap(target_url),
        }
    elif mode == "extended":
        # Full page data with all new detection fields
        page_data = fetch_page(target_url)
        robots_data = fetch_robots_txt(target_url)
        llms_data = fetch_llms_txt(target_url)
        sitemap_data = crawl_sitemap(target_url)
        data = {
            "page": page_data,
            "robots": robots_data,
            "llms": llms_data,
            "sitemap": {"pages": sitemap_data, "count": len(sitemap_data)},
            "extended_summary": {
                "analytics_tools": page_data.get("analytics_tools", []),
                "social_profiles": page_data.get("social_profiles", []),
                "has_favicon": page_data.get("has_favicon", False),
                "inline_styles_count": page_data.get("inline_styles_count", 0),
                "deprecated_tags": page_data.get("deprecated_tags", []),
                "has_flash": page_data.get("has_flash", False),
                "iframes_count": len(page_data.get("iframes", [])),
                "plaintext_emails": page_data.get("plaintext_emails", []),
                "is_http2": page_data.get("is_http2"),
                "has_amp": page_data.get("has_amp", False),
                "resource_breakdown": page_data.get("resource_breakdown", {}),
                "minification_status": page_data.get("minification_status", {}),
                "text_to_html_ratio": page_data.get("text_to_html_ratio", 0),
                "html_size_bytes": page_data.get("html_size_bytes", 0),
                "og_tags": page_data.get("og_tags", {}),
                "twitter_tags": page_data.get("twitter_tags", {}),
                "lang_attribute": page_data.get("lang_attribute"),
                "has_hreflang": page_data.get("has_hreflang", False),
            },
        }
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)

    print(json.dumps(data, indent=2, default=str))
