import {
	Random,
  System,
	SystemType,
	World,
} from "excalibur";

const random = new Random()

class DisasterSystem extends System {
	public systemType = SystemType.Update;

	constructor(world : World) {
		super();
	}

	update(delta: Number) {

	}

	public static startDisaster() {
		console.log("DISASTER STARTING");
		switch(random.d4()) {
			case 1: {

			}
			case 2: {
				
			}
			case 3: {
				
			}
			case 4: {
				
			}
		}
	}
}

export default DisasterSystem;