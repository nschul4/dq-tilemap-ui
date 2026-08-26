import sharp from "sharp";

const SVG_PATH = "./icon.svg";

sharp(SVG_PATH)
    .resize(192, 192)
    .toFile("./icon-192.png")
    .then(() => console.log("✅ Generated icon-192.png"))
    .catch((err) => console.error(err));

sharp(SVG_PATH)
    .resize(512, 512)
    .toFile("./icon-512.png")
    .then(() => console.log("✅ Generated icon-512.png"))
    .catch((err) => console.error(err));
