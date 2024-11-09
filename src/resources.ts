import { ImageSource, Loader } from "excalibur";

// import tiles
import dirt from "./images/tiles/dirt.png";
import grass from "./images/tiles/grass.png";
import water from "./images/tiles/water.png";

// import buildings
import house1 from "./images/buildings/house1.png";

export const Tiles = {
  Dirt: new ImageSource(dirt),
  Grass: new ImageSource(grass),
  Water: new ImageSource(water),
} as const;

export const Buildings = {
  House1: new ImageSource(house1),
} as const;

export const loader = new Loader();

// TODO: set loader.logo

for (const res of [Object.values(Tiles), Object.values(Buildings)].flat()) {
  loader.addResource(res);
}
