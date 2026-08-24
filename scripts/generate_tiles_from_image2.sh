#!/bin/bash

# --- Enable exit on error ---
set -e

# --- Argument Handling ---
# Usage: generate_tiles_from_image2.sh <INPUT_FILE> <OUTPUT_DIR>

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

# --- Ensure output directory exists ---
mkdir -p "$OUTPUT_DIR"

# --- Tile Dimensions ---
TILE_WIDTH=200
TILE_HEIGHT=200

# --- Image Dimensions ---
# Get image width and height using ImageMagick
IMAGE_WIDTH=$(magick identify -format "%w" "$INPUT_FILE")
IMAGE_HEIGHT=$(magick identify -format "%h" "$INPUT_FILE")

# --- Calculate split position ---
SPLIT_POSITION=$TILE_WIDTH

# --- Script Execution ---

echo "Processing tiles from $INPUT_FILE..."
echo "Image dimensions: ${IMAGE_WIDTH}x${IMAGE_HEIGHT} pixels"
echo "Split position: $SPLIT_POSITION pixels from the left"

magick \
-verbose \
"$INPUT_FILE" \
-crop "${TILE_WIDTH}x${TILE_HEIGHT}+0+0" +repage \
"$OUTPUT_DIR/00.png"

magick \
-verbose \
"$INPUT_FILE" \
-crop "${TILE_WIDTH}x${TILE_HEIGHT}+$((IMAGE_WIDTH - TILE_WIDTH))+0" +repage \
"$OUTPUT_DIR/01.png"

echo "Done"
