import { ImageSource, Loader, SpriteFont, SpriteSheet } from "excalibur";

// import tiles
import dirt from "./images/tiles/dirt.png";
import grass from "./images/tiles/grass.png";
import water from "./images/tiles/water.png";

// import buildings
import house1 from "./images/buildings/house1.png";

// font
import font from "./images/font.png";

export const Tiles = {
  Dirt: new ImageSource(dirt),
  Grass: new ImageSource(grass),
  Water: new ImageSource(water),
} as const;

export const Buildings = {
  House1: new ImageSource(house1),
} as const;

export const Fonts = {
  main: new ImageSource(font),
} as const;

const spriteFontSheet = SpriteSheet.fromImageSource({
  image: Fonts.main,
  grid: {
    rows: 3,
    columns: 16,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

export const spriteFont = new SpriteFont({
  alphabet: "0123456789abcdefghijklmnopqrstuvwxyz,!'&.\"?- ",
  caseInsensitive: true,
  spriteSheet: spriteFontSheet,
});

export const loader = new Loader();

// TODO: set loader.logo

for (const res of [
  Object.values(Tiles),
  Object.values(Buildings),
  Object.values(Fonts),
].flat()) {
  loader.addResource(res);
}
