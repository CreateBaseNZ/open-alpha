export const comparisonBoostLvl1Item = () => {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  const type = Math.random() > 0.5 ? "greaterThan" : "lessThan";
  return {
    q: "What does this print?",
    els: [
      {
        id: "start",
        type: "start",
        position: { x: -48, y: -32 },
        data: { connections: ["execution__out"] },
      },
      {
        id: "dndnode_0",
        type: type,
        position: { x: -16, y: -144 },
        data: {
          connections: ["boolean__out"],
          values: {
            a: a,
            b: b,
          },
        },
      },
      {
        id: "dndnode_1",
        type: "print",
        position: { x: 110, y: -64 },
        data: {
          connections: ["execution__in", "any__in__a"],
          values: { a: 0 },
        },
      },
      {
        source: "start",
        sourceHandle: "execution__out",
        target: "dndnode_1",
        targetHandle: "execution__in",
        type: "execution",
        animated: true,
        arrowHeadType: "arrowclosed",
        id: "reactflow__edge-startexecution__out-dndnode_0execution__in",
      },
      {
        source: "dndnode_0",
        sourceHandle: "boolean__out",
        target: "dndnode_1",
        targetHandle: "any__in__a",
        type: "boolean",
        id: "reactflow__edge-dndnode_1boolean__out-dndnode_0any__in__a",
      },
    ],
    o: ["true", "false", a + b, a - b],
    a: (type === "greaterThan" ? a > b : a < b).toString(),
  };
};

export const comparisonBoostLvl2Item = () => {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  const c = Math.floor(Math.random() * 100);
  const opType = Math.random() > 0.5 ? "add" : "subtract";
  const compType = Math.random() > 0.5 ? "greaterThan" : "lessThan";
  const opAnswer = opType === "add" ? a + b : a - b;
  const compAnswer = compType === "greaterThan" ? opAnswer > c : opAnswer < c;
  return {
    q: "What does this print?",
    els: [
      {
        data: {
          connections: ["execution__out"],
        },
        id: "start",
        position: { x: 0, y: -32 },
        type: "start",
      },
      {
        data: {
          connections: ["execution__in", "any__in__a"],
          values: { a: 0 },
        },
        id: "dndnode_0",
        position: { x: 144, y: -48 },
        type: "print",
      },
      {
        animated: true,
        arrowHeadType: "arrowclosed",
        id: "reactflow__edge-startexecution__out-dndnode_0execution__in",
        source: "start",
        sourceHandle: "execution__out",
        target: "dndnode_0",
        targetHandle: "execution__in",
        type: "execution",
      },
      {
        data: {
          connections: ["boolean__out", "float__in__a"],
          values: { a: 0, b: c },
        },
        id: "dndnode_1",
        position: { x: 64, y: -112 },
        type: compType,
      },
      {
        id: "reactflow__edge-dndnode_1boolean__out-dndnode_0any__in__a",
        source: "dndnode_1",
        sourceHandle: "boolean__out",
        target: "dndnode_0",
        targetHandle: "any__in__a",
        type: "boolean",
      },
      {
        data: { connections: ["float__out"], values: { a: a, b: b } },
        id: "dndnode_2",
        position: { x: -80, y: -176 },
        type: opType,
      },
      {
        id: "reactflow__edge-dndnode_2float__out-dndnode_1float__in__a",
        source: "dndnode_2",
        sourceHandle: "float__out",
        target: "dndnode_1",
        targetHandle: "float__in__a",
        type: "float",
      },
    ],
    o: ["true", "false", a + b, a - b],
    a: compAnswer.toString(),
  };
};

// Math.floor(Math.random() * (max - min) + min)
// The maximum is exclusive and the minimum is inclusive
export const comparisonBoostLvl3Item = () => {
  const greaterThan = Math.random() > 0.5;
  const leftHandle = Math.random() > 0.5;
  const handleName = leftHandle ? "float__in__a" : "float__in__b";
  const noneOfThese = Math.random() > 0.75;
  const a = Math.floor(Math.random() * 99 + 1);
  let b, c, d;

  if ((greaterThan && leftHandle) || (!greaterThan && !leftHandle)) {
    if (noneOfThese) {
      b = Math.floor(Math.random() * a);
    } else {
      b = Math.floor(Math.random() * (100 - a + 1) + a + 1);
    }
    c = Math.floor(Math.random() * a);
    d = Math.floor(Math.random() * a);
  } else {
    if (noneOfThese) {
      b = Math.floor(Math.random() * (100 - a + 1) + a + 1);
    } else {
      b = Math.floor(Math.random() * a);
    }
    c = Math.floor(Math.random() * (100 - a + 1) + a + 1);
    d = Math.floor(Math.random() * (100 - a + 1) + a + 1);
  }

  const options = [b, c, d];

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    q: "What value of 'Distance to next obstacle' would TRUE be printed?",
    els: [
      {
        data: {
          connections: ["execution__out"],
        },
        id: "start",
        position: { x: 0, y: -32 },
        type: "start",
      },
      {
        data: {
          connections: ["execution__in", "any__in__a"],
          values: { a: 0 },
        },
        id: "dndnode_0",
        position: { x: 144, y: -48 },
        type: "print",
      },
      {
        animated: true,
        arrowHeadType: "arrowclosed",
        id: "reactflow__edge-startexecution__out-dndnode_0execution__in",
        source: "start",
        sourceHandle: "execution__out",
        target: "dndnode_0",
        targetHandle: "execution__in",
        type: "execution",
      },
      {
        data: {
          connections: ["boolean__out", handleName],
          values: { a: a, b: a },
        },
        id: "dndnode_1",
        position: { x: 64, y: -112 },
        type: greaterThan ? "greaterThan" : "lessThan",
      },
      {
        id: "reactflow__edge-dndnode_1boolean__out-dndnode_0any__in__a",
        source: "dndnode_1",
        sourceHandle: "boolean__out",
        target: "dndnode_0",
        targetHandle: "any__in__a",
        type: "boolean",
      },
      {
        data: { connections: ["float__out"], values: {} },
        id: "dndnode_2",
        position: { x: -80, y: -176 },
        type: "distance",
      },
      {
        id: `reactflow__edge-dndnode_2float__out-dndnode_1${handleName}`,
        source: "dndnode_2",
        sourceHandle: "float__out",
        target: "dndnode_1",
        targetHandle: handleName,
        type: "float",
      },
    ],
    o: options.concat("None of these"),
    a: noneOfThese ? "None of these" : b,
  };
};

export const conditionalBoostLvl1Item = () => {
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  const type = Math.random() > 0.5 ? "greaterThan" : "lessThan";
  return {
    q: "Will Action 1 be executed?",
    els: [
      {
        data: {
          connections: ["execution__out"],
        },
        id: "start",
        position: { x: 0, y: -32 },
        type: "start",
      },
      {
        data: {
          connections: ["execution__in", "any__in__a"],
          values: { a: 0 },
        },
        id: "dndnode_0",
        position: { x: 144, y: -48 },
        type: "print",
      },
      {
        animated: true,
        arrowHeadType: "arrowclosed",
        id: "reactflow__edge-startexecution__out-dndnode_0execution__in",
        source: "start",
        sourceHandle: "execution__out",
        target: "dndnode_0",
        targetHandle: "execution__in",
        type: "execution",
      },
      {
        data: {
          connections: ["boolean__out", "float__in__a"],
          values: { a: 0, b: 0 },
        },

        id: "dndnode_1",
        position: { x: 64, y: -112 },
        type: "lessThan",
      },
      {
        id: "reactflow__edge-dndnode_1boolean__out-dndnode_0any__in__a",
        source: "dndnode_1",
        sourceHandle: "boolean__out",
        target: "dndnode_0",
        targetHandle: "any__in__a",
        type: "boolean",
      },
      {
        data: { connections: ["float__out"], values: { a: 0, b: 0 } },
        id: "dndnode_2",
        position: { x: -80, y: -176 },
        type: "add",
      },
      {
        id: "reactflow__edge-dndnode_2float__out-dndnode_1float__in__a",
        source: "dndnode_2",
        sourceHandle: "float__out",
        target: "dndnode_1",
        targetHandle: "float__in__a",
        type: "float",
      },
    ],
    o: ["yes", "no"],
    a: (type === "greaterThan" ? a > b : a < b).toString(),
  };
};
