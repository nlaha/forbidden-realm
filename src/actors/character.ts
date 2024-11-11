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
  CharacterRole,
  CharacterState,
  LivingComponent,
  NeighborsComponent,
  VisionComponent,
} from "../components/character";
import { InventoryComponent } from "../components/inventory";
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

const spriteSheet = SpriteSheet.fromImageSource({
  image: Characters.Human,
  grid: {
    rows: 1,
    columns: 4,
    spriteWidth: 32,
    spriteHeight: 48,
  },
});

// static var for currently selected character
let selectedCharacter: Character | null = null;

class Character extends Actor {
  isoMap: IsometricMap;
  moveSpeedMs: number = 100;
  hungerRate: number = 1;

  constructor(isoMap: IsometricMap, config: ActorArgs) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.addComponent(new LivingComponent());
    this.addComponent(new BrainComponent());
    this.addComponent(new CharacterComponent());
    this.addComponent(new InventoryComponent());
    this.addComponent(new VisionComponent());
    this.addComponent(new NeighborsComponent());

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

    if (this.vel.x > 0) {
      if (this.vel.y > 0) {
        this.graphics.use(spriteSheet.getSprite(1, 0));
      } else {
        this.graphics.use(spriteSheet.getSprite(3, 0));
      }
    } else if (this.vel.x < 0) {
      if (this.vel.y > 0) {
        this.graphics.use(spriteSheet.getSprite(0, 0));
      } else {
        this.graphics.use(spriteSheet.getSprite(2, 0));
      }
    }

    // every second the character isn't idle, they lose 1 food
    if (this.get(CharacterComponent).state !== CharacterState.IDLE) {
      this.get(LivingComponent).starve((delta / 2000) * this.hungerRate);
    }

    // if the character is hungry, they move slower
    if (this.get(LivingComponent).isHungry()) {
      this.moveSpeedMs = 500;
    } else {
      this.moveSpeedMs = 250;
    }

    // every second the character is starving, they lose 5 health
    if (this.get(LivingComponent).isStarving()) {
      this.get(LivingComponent).takeDamage((delta / 1000) * 5);
    }

    // if the character is dead, remove them from the scene
    if (this.get(LivingComponent).isDead()) {
      // try to determine the cause of death
      let cause = "unknown";
      const food = this.get(LivingComponent).food;

      if (food <= 0) {
        cause = "starvation";
      }

      this.die(cause);
    }
  }

  public die(cause: string) {
    // add their death to the scene
    (this.scene as MainScene).deaths.push({
      name: this.get(CharacterComponent).first_name,
      cause: `Died by ${cause}`,
    });
    this.get(CharacterComponent).state = CharacterState.DEAD;
    (this.scene as MainScene).status_table.deleteRow(this.id);

    // remove all items from inventory
    this.get(InventoryComponent).clearInventory();

    this.kill();
  }

  public walkTo(target: Vector): void {
    this.get(CharacterComponent).state = CharacterState.WALKING;

    // if we currently have actions queued up, cancel them.
    this.actions.clearActions();

    // get start tile
    const start = this.isoMap.worldToTile(this.pos);
    const end = this.isoMap.worldToTile(target);

    // console.log(`Walking from ${start.x}, ${start.y} to ${end.x}, ${end.y}`);

    // check if there's a tile on the end position
    const endTile = this.isoMap.getTile(end.x, end.y);
    if (!endTile) {
      console.warn("No tile found at target position");
      this.get(CharacterComponent).state = CharacterState.IDLE;
      return;
    }

    // if end isn't walkable, find the nearest walkable tile
    // searching out in the spiral pattern from the target tile
    const maxRadius = 25;
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

    if (scene.navgrid === null) {
      console.warn("No navgrid found in scene");

      this.get(CharacterComponent).state = CharacterState.IDLE;
      return;
    }

    const path = search({
      cutCorners: true,
      diagonal: false,
      from: [start.x, start.y],
      to: [end.x, end.y],
      grid: scene.navgrid ?? [],
    });

    if (path === null) {
      // console.warn(
      //   `No path found for ${
      //     this.get(CharacterComponent).first_name
      //   } going from ${start.x}, ${start.y} to ${end.x}, ${end.y}`
      // );

      this.get(CharacterComponent).state = CharacterState.IDLE;
      return;
    }

    // move along the path
    for (let i = 0; i < path.length; i++) {
      const next_tile_pos = path[i];
      this.actions.easeTo(
        this.isoMap.tileToWorld(vec(next_tile_pos[0], next_tile_pos[1])),
        this.moveSpeedMs
      );
    }

    this.actions.callMethod(() => {
      this.get(CharacterComponent).state = CharacterState.IDLE;
    });
  }

  public onInitialize() {}
}

export default Character;
