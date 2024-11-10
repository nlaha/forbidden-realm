import {
  Query,
  System,
  SystemType,
  TransformComponent,
  World,
} from "excalibur";
import { VisionComponent } from "../components/character";
import { VisibleComponent } from "../components/visible";

class VisionSystem extends System {
  visionQuery: Query<typeof VisionComponent>;
  visibleQuery: Query<typeof TransformComponent | typeof VisibleComponent>;

  constructor(world: World) {
    super();
    this.visionQuery = world.query([VisionComponent]);
    this.visibleQuery = world.query([TransformComponent, VisibleComponent]);
  }
  // Lower numbers mean higher priority
  // 99 is low priority
  public priority = 80;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    for (let entity of this.visionQuery.entities) {
      for (let visibleEntity of this.visibleQuery.entities) {
        const vision = entity.get(VisionComponent);
        const visibleEntityTransform = visibleEntity.get(TransformComponent);
        const visibleComponent = visibleEntity.get(VisibleComponent);

        if (!visibleEntityTransform || !visibleComponent) {
          continue;
        }

        const distance = entity
          .get(TransformComponent)
          ?.pos.distance(visibleEntityTransform.pos);
        if (distance && distance < vision.range) {
          vision.visibleEntities.add(visibleEntity);
        } else {
          vision.visibleEntities.delete(visibleEntity);
        }
      }
    }
  }
}

export default VisionSystem;
