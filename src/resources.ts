import { ImageSource, Loader, SpriteFont, SpriteSheet } from "excalibur";

// import tiles
import dirt from "./images/tiles/dirt.png";
import grass from "./images/tiles/grass.png";
import water from "./images/tiles/water.png";
import sand from "./images/tiles/sand.png";
import Red from "./images/tiles/red.png";
import Green from "./images/tiles/green.png";
import forest from "./images/tiles/forest.png";

// import buildings
import house1 from "./images/buildings/house1.png";
import blacksmith from "./images/buildings/blacksmith.png";
import bridge from "./images/buildings/bridge.png";
import farm_healthy from "./images/buildings/farm_healthy.png";
import farm_dying from "./images/buildings/farm_dying.png";
import church from "./images/buildings/church.png";

// effects
import lightning from "./images/effects/lightning.png";

// import foliage
import tree1 from "./images/foliage/tree1.png";

// rocks
import rock1 from "./images/rocks/rock1.png";

// font
import font from "./images/font.png";

// import characters
import human from "./images/characters/human.png";

import Depot from "./actors/buildings/depot";
import Building from "./actors/building";
import Rock from "./actors/harvestables/rock";
import Tree from "./actors/harvestables/tree";
import Farm from "./actors/buildings/farm";
import Church from "./actors/buildings/church";

export const Tiles = {
  Dirt: new ImageSource(dirt),
  Grass: new ImageSource(grass),
  Water: new ImageSource(water),
  Sand: new ImageSource(sand),
  Red: new ImageSource(Red),
  Green: new ImageSource(Green),
  Forest: new ImageSource(forest),
} as const;

export const Fonts = {
  main: new ImageSource(font),
} as const;

export const Foliage = {} as const;

export const Harvestables = {
  rock1: {
    img: new ImageSource(rock1),
    type: Rock,
    spawnTags: ["dirt"],
    resourceType: "🪨",
    spawnNum: 5,
  },
  tree1: {
    img: new ImageSource(tree1),
    type: Tree,
    spawnTags: ["grass"],
    resourceType: "🪵",
    spawnNum: 15,
  },
} as const;

export const Characters = {
  Human: new ImageSource(human),
} as const;

export const Effects = {
  Lightning: new ImageSource(lightning),
};

export const Buildings = {
  House1: {
    name: "House",
    img: new ImageSource(house1),
    type: Depot,
    walkability: -1,
    description: "Stores resources",
    cost: new Map([
      ["🪵", 2],
      ["🪨", 2],
    ]),
  },
  Blacksmith: {
    name: "Blacksmith",
    img: new ImageSource(blacksmith),
    type: Building,
    walkability: -1,
    description: "Speeds up gathering",
    cost: new Map([["🪨", 4]]),
  },
  Bridge: {
    name: "Bridge",
    img: new ImageSource(bridge),
    type: Building,
    walkability: 0,
    description: "Allows crossing rivers",
    cost: new Map([["🪵", 1]]),
  },
  Farm: {
    name: "Farm",
    img: new ImageSource(farm_healthy),
    type: Farm,
    walkability: 0,
    description: "Food source for farmers",
    cost: new Map([["🪵", 4]]),
  },
  Church: {
    name: "Church",
    img: new ImageSource(church),
    type: Church,
    walkability: -1,
    description: "Recruit new followers",
    cost: new Map([
      ["🪵", 6],
      ["🪨", 6],
    ]),
  },
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
  spacing: -6,
});

export const loader = new Loader();

// TODO: set loader.logo

for (const res of [
  Object.values(Tiles),
  Object.values(Fonts),
  Object.values(Characters),
  Object.values(Buildings).map((b) => b.img),
  Object.values(Harvestables).map((h) => h.img),
  Object.values(Effects),
].flat()) {
  loader.addResource(res);
}
