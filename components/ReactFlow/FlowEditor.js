import React, { useRef, useState, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  removeElements,
  addEdge,
  updateEdge,
  Background,
  isEdge,
  isNode,
  getOutgoers,
} from "react-flow-renderer";
import { nodeTypes, edgeTypes, entities } from "../../utils/flowConfig";

import GreenButton from "../UI/GreenButton";
import DndBar from "./DndBar";
import ControlsBar from "./ControlsBar";

import classes from "./FlowEditor.module.scss";
import nodesClass from "./Nodes.module.scss";

let com;
let id = 0;
const getId = () => `dndnode_${id++}`;

const controlTitles = [
  "Zoom-in",
  "Zoom-out",
  "Fit-view",
  "Lock",
  "Undo",
  "Redo",
  "Save",
  "Restore",
  "Info",
];

const getDefaultValues = (type) => {
  if (type === "distance") {
    return { from: entities[0].toLowerCase(), to: "next obstacle" };
  }
  if (
    type === "jump" ||
    type === "doubleJump" ||
    type === "crouch" ||
    type === "attack"
  ) {
    return { entity: entities[0].toLowerCase() };
  }
  if (
    type === "speedOf" ||
    type === "heightOf" ||
    type === "widthOf" ||
    type === "elevationOf"
  ) {
    return { entity: "next obstacle" };
  }
  if (
    type === "add" ||
    type === "subtract" ||
    type === "multiply" ||
    type === "divide" ||
    type === "greaterThan" ||
    type === "lessThan" ||
    type === "equals" ||
    type === "notEquals" ||
    type === "and" ||
    type === "or"
  ) {
    return { a: 0, b: 0 };
  }
  if (type === "operatorGeneral") {
    return { a: 0, b: 0, operator: "+" };
  }
  if (type === "repeat") {
    return { condition: "1" };
  }
  return {};
};

const updateGhostEnd = (sourceBlock, sourceHandle, action) => {
  switch (action) {
    case "add":
      document
        .querySelector(
          `.react-flow__handle.source[data-nodeid="${sourceBlock}"][data-handleid="${sourceHandle}"]`
        )
        .classList.add(nodesClass.handleConnected);
      break;
    case "remove":
      document
        .querySelector(
          `.react-flow__handle.source[data-nodeid="${sourceBlock}"][data-handleid="${sourceHandle}"]`
        )
        .classList.remove(nodesClass.handleConnected);
      break;
  }
};

const updateParamInput = (targetBlock, targetHandle, action) => {
  if (targetHandle.split("__")[0] === "param") {
    const handleId = targetHandle.split("__")[1];
    const el = document.querySelector(
      `.react-flow__node[data-id="${targetBlock}"]`
    );
    switch (handleId) {
      case "b":
        action === "prevent"
          ? el
              .querySelectorAll("input")[1]
              .classList.add(nodesClass.preventInput)
          : el
              .querySelectorAll("input")[1]
              .classList.remove(nodesClass.preventInput);
        break;
      default:
        action === "prevent"
          ? el.querySelector("input").classList.add(nodesClass.preventInput)
          : el.querySelector("input").classList.remove(nodesClass.preventInput);
        break;
    }
  }
};

const FlowEditor = (props) => {
  const wrapperRef = useRef(null);
  const [allowCompile, setAllowCompile] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [actionStack, setActionStack] = useState({
    stack: [props.elements],
    currentIndex: 0,
  });
  const [userHasActed, setUserHasActed] = useState(false);

  useEffect(() => {
    setAllowCompile(true);
    if (userHasActed) {
      setActionStack((state) => {
        return {
          stack: [
            ...state.stack.slice(0, state.currentIndex + 1),
            props.elements,
          ],
          currentIndex: state.currentIndex + 1,
        };
      });
      setUserHasActed(false);
    }
  }, [props.elements]);

  // deleting an element
  const onElementsRemove = useCallback((elementsToRemove) => {
    const filteredElements = elementsToRemove.filter(
      (el) => el.id !== "start" && el.id !== "end" // prevent deleting start and end node
    );
    for (const element of elementsToRemove) {
      if (isEdge(element)) {
        updateGhostEnd(element.source, element.sourceHandle, "remove");
        updateParamInput(element.target, element.targetHandle, "allow");
      }
    }
    props.setElements((els) => removeElements(filteredElements, els));
    setUserHasActed(true);
  }, []);

  const onConnect = useCallback((params) => {
    updateGhostEnd(params.source, params.sourceHandle, "add");
    // styling new edge
    let newEdge;
    if (params.sourceHandle.split("__")[0] === "execution") {
      newEdge = {
        ...params,
        type: "execution",
        animated: true,
        arrowHeadType: "arrowclosed",
      };
    } else if (params.sourceHandle.split("__")[0] === "param") {
      newEdge = {
        ...params,
      };
    }
    // check if param input needs to be toggled
    updateParamInput(params.target, params.targetHandle, "prevent");
    props.setElements((els) => {
      return addEdge(newEdge, els);
    });
    setUserHasActed(true);
  }, []);

  // updating edges
  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    updateGhostEnd(oldEdge.source, oldEdge.sourceHandle, "remove");
    updateGhostEnd(newConnection.source, newConnection.sourceHandle, "add");
    updateParamInput(oldEdge.target, oldEdge.targetHandle, "allow");
    updateParamInput(
      newConnection.target,
      newConnection.targetHandle,
      "prevent"
    );
    props.setElements((els) => updateEdge(oldEdge, newConnection, els));
    setUserHasActed(true);
  }, []);

  // initialising flow editor
  const onLoad = useCallback((_reactFlowInstance) => {
    console.log("flow loaded:", _reactFlowInstance);
    _reactFlowInstance.fitView();
    setReactFlowInstance(_reactFlowInstance);
    const controls = document.querySelector(".react-flow__controls").children;
    for (let i = 0; i < controls.length; i++) {
      controls[i].title = controlTitles[i];
      console.log(controls[i]);
    }
    const arrow = document.querySelector("#react-flow__arrowclosed");
    const clone = arrow.cloneNode(true);
    clone.id = "react-flow__arrowclosed__custom";
    arrow.parentNode.appendChild(clone);
  }, []);

  // dragging from menu to drop zone
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // dropping
  const onDrop = (event) => {
    event.preventDefault();
    // place the node in correct position
    const reactFlowBounds = wrapperRef.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    // create new node
    const id = getId();
    const newNode = {
      id: id,
      type,
      position,
      data: {
        values: getDefaultValues(type),
        callBack: (newValues) => {
          props.setElements((els) =>
            els.map((el) => {
              if (el.id === id) {
                el.data = {
                  ...el.data,
                  values: newValues,
                };
              }
              return el;
            })
          );
          setUserHasActed(true);
        },
      },
    };
    props.setElements((es) => es.concat(newNode));
    setUserHasActed(true);
  };

  const compileHandler = () => {
    clearInterval(com);
    com = 0;
    const code = props.compileCode();
    com = setInterval(() => {
      props.executeCode(code);
    }, 10);
    setAllowCompile(false);
  };

  return (
    <div
      className={`${classes.editorContainer} ${props.show ? "" : "hide"}`}
      onContextMenu={() => console.log("does this work")}
    >
      <ReactFlowProvider>
        <DndBar />
        <div className={classes.editorWrapper} ref={wrapperRef}>
          <GreenButton
            className={`${classes.compileBtn} ${
              allowCompile && classes.newChanges
            } terminate-code`}
            clickHandler={compileHandler}
            caption="Compile"
          />
          <ReactFlow
            elements={props.elements}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onLoad={onLoad}
            // onElementClick={onElementClick}
            onElementsRemove={onElementsRemove}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            snapToGrid={true}
            snapGrid={[16, 16]}
            arrowHeadColor="#ffffff"
          >
            <ControlsBar
              elements={props.elements}
              setElements={props.setElements}
              actionStack={actionStack}
              setActionStack={setActionStack}
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowEditor;
