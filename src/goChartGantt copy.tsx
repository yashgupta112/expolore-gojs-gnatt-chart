import * as go from 'gojs';
// import { ReactDiagram } from 'gojs-react';
// import { Diagram, Model } from 'gojs';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { DiagramWrapper } from './goChartWrapper-old';

// Task Data with start, end, and dependency attributes
const taskData = [
  { key: 1, name: 'Planning', start: '2024-09-01', end: '2024-09-03', color: 'lightgreen' },
  { key: 2, name: 'Development', start: '2024-09-03', end: '2024-09-08', color: 'lightblue', dependency: 1 },
  { key: 3, name: 'Testing', start: '2024-09-08', end: '2024-09-15', color: 'lightcoral', dependency: 2 },
  { key: 4, name: 'Deployment', start: '2024-09-15', end: '2024-09-20', color: 'lightyellow', dependency: 3 },
];

const GoGanttChart: React.FC = () => {
  const diagramRef = useRef<go.Diagram | null>(null);

  useEffect(() => {
    if (!diagramRef.current) {
      const $ = go.GraphObject.make;

      // Create a Diagram for the Gantt Chart
      const diagram = $(go.Diagram, {
        initialContentAlignment: go.Spot.TopLeft,
        layout: $(go.GridLayout, { alignment: go.GridLayout.Position }),
        isReadOnly: true,
      });

      // Define the Node template for the Gantt chart bars
      diagram.nodeTemplate = $(
        go.Node,
        'Auto',
        {
          toolTip: $(
            go.Adornment,
            'Auto',
            $(go.Shape, { fill: 'lightyellow' }),
            $(
              go.TextBlock,
              { margin: 5 },
              new go.Binding('text', '', (data: any) => {
                return `Task: ${data.name}\nStart: ${data.start}\nEnd: ${data.end}`;
              })
            )
          ),
        },
        $(go.Shape, 'Rectangle', {
          fill: 'white',
          strokeWidth: 0,
          height: 20,
        }),
        new go.Binding('fill', 'color'),
        $(
          go.Panel,
          'Horizontal',
          $(go.TextBlock, { margin: 5, font: 'bold 12px sans-serif' }, new go.Binding('text', 'name'))
        )
      );

      // Define the Link template for dependencies
      diagram.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal, corner: 5 },
        $(go.Shape, { stroke: 'black', strokeWidth: 1.5 }),
        $(go.Shape, { toArrow: 'Standard', fill: 'black', stroke: null })
      );

      // Create a model for the diagram
      const model = new go.GraphLinksModel();

      // Map the task data to GoJS Nodes and Links
      model.nodeDataArray = taskData.map((task) => ({
        key: task.key,
        name: task.name,
        start: new Date(task.start).getTime(),
        end: new Date(task.end).getTime(),
        color: task.color,
      }));

      // Create links between nodes based on dependencies
      model.linkDataArray = taskData
        .filter((task) => task.dependency)
        .map((task) => ({ from: task.dependency, to: task.key }));

      diagram.model = model;
      diagramRef.current = diagram;
    }
  }, []);

  // Render the diagram in a <div>, adding a check for `diagramRef.current`

  const options = {
    nodeDataArray: taskData.map((task) => ({
        key: task.key,
        name: task.name,
        start: new Date(task.start).getTime(),
        end: new Date(task.end).getTime(),
        color: task.color,
      })),
      linkDataArray: taskData
      .filter((task) => task.dependency)
      .map((task) => ({ from: task.dependency, to: task.key })),
      class: "GraphLinksModel",
    modelData: {"origin":1531540800000},
    skipsDiagramUpdate: true

  }
  return (
    <div
    ref={(div) => {
      if (div && diagramRef.current) {
        diagramRef.current.div = div;
      }
      return diagramRef.current;
    }}
    style={{ width: '100%', height: '600px' }}
  />
  )
  return (
    <DiagramWrapper
          nodeDataArray={options.nodeDataArray}
          linkDataArray={options.linkDataArray}
          modelData={options.modelData}
          skipsDiagramUpdate={options.skipsDiagramUpdate}
        //   onDiagramEvent={this.handleDiagramEvent}
        //   onModelChange={this.handleModelChange}
        />
  );
};

export default GoGanttChart;
