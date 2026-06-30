#!/bin/bash

# --- Enable exit on error ---
set -e

# --- Argument Handling ---
# Usage: generate_tiles_from_image.sh <INPUT_FILE> <OUTPUT_DIR>

if [ -z "$1" ]; then
    echo "Please provide the path to the input image."
    echo "Usage: $0 <INPUT_FILE> <OUTPUT_DIR>"
    exit 1
fi

if [ -z "$2" ]; then
    echo "Please provide the output directory."
    echo "Usage: $0 <INPUT_FILE> <OUTPUT_DIR>"
    exit 1
fi

# --- Configuration Variables ---
INPUT_FILE=$1
OUTPUT_DIR=$2

TILE_WIDTH=200
TILE_HEIGHT=200

# --- Margin/Offset Variables ---
# How many pixels to chop off the Left (X) and Top (Y) before slicing
START_X=63
START_Y=30
# --- Grid Constraints (To prevent overflow tiles) ---
COLUMNS=5
ROWS=3

# Calculate total bounding box dimensions
GRID_WIDTH=$((COLUMNS * TILE_WIDTH))
GRID_HEIGHT=$((ROWS * TILE_HEIGHT))

# --- Script Execution ---

echo "Processing tiles from $INPUT_FILE..."
echo "Slicing size set to: ${TILE_WIDTH}x${TILE_HEIGHT} pixels"

# 1. -chop removes the initial top/left margins
# 2. The first -crop (+0+0 forces it to crop exactly once from the top-left)
# 3. The second -crop splits that perfect box into individual tiles
magick \
-verbose \
"$INPUT_FILE" \
-chop "${START_X}x${START_Y}" +repage \
-crop "${GRID_WIDTH}x${GRID_HEIGHT}+0+0" +repage \
-crop "${TILE_WIDTH}x${TILE_HEIGHT}" +repage \
"$OUTPUT_DIR/%02d.png"

echo "Done"
