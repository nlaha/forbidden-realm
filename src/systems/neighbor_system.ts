import {
  Query,
  System,
  SystemType,
  TransformComponent,
  World,
} from "excalibur";
import { NeighborsComponent } from "../components/character";

class NeighborSystem extends System {
  neighborsQuery: Query<typeof NeighborsComponent>;
  neighboringQuery: Query<typeof TransformComponent>;

  constructor(world: World) {
    super();
    this.neighborsQuery = world.query([NeighborsComponent]);
    this.neighboringQuery = world.query([TransformComponent]);
  }
  // Lower numbers mean higher priority
  // 99 is low priority
  public priority = 80;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    for (let entity of this.neighborsQuery.entities) {
      for (let neighbor of this.neighboringQuery.entities) {
        const neighborsComponent = entity.get(NeighborsComponent);
        const transform = neighbor.get(TransformComponent);

        if (!transform) {
          continue;
        }

        const distance = entity
          .get(TransformComponent)
          ?.pos.distance(transform.pos);
        if (distance && distance < neighborsComponent.range) {
          neighborsComponent.neighbors.add(neighbor);
        } else {
          neighborsComponent.neighbors.delete(neighbor);
        }
      }
    }
  }
}

export default NeighborSystem;
