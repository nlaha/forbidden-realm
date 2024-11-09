import { ImageSource, Loader, SpriteFont, SpriteSheet } from "excalibur";

// import tiles
import dirt from "./images/tiles/dirt.png";
import grass from "./images/tiles/grass.png";
import water from "./images/tiles/water.png";
import sand from "./images/tiles/sand.png";

// import buildings
import house1 from "./images/buildings/house1.png";
import blacksmith from "./images/buildings/blacksmith.png";
import wall_left from "./images/buildings/wall_left.png";

// import foliage
import tree1 from "./images/foliage/tree1.png";

// rocks
import rock1 from "./images/rocks/rock1.png";

// font
import font from "./images/font.png";

// import characters
import human from "./images/characters/human.png";

export const Tiles = {
  Dirt: new ImageSource(dirt),
  Grass: new ImageSource(grass),
  Water: new ImageSource(water),
  Sand: new ImageSource(sand),
} as const;

export const Buildings = {
  House1: new ImageSource(house1),
  Blacksmith: new ImageSource(blacksmith),
  WallLeft: new ImageSource(wall_left),
} as const;

export const Fonts = {
  main: new ImageSource(font),
} as const;

export const Foliage = {
  tree1: new ImageSource(tree1),
} as const;

export const Harvestables = {
  rock1: new ImageSource(rock1),
} as const;

export const Characters = {
  Human: new ImageSource(human),
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
  Object.values(Foliage),
  Object.values(Characters),
  Object.values(Harvestables),
].flat()) {
  loader.addResource(res);
}
