#!/usr/bin/env bash
# tools/build-scripts.sh
# Simple build script for Ourstrap
# - Minifies css/ourstrap.css -> css/ourstrap.min.css (via postcss)
# - Minifies js/ourstrap.js -> js/ourstrap.min.js (via terser)
# - Produces source maps
# - Copies assets/ and docs/ to dist/
# - Optionally gzips the produced files
#
# Usage:
#   chmod +x tools/build-scripts.sh
#   ./tools/build-scripts.sh        # default: build + copy to dist
#   ./tools/build-scripts.sh --no-gzip

set -euo pipefail

# Project root (parent of tools/)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Project root: $ROOT_DIR"

# Files / paths
CSS_SRC="$ROOT_DIR/css/ourstrap.css"
CSS_DST="$ROOT_DIR/css/ourstrap.min.css"
JS_SRC="$ROOT_DIR/js/ourstrap.js"
JS_DST="$ROOT_DIR/js/ourstrap.min.js"
DIST_DIR="$ROOT_DIR/dist"
ASSETS_DIR="$ROOT_DIR/assets"
DOCS_DIR="$ROOT_DIR/docs"
EXAMPLES_DIR="$ROOT_DIR/examples"

# Flags
GZIP=true
for arg in "$@"; do
  case "$arg" in
    --no-gzip) GZIP=false ;;
  esac
done

# Helpers
require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "✖ Required command not found: $1"
    echo "  Install it (npm packages are preferred locally) e.g.:"
    echo "    npm install --save-dev postcss-cli autoprefixer cssnano terser"
    exit 1
  fi
}

# Ensure source files exist
if [ ! -f "$CSS_SRC" ]; then
  echo "✖ CSS source not found: $CSS_SRC"
  exit 1
fi
if [ ! -f "$JS_SRC" ]; then
  echo "✖ JS source not found: $JS_SRC"
  exit 1
fi

echo "Checking required tools..."
require_cmd npx
require_cmd node

# Build CSS (PostCSS)
echo
echo "⟳ Building CSS → $CSS_DST"
# Use postcss config under tools/ so specify --config
npx postcss "$CSS_SRC" -o "$CSS_DST" --config "$ROOT_DIR/tools" --map
echo "✔ CSS built"

# Build JS (Terser)
echo
echo "⟳ Minifying JS → $JS_DST"
# Create js target directory if not exists
mkdir -p "$(dirname "$JS_DST")"
# Use terser to compress and generate source map
# Output map as separate file: ourstrap.min.js.map
npx terser "$JS_SRC" -c -m --source-map "filename=$(basename "$JS_DST").map" -o "$JS_DST"
echo "✔ JS minified"

# Prepare dist folder
echo
echo "⟳ Preparing $DIST_DIR"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"/{css,js,assets,docs,examples}
# Copy files
cp "$CSS_DST" "$DIST_DIR/css/"
cp "$JS_DST" "$DIST_DIR/js/"
# copy source maps if present
[ -f "${CSS_DST}.map" ] && cp "${CSS_DST}.map" "$DIST_DIR/css/" || true
[ -f "${JS_DST}.map" ] && cp "${JS_DST}.map" "$DIST_DIR/js/" || true

# Copy assets, docs & examples (if exist)
if [ -d "$ASSETS_DIR" ]; then
  cp -r "$ASSETS_DIR" "$DIST_DIR/"
fi
if [ -d "$DOCS_DIR" ]; then
  cp -r "$DOCS_DIR"/* "$DIST_DIR/docs/" || true
fi
if [ -d "$EXAMPLES_DIR" ]; then
  cp -r "$EXAMPLES_DIR"/* "$DIST_DIR/examples/" || true
fi

echo "✔ Files copied to $DIST_DIR"

# Optional gzip
if [ "$GZIP" = true ]; then
  if command -v gzip >/dev/null 2>&1; then
    echo
    echo "⟳ Creating gzip versions (.gz)"
    find "$DIST_DIR" -type f \( -name "*.css" -o -name "*.js" \) -print0 | while IFS= read -r -d '' file; do
      gzip -9 -c "$file" > "${file}.gz"
      echo "  - ${file}.gz"
    done
    echo "✔ gzip created"
  else
    echo "⚠ gzip not found — skipping gzip step"
  fi
else
  echo "⚑ gzip step skipped (use --no-gzip to skip)"
fi

echo
echo "✔ Build complete!"
echo "Output: $DIST_DIR"
echo "Tip: serve with a static server for testing, e.g.:"
echo "  npx http-server $DIST_DIR -c-1 -p 8080"

exit 0
