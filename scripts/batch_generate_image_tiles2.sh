# Define the script directory
SCRIPT_DIR=$(dirname "$0")

# Define the project root directory
BASEDIR=$(dirname "$SCRIPT_DIR")

# Define the input directory
INPUT_DIR="$BASEDIR/images/original"

# Define a list of filenames
filenames=(
dcjcrw6-ce1b0253-3fe1-4b21-9d90-58719ae20e30.png
)

for filename in "${filenames[@]}"; do
    image="$INPUT_DIR/$filename"
    
    # Check if the image exists
    if [ ! -f "$image" ]; then
        echo "Error: Image '$image' does not exist."
        exit 1
    fi

    # Create a unique output directory for each image
    OUTPUT_DIR="$BASEDIR/images/tiles2/$(basename "$image" .png)"
    
    # Check if the output directory exists, clean and create it if not
    if [ -d "$OUTPUT_DIR" ]; then
        rm -rf "$OUTPUT_DIR"
    fi
    mkdir -p "$OUTPUT_DIR"

    # Call the subscript with the unique output directory
    "$SCRIPT_DIR/generate_tiles_from_image2.sh" "$image" "$OUTPUT_DIR"
done
