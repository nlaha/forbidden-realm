import {
  Actor,
  ActorArgs,
  Engine,
  IsometricEntityComponent,
  IsometricMap,
  SpriteSheet,
  vec,
  Vector,
} from "excalibur";
import { Characters, Tiles } from "../resources";
import {
  BrainComponent,
  CharacterComponent,
  CharacterState,
  InventoryComponent,
  LivingComponent,
  VisionComponent,
} from "../components/character";
import { game } from "../main";

import characterFrag from "../shaders/character.frag";
import MainScene from "../main_scene";
import { search } from "@evilkiwi/astar";
import NameTag from "./nametag";

const DIRECTIONS = {
  north: vec(0, 1),
  south: vec(0, -1),
  east: vec(1, 0),
  west: vec(-1, 0),
};

// static var for currently selected character
let selectedCharacter: Character | null = null;

class Character extends Actor {
  isoMap: IsometricMap;

  constructor(isoMap: IsometricMap, config: ActorArgs) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.addComponent(new LivingComponent());
    this.addComponent(new BrainComponent());
    this.addComponent(new CharacterComponent());
    this.addComponent(new InventoryComponent());
    this.addComponent(new VisionComponent());

    const spriteSheet = SpriteSheet.fromImageSource({
      image: Characters.Human,
      grid: {
        rows: 4,
        columns: 1,
        spriteWidth: 32,
        spriteHeight: 48,
      },
    });

    this.graphics.use(spriteSheet.getSprite(0, 0));

    // add character name to the graphics
    const nameTag = new NameTag(
      { width: 32, height: 4, pos: vec(0, -20) },
      this.get(CharacterComponent).first_name
    );
    this.addChild(nameTag);
  }

  public update(engine: Engine, delta: number): void {
    super.update(engine, delta);

    // we recover energy over time
    this.get(LivingComponent).energy += delta / 100;

    if (this.get(CharacterComponent).state === CharacterState.WALKING) {
      // if we're walking, check if we're done
      if (this.actions.getQueue().isComplete()) {
        this.get(CharacterComponent).state = CharacterState.IDLE;
      }
    }
  }

  public walkTo(target: Vector): void {
    // get start tile
    const start = this.isoMap.worldToTile(this.pos);
    const end = this.isoMap.worldToTile(target);

    // console.log(`Walking from ${start.x}, ${start.y} to ${end.x}, ${end.y}`);

    // check if there's a tile on the end position
    const endTile = this.isoMap.getTile(end.x, end.y);
    if (!endTile) {
      console.warn("No tile found at target position");
      return;
    }

    // if end isn't walkable, find the nearest walkable tile
    // searching out in the spiral pattern from the target tile
    const maxRadius = 10;
    let found = false;
    for (let radius = 1; radius < maxRadius; radius++) {
      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          // check if we're on the edge
          if (Math.abs(x) === radius || Math.abs(y) === radius) {
            const tile = this.isoMap.getTile(end.x + x, end.y + y);
            if (tile && tile.solid === false) {
              end.x += x;
              end.y += y;
              found = true;
              break;
            }
          }
        }
        if (found) {
          break;
        }
      }
      if (found) {
        break;
      }
    }

    // find the path to the random tile
    // get main scene
    const scene = game.currentScene as MainScene;
    const path = search({
      cutCorners: false,
      diagonal: false,
      from: [start.x, start.y],
      to: [end.x, end.y],
      grid: scene.navgrid ?? [],
    });

    if (path === null) {
      console.warn("No path found");
      return;
    }

    // check if we have enough energy to walk the path
    if (this.get(LivingComponent).energy < path.length) {
      console.warn("Not enough energy to walk the path");
      return;
    }

    // subtract energy depending on path length
    this.get(LivingComponent).energy -= path.length;

    // move along the path
    for (let i = 0; i < path.length; i++) {
      const next_tile_pos = path[i];
      this.actions.easeTo(
        this.isoMap.tileToWorld(vec(next_tile_pos[0], next_tile_pos[1])),
        100
      );
    }
  }

  public onInitialize() {}
}

export default Character;
