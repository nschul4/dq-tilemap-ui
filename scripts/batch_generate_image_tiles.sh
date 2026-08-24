# Define the script directory
SCRIPT_DIR=$(dirname "$0")

# Define the project root directory
BASEDIR=$(dirname "$SCRIPT_DIR")

# Define the input directory
INPUT_DIR="$BASEDIR/images/original"

# Define the output directory
OUTPUT_DIR="$BASEDIR/images/tiles"

# Define a list of filenames
filenames=(
dchoaub-a8c150c3-f229-4127-a85a-6f23fcef5dfd.png
dchob0p-7a5cac09-3da7-438a-a68b-8feccc017615.png
dchob7c-3d8940d5-e7ed-4e42-8c01-cf9297b17775.png
dchuces-923abbb0-2331-434e-851e-0cc19f61d2ba.png
dchv2xb-891ab3f8-1d54-4549-89b9-915907c3f031.png
dchyawr-776424c9-78c2-4311-b2a2-fd6186a53b49.png
dci91iz-40b4f0ae-7e4a-42dd-90b0-b3ebaf90fce4.png
dcii6b4-7b7a6615-f179-4783-9a5a-d73c79026d22.png
dcizgt9-df025130-02d7-4c89-b78f-f3bbac994e5d.png
)

for filename in "${filenames[@]}"; do
    image="$INPUT_DIR/$filename"
    
    # Check if the image exists
    if [ ! -f "$image" ]; then
        echo "Error: Image '$image' does not exist."
        exit 1
    fi

    # Create a unique output directory for each image
    tile_output_dir="$OUTPUT_DIR/$(basename "$image" .png)"
    
    # Check if the output directory exists, clean and create it if not
    if [ -d "$tile_output_dir" ]; then
        rm -rf "$tile_output_dir"
    fi
    mkdir -p "$tile_output_dir"

    # Call the subscript with the unique output directory
    "$SCRIPT_DIR/generate_tiles_from_image.sh" "$image" "$tile_output_dir"
done
