import {
  Actor,
  ActorArgs,
  Engine,
  IsometricEntityComponent,
  IsometricMap,
  vec,
  Vector,
} from "excalibur";
import { Characters, Tiles } from "../resources";
import {
  BrainComponent,
  CharacterComponent,
  LivingComponent,
} from "../components/character_components";
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
    this.graphics.use(Characters.Worker.toSprite());

    // assign custom material for outlines
    this.graphics.material = game.graphicsContext.createMaterial({
      name: "characterMaterial",
      // load from shaders/outline.frag
      fragmentSource: characterFrag,
    });

    // add character name to the graphics
    const nameTag = new NameTag(
      { width: 32, height: 4, pos: vec(0, -10) },
      this.get(CharacterComponent).first_name
    );
    this.addChild(nameTag);
  }

  public update(engine: Engine, delta: number): void {
    super.update(engine, delta);

    if (this.get(LivingComponent).canAct()) {
      this.get(LivingComponent).energy -= 25;

      // get a random tile point
      const random_tile = vec(
        Math.floor(Math.random() * this.isoMap.columns),
        Math.floor(Math.random() * this.isoMap.rows)
      );

      // reroll until we get one that is not solid
      while (this.isoMap.getTile(random_tile.x, random_tile.y)?.solid) {
        random_tile.x = Math.floor(Math.random() * this.isoMap.columns);
        random_tile.y = Math.floor(Math.random() * this.isoMap.rows);
      }

      // get start tile
      const start = this.isoMap.worldToTile(this.pos);

      // find the path to the random tile
      // get main scene
      const scene = game.currentScene as MainScene;
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [start.x, start.y],
        to: [random_tile.x, random_tile.y],
        grid: scene.navgrid ?? [],
      });

      if (path === null) {
        console.warn("No path found");
        return;
      }

      // remove second graphic from tiles
      for (let i = 0; i < this.isoMap.tiles.length; i++) {
        const tile = this.isoMap.tiles[i];
        if (tile.getGraphics().length > 1) {
          tile.removeGraphic(tile.getGraphics()[1]);
        }
      }

      // move along the path
      for (let i = 0; i < path.length; i++) {
        const next_tile_pos = path[i];
        this.actions.easeTo(
          this.isoMap.tileToWorld(vec(next_tile_pos[0], next_tile_pos[1])),
          100
        );
      }
    }

    // we recover energy over time
    this.get(LivingComponent).energy += delta / 100;
  }

  public onInitialize() {}
}

export default Character;
