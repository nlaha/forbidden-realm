import { Actor, Collider, Graphic, Shape, vec } from "excalibur";
import { IsometricMap, vec, Vector } from "excalibur";

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
  const points: Vector[] = [];

  // get all tiles with the given tag
  const tiles = isoMap.tiles.filter((tile) =>
    tileTagFilter ? tile.tags.has(tileTagFilter) : true
  );

  // filter out tiles that are too close to the edge
  const filteredTiles = tiles.filter(
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
    points.push(start);
  }

  return points;
}

/**
 * Takes an isometric sprite, and computes a collider covering 32x32 tiles on the isometric grid
 * within the bounds of the sprite.
 * @param img
 */
export function compute_iso_collider(actor: Actor, img: Graphic): Collider {
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
