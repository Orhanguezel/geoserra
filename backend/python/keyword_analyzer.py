#!/usr/bin/env python3
"""
Keyword consistency analyzer for GEO-SEO audit.
Extracts keywords from page elements and shows distribution across
title, meta description, headings, and body content.
"""

import sys
import json
import re
from collections import Counter
from urllib.parse import urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Required packages not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

# Turkish + English stopwords (no NLTK dependency)
STOPWORDS = {
    # English
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "can", "shall", "it", "its", "this", "that", "these", "those",
    "i", "you", "he", "she", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "our", "their", "what", "which", "who", "whom",
    "not", "no", "so", "if", "as", "up", "out", "about", "into", "over",
    "after", "before", "between", "under", "again", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "than", "too", "very",
    "just", "also",
    # Turkish
    "bir", "ve", "bu", "da", "de", "ile", "için", "icin", "ise", "gibi",
    "daha", "en", "çok", "cok", "her", "ne", "ya", "mi", "mu", "mü", "mı",
    "var", "yok", "olan", "olarak", "kadar", "sonra", "önce", "once",
    "ama", "ancak", "fakat", "hem", "ya da", "veya", "ki", "den", "dan",
    "nin", "nın", "nun", "nün", "ın", "in", "un", "ün", "dır", "dir",
    "tır", "tir", "tur", "tür", "dur", "dür",
}

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
}


def tokenize(text: str) -> list:
    """Clean and tokenize text into words."""
    text = text.lower()
    text = re.sub(r'[^\w\sğüşöçıİĞÜŞÖÇ]', ' ', text)
    words = text.split()
    return [w for w in words if w not in STOPWORDS and len(w) > 2]


def extract_ngrams(words: list, n: int) -> list:
    """Extract n-grams from word list."""
    return [" ".join(words[i:i+n]) for i in range(len(words) - n + 1)]


def analyze_keywords(url: str, timeout: int = 30) -> dict:
    """Analyze keyword consistency across page elements."""
    result = {
        "url": url,
        "title": "",
        "description": "",
        "h1": [],
        "headings": [],
        "keywords": [],
        "phrases": [],
        "consistency_score": 0,
        "errors": [],
    }

    try:
        response = requests.get(url, headers=DEFAULT_HEADERS, timeout=timeout)
        soup = BeautifulSoup(response.text, "lxml")

        # Extract elements
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        result["title"] = title_text

        desc_meta = soup.find("meta", attrs={"name": "description"})
        desc_text = desc_meta.get("content", "") if desc_meta else ""
        result["description"] = desc_text

        h1_tags = [h.get_text(strip=True) for h in soup.find_all("h1")]
        result["h1"] = h1_tags
        h1_text = " ".join(h1_tags)

        heading_tags = []
        for level in range(1, 7):
            for h in soup.find_all(f"h{level}"):
                heading_tags.append(h.get_text(strip=True))
        result["headings"] = heading_tags
        headings_text = " ".join(heading_tags)

        # Body text (excluding nav, footer, header, script, style)
        for el in soup.find_all(["script", "style", "nav", "footer", "header"]):
            el.decompose()
        body_text = soup.get_text(separator=" ", strip=True)

        # Tokenize each zone
        title_words = tokenize(title_text)
        desc_words = tokenize(desc_text)
        h1_words = tokenize(h1_text)
        heading_words = tokenize(headings_text)
        body_words = tokenize(body_text)

        # Count body word frequency
        body_counter = Counter(body_words)

        # Get top keywords by body frequency (top 15)
        top_keywords = body_counter.most_common(15)

        # Build keyword matrix
        keyword_matrix = []
        for word, freq in top_keywords:
            entry = {
                "keyword": word,
                "in_title": word in title_words,
                "in_description": word in desc_words,
                "in_h1": word in h1_words,
                "in_headings": word in heading_words,
                "body_frequency": freq,
            }
            keyword_matrix.append(entry)
        result["keywords"] = keyword_matrix

        # Phrase analysis (bigrams)
        body_bigrams = extract_ngrams(body_words, 2)
        bigram_counter = Counter(body_bigrams)
        top_phrases = bigram_counter.most_common(10)

        title_bigrams = set(extract_ngrams(title_words, 2))
        desc_bigrams = set(extract_ngrams(desc_words, 2))
        heading_bigrams = set(extract_ngrams(heading_words, 2))

        phrase_matrix = []
        for phrase, freq in top_phrases:
            if freq < 2:
                continue
            entry = {
                "phrase": phrase,
                "in_title": phrase in title_bigrams,
                "in_description": phrase in desc_bigrams,
                "in_headings": phrase in heading_bigrams,
                "body_frequency": freq,
            }
            phrase_matrix.append(entry)
        result["phrases"] = phrase_matrix

        # Calculate consistency score (0-100)
        if keyword_matrix:
            total_score = 0
            for kw in keyword_matrix[:10]:  # Score top 10
                kw_score = 0
                if kw["in_title"]:
                    kw_score += 25
                if kw["in_description"]:
                    kw_score += 20
                if kw["in_h1"]:
                    kw_score += 20
                if kw["in_headings"]:
                    kw_score += 20
                if kw["body_frequency"] >= 3:
                    kw_score += 15
                elif kw["body_frequency"] >= 1:
                    kw_score += 10
                total_score += kw_score
            result["consistency_score"] = round(total_score / min(len(keyword_matrix), 10))

    except Exception as e:
        result["errors"].append(f"Error analyzing {url}: {str(e)}")

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python keyword_analyzer.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    data = analyze_keywords(url)
    print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
