import {
  Collider,
  Graphic,
  IsometricTile,
  Shape,
  IsometricMap,
  Vector,
  vec,
  Actor,
} from "excalibur";
import { game } from "../main";
import { Grid } from "@evilkiwi/astar";
import MainScene from "../main_scene";
import { Tiles } from "../resources";

/**
 * Spawns N random points on the map, with a minimum distance from the edge of the map
 * @param edge_threshold the minimum distance from the edge of the map
 * @param number the number of points to spawn
 * @param isoMap the isometric map to spawn the points on
 * @param tileTagFilter the tag to filter the tiles by
 * @returns
 */
export function spawner(
  edge_threshold: number,
  number: number,
  isoMap: IsometricMap,
  tileTagFilter: string | undefined = undefined
) {
  // pick N random points on the map
  const points: Set<Vector> = new Set();

  // get all tiles with the given tag
  const tiles = isoMap.tiles.filter((tile) =>
    tileTagFilter ? tile.tags.has(tileTagFilter) : true
  );

  // filter out tiles that are solid
  let filteredTiles = tiles.filter((tile) => !tile.solid);

  // filter out tiles that are too close to the edge
  filteredTiles = filteredTiles.filter(
    (tile) =>
      tile.x > edge_threshold &&
      tile.x < isoMap.columns - edge_threshold &&
      tile.y > edge_threshold &&
      tile.y < isoMap.rows - edge_threshold
  );

  if (filteredTiles.length === 0) {
    console.warn(`No valid tiles found for tag ${tileTagFilter}`);
    return [];
  }

  // pick "number" random tiles
  for (let i = 0; i < number; i++) {
    const start =
      filteredTiles[Math.floor(Math.random() * filteredTiles.length)].pos;
    points.add(start);
  }

  return points;
}

/**
 * Takes an isometric sprite, and computes a collider covering 32x32 tiles on the isometric grid
 * within the bounds of the sprite.
 * @param img
 */
export function compute_iso_collider(img: Graphic): Collider {
  const offset = vec(img.width / 2, img.height / 3);

  const heightScale = img.height / 4;

  const collider = Shape.Polygon([
    vec(0, img.height / 2).sub(offset),
    vec(img.width / 2, -heightScale + img.height / 2).sub(offset),
    vec(img.width, img.height / 2).sub(offset),
    vec(img.width / 2, heightScale + img.height / 2).sub(offset),
  ]);

  return collider;
}

export function mark_tiles_as_solid(isoMap: IsometricMap) {
  // get all colliders
  const colliders = game.currentScene.actors.filter((actor) => actor.collider);

  // get all tiles
  const tiles = isoMap.tiles;

  // for each tile, check if it intersects with any collider
  for (let tile of tiles) {
    for (let collider of colliders) {
      // get world position of tile
      const worldPos = tile.center;

      // check if the collider intersects with the tile
      if (collider.collider.get()?.contains(worldPos)) {
        tile.solid = true;
        (game.currentScene as MainScene).navgrid![tile.y][tile.x] = -1;
      }
    }
  }
}

export function mark_tile_solid_single(isoMap: IsometricMap, actor: Actor) {
  // get all tiles
  const tiles = isoMap.tiles;

  // search in a radius around the actor
  const isoCoords = isoMap.worldToTile(actor.pos);
  const radius = 10;

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      const tile = isoMap.getTile(isoCoords.x + x, isoCoords.y + y);
      if (!tile) {
        continue;
      }
      // check if the collider intersects with the tile
      if (actor.collider.get()?.contains(tile.pos)) {
        tile.solid = true;
        // update navgrid
        (game.currentScene as MainScene).navgrid![tile.y][tile.x] = -1;
      }
    }
  }
}

/**
 * Initializes a navgrid for pathfinding
 * @param isoMap
 * @returns
 */
export function init_navgrid(isoMap: IsometricMap): number[][] {
  const matrix = new Array(isoMap.columns)
    .fill(0)
    .map(() => new Array(isoMap.rows).fill(0));

  return matrix as number[][];
}
