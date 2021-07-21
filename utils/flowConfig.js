import { NodeStart } from "../components/ReactFlow/NodeGeneral";
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
  NodeCrouch,
  NodeJump,
} from "../components/ReactFlow/NodeActions";
import {
  NodeAdd,
  NodeSubtract,
  NodeMultiply,
  NodeDivide,
  NodeGreaterThan,
  NodeLessThan,
  NodeEquals,
  NodeNotEquals,
  NodeOperatorGeneral,
} from "../components/ReactFlow/NodeOperations";
import { NodeAnd, NodeOr } from "../components/ReactFlow/NodeLogicals";
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
  distance: NodeDistance,
  speedOf: NodeSpeedOf,
  heightOf: NodeHeightOf,
  widthOf: NodeWidthOf,
  elevationOf: NodeElevationOf,
  jump: NodeJump,
  doubleJump: NodeDoubleJump,
  crouch: NodeCrouch,
  attack: NodeAttack,
  add: NodeAdd,
  subtract: NodeSubtract,
  multiply: NodeMultiply,
  divide: NodeDivide,
  greaterThan: NodeGreaterThan,
  lessThan: NodeLessThan,
  equals: NodeEquals,
  notEquals: NodeNotEquals,
  operatorGeneral: NodeOperatorGeneral,
  and: NodeAnd,
  or: NodeOr,
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
];

export const entities = ["Player"];
