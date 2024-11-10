import {
  Actor,
  Animation,
  Query,
  Random,
  range,
  SpriteSheet,
  System,
  SystemType,
  Timer,
  TransformComponent,
  vec,
  World,
} from "excalibur";
import {
  CharacterComponent,
  LivingComponent,
  NeighborsComponent,
} from "../components/character";
import HarvestSystem from "./harvest_system";
import { InventoryComponent } from "../components/inventory";
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

  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof NeighborsComponent
    | typeof LivingComponent
  >;

  buildingQuery: Query<typeof BuildingComponent>;
  world: World;

  constructor(world: World) {
    super();
    this.query = world.query([
      CharacterComponent,
      InventoryComponent,
      NeighborsComponent,
      LivingComponent,
    ]);

    this.world = world;

    this.buildingQuery = world.query([BuildingComponent]);

    // start the timer that starts a disaster every minute
    const timer = new Timer({
      fcn: () => this.startDisaster(),
      repeats: true,
      interval: 60000,
    });

    world.scene.add(timer);

    timer.start();
  }

  update(delta: Number) {}

  public startDisaster() {
    switch (random.d4()) {
      // destroy a random building
      case 1: {
        console.log("DISASTER: BUILDING DESTRUCTION");
        const buildings = this.buildingQuery.entities;
        if (buildings.length != 0) {
          const building = buildings[
            random.integer(0, buildings.length - 1)
          ] as Building;

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
      }

      // kill a random human
      case 2: {
        console.log("DISASTER: SMITE HUMAN");
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
      }

      // make humans take longer to gather things for 1 minute
      case 3: {
        console.log("DISASTER: SLOTH PLAGUE");
        HarvestSystem.harvestRate = 2;

        const timer = new Timer({
          fcn: () => (HarvestSystem.harvestRate = 1),
          repeats: false,
          interval: 60000,
        });

        this.world.scene.add(timer);

        timer.start();
      }

      // make humans get hungry faster for 1 minute
      case 4: {
        console.log("DISASTER: FAMINE");
        for (let entity of this.query.entities) {
          const character = entity as Character;
          character.hungerRate = 2;
        }

        const timer = new Timer({
          fcn: () => {
            for (let entity of this.query.entities) {
              const character = entity as Character;
              character.hungerRate = 2;
            }
          },
          repeats: false,
          interval: 60000,
        });

        this.world.scene.add(timer);

        timer.start();
      }
    }
  }
}

export default DisasterSystem;
