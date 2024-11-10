import {
	Query,
	Random,
  System,
	SystemType,
	Timer,
	TransformComponent,
	World,
} from "excalibur";
import {
  CharacterComponent,
  LivingComponent,
  NeighborsComponent,
} from "../components/character";
import { InventoryComponent } from "../components/inventory";
import { BuildingComponent } from "../components/building";

const random = new Random()

class DisasterSystem extends System {
	public systemType = SystemType.Update;



	query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof NeighborsComponent
    | typeof LivingComponent
  >;

	buildingQuery: Query<
		| typeof BuildingComponent
  >;

	constructor(world : World) {
		super();
		this.query = world.query([
      CharacterComponent,
      InventoryComponent,
      NeighborsComponent,
      LivingComponent,
    ]);

		this.buildingQuery = world.query([
      BuildingComponent,
    ]);

		// start the timer that starts a disaster every minute
		const timer = new Timer({
			fcn: () => this.startDisaster(),
			repeats: true,
			interval: 3000,
		});

		world.scene.add(timer);

		timer.start();
	}

	update(delta: Number) {
	}

	public startDisaster() {
		console.log("DISASTER STARTING");
		switch(random.d4()) {
			// destroy a random building
			case 1: {
				const buildings = this.buildingQuery.entities;
				if (buildings.length != 0) {
					buildings[random.integer(0, buildings.length - 1)].kill()
				}
			}

			// kill a random human
			case 2: {
				const humans = this.query.entities;
				if (humans.length != 0) {
					humans[random.integer(0, humans.length - 1)].kill()
				}
			}

			// make humans take longer to gather things for 2 minutes
			case 3: {
				
			}

			// make humans get hungry faster for 2 minutes
			case 4: {
				
			}
		}
	}
}

export default DisasterSystem;