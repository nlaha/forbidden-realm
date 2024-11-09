import { Actor, Collider, Graphic, Shape, vec } from "excalibur";

/**
 * Takes an isometric sprite, and computes a collider covering 32x32 tiles on the isometric grid
 * within the bounds of the sprite.
 * @param img
 */
export function compute_iso_collider(actor: Actor, img: Graphic): Collider {
  const offset = vec(img.width / 2, img.height / 3);

  const collider = Shape.Polygon([
    vec(0, img.height / 2).sub(offset),
    vec(img.width / 2, -32 + img.height / 2).sub(offset),
    vec(img.width, img.height / 2).sub(offset),
    vec(img.width / 2, 32 + img.height / 2).sub(offset),
  ]);

  return collider;
}
