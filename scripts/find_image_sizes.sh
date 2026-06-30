#!/bin/bash

# --- Enable exit on error ---
set -e

# --- Directory Configuration ---
IMAGE_DIR="images/"

# --- Check if ImageMagick is installed ---
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick (magick) is not installed. Please install it first."
    exit 1
fi

# --- Check if the directory exists ---
if [ ! -d "$IMAGE_DIR" ]; then
    echo "Error: Directory '$IMAGE_DIR' does not exist."
    exit 1
fi

# --- List image files and their dimensions ---
echo "Listing image files in '$IMAGE_DIR' and their dimensions:"
echo "----------------------------------------"

# Find all image files in the directory and process them
find "$IMAGE_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" \) | while read -r image_file; do
    # Get dimensions using magick
    dimensions=$(magick identify -format "%wx%h" "$image_file" 2>/dev/null)

    if [ -n "$dimensions" ]; then
        echo "File: $image_file | Dimensions: $dimensions"
    else
        echo "File: $image_file | Could not determine dimensions"
    fi
done

echo "----------------------------------------"
echo "Done"
