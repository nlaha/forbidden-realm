import {
  Actor,
  Animation,
  Query,
  Random,
  range,
  SpriteSheet,
  System,
  SystemType,
  TagQuery,
  Timer,
  vec,
  World,
} from "excalibur";
import { CharacterComponent } from "../components/character";
import LivingComponent from "../components/character"
import HarvestSystem from "./harvest_system";
import DialogueSystem from "./dialogue_system";
import { BuildingComponent } from "../components/building";
import Character from "../actors/character";
import { Effects } from "../resources";
import Building from "../actors/building";
import { mark_tiles_as_solid } from "../utility/utils";

const random = new Random();

const lightningSpriteSheet = SpriteSheet.fromImageSource({
  image: Effects.Lightning,
  grid: {
    rows: 2,
    columns: 3,
    spriteWidth: 128,
    spriteHeight: 128,
  },
});

// display lightning animation
const lightningAnim = Animation.fromSpriteSheet(
  lightningSpriteSheet,
  range(0, 5),
  100
);

class DisasterSystem extends System {
  public systemType = SystemType.Update;

  query: Query<typeof CharacterComponent>;

  buildingQuery: TagQuery<string>;
  world: World;

  constructor(world: World) {
    super();
    this.query = world.query([CharacterComponent]);

    this.world = world;

    this.buildingQuery = world.queryTags(["buildingObject"]);

    // start the timer that starts a disaster every minute
    const timer = new Timer({
      fcn: () => this.startDisaster(),
      repeats: true,
      interval: 45000,
    });

    world.scene.add(timer);

    timer.start();
  }

  update(delta: Number) {}

  public startDisaster() {
    switch (random.d4()) {
      // destroy a random building
      case 1: {
        DialogueSystem.showText("The creations of man shall fall by my hand!");

        // filter out bridges
        const buildings = this.buildingQuery.entities.filter(
          (b) => !(b as Building).hasTag("bridge")
        );
        console.log(buildings);

        if (buildings.length != 0) {
          const building = buildings[
            random.integer(0, buildings.length - 1)
          ] as Building;

          if (building.constructor.name == "Church") {
            for (let entity of this.query.entities) {
              const character = entity as Character;
              character.get(LivingComponent).takeDamage(character.get(LivingComponent).health / 2)
            }
          }

          const lightning = new Actor({
            pos: building.pos.add(vec(0, -20)),
          });
          lightning.graphics.use(lightningAnim);
          this.world.scene.add(lightning);
          lightning.z = 2000;

          const isoMap = building.isoMap;
          building.die();

          lightning.actions
            .delay(1000)
            .callMethod(() => {
              mark_tiles_as_solid(isoMap);
            })
            .die();
        }
        break;
      }

      // kill a random human
      case 2: {
        DialogueSystem.showText("My wrath smites your workers!");
        const humans = this.query.entities;
        if (humans.length != 0) {
          const char = humans[
            random.integer(0, humans.length - 1)
          ] as Character;

          const lightning = new Actor({
            pos: char.pos.add(vec(0, -20)),
          });
          lightning.graphics.use(lightningAnim);
          this.world.scene.add(lightning);
          lightning.actions.delay(1000).die();
          lightning.z = 2000;

          char.die("lightning");
        }
        break;
      }

      // make humans take longer to gather things for 1 minute
      case 3: {
        DialogueSystem.showText(
          "Your people grow tired from the slothful plague."
        );
        HarvestSystem.harvestRate = 2;

        const timer = new Timer({
          fcn: () => (HarvestSystem.harvestRate = 0.75),
          repeats: false,
          interval: 30000,
        });

        this.world.scene.add(timer);

        timer.start();

        break;
      }

      // make humans get hungry faster for 1 minute
      case 4: {
        DialogueSystem.showText(
          "My famine descends upon your devotees. Have they prepared for this?"
        );
        for (let entity of this.query.entities) {
          const character = entity as Character;
          character.hungerRate = 2.5;
        }

        const timer = new Timer({
          fcn: () => {
            for (let entity of this.query.entities) {
              const character = entity as Character;
              character.hungerRate = 1;
            }
          },
          repeats: false,
          interval: 30000,
        });

        this.world.scene.add(timer);

        timer.start();

        break;
      }
    }
  }
}

export default DisasterSystem;
