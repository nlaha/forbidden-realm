import {
  Collider,
  Graphic,
  IsometricTile,
  Shape,
  IsometricMap,
  Vector,
  vec,
  Actor,
  Entity,
  TransformComponent,
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
  tileTagFilter: string | undefined | readonly string[] = undefined
) {
  // pick N random points on the map
  const points: Set<Vector> = new Set();

  const tileTagsArray = Array.isArray(tileTagFilter)
    ? tileTagFilter
    : [tileTagFilter];

  // get all tiles with one of the tags
  const tiles = isoMap.tiles.filter((tile) => {
    if (!tileTagsArray) {
      return true;
    }
    return tileTagsArray.some((tag) => tile.tags.has(tag as string));
  });

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
    if (tile.hasTag("building")) {
      tile.removeTag("building");
    }

    // water is also -1
    if (tile.tags.has("water")) {
      (game.currentScene as MainScene).navgrid![tile.y][tile.x] = -1;
      //tile.addGraphic(Tiles.Red.toSprite());
      continue;
    }

    let isSolid = false;
    for (let collider of colliders) {
      // get world position of tile
      const worldPos = tile.center;

      // check if the collider intersects with the tile
      if (collider.collider.get()?.contains(worldPos)) {
        isSolid = true;
        //tile.addGraphic(Tiles.Red.toSprite());
      }
    }

    if (isSolid) {
      tile.solid = true;
      (game.currentScene as MainScene).navgrid![tile.y][tile.x] = -1;
      tile.addGraphic(Tiles.Red.toSprite());
    } else {
      tile.solid = false;
      (game.currentScene as MainScene).navgrid![tile.y][tile.x] = 0;
      tile.addGraphic(Tiles.Green.toSprite());
    }
  }
}

export function mark_tile_solid_single(
  isoMap: IsometricMap,
  actor: Actor,
  walkability: number
) {
  // get all tiles
  const tiles = isoMap.tiles;

  // search in a radius around the actor
  const isoCoords = isoMap.worldToTile(actor.pos);
  const radius = 10;
  const tilesToMark: IsometricTile[] = [];

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      const tile = isoMap.getTile(isoCoords.x + x, isoCoords.y + y);
      if (!tile) {
        continue;
      }
      // check if the collider intersects with the tile
      if (actor.collider.get()?.contains(tile.pos)) {
        tilesToMark.push(tile);
      }
    }
  }

  // if any of the tiles to mark are solid, return false
  for (let tile of tilesToMark) {
    if ((tile.solid && !tile.tags.has("water")) || tile.tags.has("building")) {
      console.log(
        `Can't place building because of the following state: ${
          tile.solid
        }, ${tile.tags.has("building")}, ${tile.tags.has("water")}`
      );
      return false;
    }
  }

  for (let tile of tilesToMark) {
    tile.solid = walkability === -1;
    tile.addTag("building");
    // update navgrid
    (game.currentScene as MainScene).navgrid![tile.y][tile.x] = walkability;
    //tile.addGraphic(Tiles.Red.toSprite());
  }

  return true;
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

/**
 * Finds the entity closest to a reference position
 * @param reference_entity the reference entity
 * @param entities the entities to search
 * @returns
 */
export function closest_entity(reference_entity: Entity, entities: Entity[]) {
  let closest_entity: Entity | null = null;
  let closest_distance = Number.MAX_VALUE;

  const reference_pos = reference_entity.get(TransformComponent)?.pos;

  for (let entity of entities) {
    const pos = entity.get(TransformComponent)?.pos;
    if (!pos) {
      continue;
    }

    const distance = pos.distance(reference_pos);
    if (distance < closest_distance) {
      closest_distance = distance;
      closest_entity = entity;
    }
  }

  return closest_entity;
}
