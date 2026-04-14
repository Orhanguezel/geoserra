#!/bin/bash
# GeoSerra Backend — Python analiz scriptlerini kopyala
# geo-seo-claude scriplerini backend/python/ dizinine bağlar

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PYTHON_DIR="$BACKEND_DIR/python"
# geo-seo-claude, geoserra/ altında yer alıyor (backend ile aynı seviye)
GEO_ROOT="$(dirname "$BACKEND_DIR")/geo-seo-claude"
SOURCE_DIR="$GEO_ROOT/scripts"

echo "Python scriptleri kurulumu..."
echo "Kaynak: $SOURCE_DIR"
echo "Hedef: $PYTHON_DIR"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "HATA: $SOURCE_DIR bulunamadı"
  exit 1
fi

mkdir -p "$PYTHON_DIR"

# Gerekli scriptleri kopyala
SCRIPTS=(
  "lighthouse_checker.py"
  "fetch_page.py"
  "dns_checker.py"
  "performance_analyzer.py"
  "citability_scorer.py"
  "brand_scanner.py"
  "keyword_analyzer.py"
  "llmstxt_generator.py"
  "generate_pdf_report.py"
)

for script in "${SCRIPTS[@]}"; do
  if [ -f "$SOURCE_DIR/$script" ]; then
    cp "$SOURCE_DIR/$script" "$PYTHON_DIR/$script"
    echo "  ✓ $script"
  else
    echo "  ✗ $script (bulunamadı — atlandı)"
  fi
done

# requirements.txt kopyala
if [ -f "$(dirname "$SOURCE_DIR")/requirements.txt" ]; then
  cp "$(dirname "$SOURCE_DIR")/requirements.txt" "$PYTHON_DIR/requirements.txt"
  echo "  ✓ requirements.txt"
fi

# GeoSerra logo kopyala (PDF için)
LOGO_SOURCE="$(dirname "$SOURCE_DIR")/../vps-guezel/geoserra/geoserra2.png"
if [ -f "$LOGO_SOURCE" ]; then
  cp "$LOGO_SOURCE" "$PYTHON_DIR/logo.png"
  echo "  ✓ logo.png"
fi

echo ""
echo "✅ Python kurulumu tamamlandı!"
echo ""
echo "Python bağımlılıklarını yüklemek için:"
echo "  pip install -r $PYTHON_DIR/requirements.txt"
