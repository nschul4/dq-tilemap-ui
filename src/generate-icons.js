import sharp from "sharp";

const SVG_PATH = "./images/icons/icon.svg";

sharp(SVG_PATH)
  .resize(192, 192)
  .toFile("./images/icons/icon-192.png")
  .then(() => console.log("✅ Generated icon-192.png"))
  .catch((err) => console.error(err));

sharp(SVG_PATH)
  .resize(512, 512)
  .toFile("./images/icons/icon-512.png")
  .then(() => console.log("✅ Generated icon-512.png"))
  .catch((err) => console.error(err));
