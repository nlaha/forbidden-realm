import { ImageSource, Loader, SpriteFont, SpriteSheet } from "excalibur";

// import tiles
import dirt from "./images/tiles/dirt.png";
import grass from "./images/tiles/grass.png";
import water from "./images/tiles/water.png";
import sand from "./images/tiles/sand.png";

// import buildings
import house1 from "./images/buildings/house1.png";
import wall_left from "./images/buildings/wall_left.png";

// import foliage
import tree1 from "./images/foliage/tree1.png";
import tree2 from "./images/foliage/tree2.png";
import tree3 from "./images/foliage/tree3.png";
import rock1 from "./images/foliage/rock1.png";

// font
import font from "./images/font.png";

// import characters
import worker from "./images/characters/worker.png";

export const Tiles = {
  Dirt: new ImageSource(dirt),
  Grass: new ImageSource(grass),
  Water: new ImageSource(water),
  Sand: new ImageSource(sand),
} as const;

export const Buildings = {
  House1: new ImageSource(house1),
  WallLeft: new ImageSource(wall_left),
} as const;

export const Fonts = {
  main: new ImageSource(font),
} as const;

export const Foliage = {
  tree1: new ImageSource(tree1),
  tree2: new ImageSource(tree2),
  tree3: new ImageSource(tree3),
} as const;

export const Harvestables = {
  rock1: new ImageSource(rock1),
} as const;

export const Characters = {
  Worker: new ImageSource(worker),
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
