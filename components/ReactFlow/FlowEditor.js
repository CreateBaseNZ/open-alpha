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
import { nodeTypes, edgeTypes } from "../../utils/flowConfig";
import {
  controlTitles,
  getDefaultValues,
  updateGhostEnd,
  updateParamInput,
} from "../../utils/flowHelpers";

import GreenButton from "../UI/GreenButton";
import DndBar from "./DndBar";
import ControlsBar from "./ControlsBar";

import classes from "./FlowEditor.module.scss";

let com;
let id = 0;
const getId = () => `dndnode_${id++}`;

const FlowEditor = (props) => {
  const wrapperRef = useRef(null);
  const [allowCompile, setAllowCompile] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [actionStack, setActionStack] = useState({
    stack: [props.elements],
    currentIndex: 0,
  });
  const [userHasActed, setUserHasActed] = useState(false);
  const [clipBoard, setClipBoard] = useState();

  console.log(actionStack);

  useEffect(() => {
    setAllowCompile(true);
  }, [props.elements]);

  useEffect(() => {
    if (userHasActed) {
      console.log("im updating something");
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
  }, [userHasActed]);

  // initialising flow editor
  const onLoad = useCallback((_reactFlowInstance) => {
    console.log("flow loaded:", _reactFlowInstance);
    _reactFlowInstance.fitView();
    setReactFlowInstance(_reactFlowInstance);
    const controls = document.querySelector(".react-flow__controls").children;
    for (let i = 0; i < controls.length; i++) {
      controls[i].title = controlTitles[i];
    }
    const arrow = document.querySelector("#react-flow__arrowclosed");
    const clone = arrow.cloneNode(true);
    clone.id = "react-flow__arrowclosed__custom";
    arrow.parentNode.appendChild(clone);
  }, []);

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
    props.setElements((els) => addEdge(newEdge, els));
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

  const undoAction = () => {
    props.setElements(actionStack.stack[actionStack.currentIndex - 1]);
    setActionStack((state) => {
      return { ...state, currentIndex: state.currentIndex - 1 };
    });
  };

  const redoAction = () => {
    props.setElements(actionStack.stack[actionStack.currentIndex + 1]);
    setActionStack((state) => {
      return { ...state, currentIndex: state.currentIndex + 1 };
    });
  };

  const saveFlow = () => {
    if (props.elements) {
      window.localStorage.setItem("flow_save", JSON.stringify(props.elements));
    }
  };

  const restoreFlow = () => {
    const restore = () => {
      const flow = JSON.parse(window.localStorage.getItem("flow_save"));
      if (flow) {
        props.setElements(flow);
        setCenter(0, 0, 1.25);
      }
    };

    restore();
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

  const keyDownHandler = (event) => {
    if (event.ctrlKey) {
      if (event.key === "c") {
      } else if (event.key === "v") {
      } else if (event.key === "z") {
        undoAction();
      } else if (event.key === "y") {
        redoAction();
      } else if (event.key === "s") {
        saveFlow();
      } else if (event.key === "r") {
        restoreFlow();
      }
    }
  };

  return (
    <div
      className={`${classes.editorContainer} ${props.show ? "" : "hide"}`}
      onContextMenu={() => console.log("does this work")}
      onKeyDown={keyDownHandler}
      tabIndex={-1}
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
              undoHandler={undoAction}
              redoHandler={redoAction}
              saveHandler={saveFlow}
              restoreHandler={restoreFlow}
              allowUndo={actionStack.currentIndex === 0}
              allowRedo={
                actionStack.currentIndex + 1 === actionStack.stack.length
              }
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowEditor;
