import { NodeStart, NodeEnd } from "../components/ReactFlow/NodeGeneral";
import {
  NodeDistance,
  NodeSpeedOf,
  NodeHeightOf,
  NodeWidthOf,
  NodeElevationOf,
} from "../components/ReactFlow/NodeSensing";
import {
  NodeAttack,
  NodeDoubleJump,
  NodeDuck,
  NodeJump,
  NodeSlide,
} from "../components/ReactFlow/NodeActions";
import {
  NodeAdd,
  NodeSubtract,
  NodeMultiply,
  NodeDivide,
  NodeGreaterThan,
  NodeLessThan,
  NodeEquals,
  NodeOr,
  NodeOperatorGeneral,
} from "../components/ReactFlow/NodeOperations";
import {
  NodeIf,
  NodeRepeat,
  NodeWhile,
} from "../components/ReactFlow/NodeConditionals";
import { ExecutionEdge } from "../components/ReactFlow/Edges";

export const initialData = {
  start: {},
  end: {},
};

export const nodeTypes = {
  start: NodeStart,
  end: NodeEnd,
  distance: NodeDistance,
  speedOf: NodeSpeedOf,
  heightOf: NodeHeightOf,
  widthOf: NodeWidthOf,
  elevationOf: NodeElevationOf,
  jump: NodeJump,
  doubleJump: NodeDoubleJump,
  duck: NodeDuck,
  slide: NodeSlide,
  attack: NodeAttack,
  add: NodeAdd,
  subtract: NodeSubtract,
  multiply: NodeMultiply,
  divide: NodeDivide,
  greaterThan: NodeGreaterThan,
  lessThan: NodeLessThan,
  equals: NodeEquals,
  or: NodeOr,
  operatorGeneral: NodeOperatorGeneral,
  if: NodeIf,
  repeat: NodeRepeat,
  while: NodeWhile,
};

export const edgeTypes = {
  execution: ExecutionEdge,
};

export const initialElements = [
  {
    id: "start",
    type: "start",
    position: { x: -80, y: -80 },
  },
  { id: "end", type: "end", position: { x: 80, y: 80 } },
];

export const entities = ["Character", "Drone", "Vehicle"];
