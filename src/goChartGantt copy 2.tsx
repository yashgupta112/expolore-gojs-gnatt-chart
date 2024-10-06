import * as go from 'gojs';
import React, { useEffect, useRef } from 'react';

const GanttChart: React.FC = () => {
  const diagramRef = useRef<go.Diagram | null>(null);

  useEffect(() => {
    if (diagramRef.current === null) {
      const $ = go.GraphObject.make;

      // Create the Diagram
      diagramRef.current = $(go.Diagram, {
        'undoManager.isEnabled': true,
        layout: $(go.LayeredDigraphLayout),
        'toolTip': $(go.Adornment, 'Auto',
          $(go.Shape, { fill: '#E0E0E0' }),
          $(go.TextBlock, { margin: 5 },
            new go.Binding('text', 'name'))
        ),
      });

      // Define the Node template
      diagramRef.current.nodeTemplate = $(
        go.Node,
        'Auto',
        $(go.Shape, 'Rectangle',
          { fill: 'lightgray', strokeWidth: 0, height: 20 }),
        new go.Binding('fill', 'color'),
        $(go.Panel, 'Horizontal',
          $(go.TextBlock, { margin: 5, font: 'bold 12px sans-serif' },
            new go.Binding('text', 'name'))
        )
      );

      // Define the Link template for dependencies
      diagramRef.current.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal, corner: 5 },
        $(go.Shape, { stroke: 'black', strokeWidth: 1.5 }),
        $(go.Shape, { toArrow: 'Standard', fill: 'black', stroke: null })
      );

      // Create the model data for the Gantt chart
      const model = new go.GraphLinksModel(
        [
          { key: 1, name: 'Planning', start: '2024-09-01', end: '2024-09-03', color: 'lightgreen' },
          { key: 2, name: 'Development', start: '2024-09-03', end: '2024-09-08', color: 'lightblue', dependency: 1 },
          { key: 3, name: 'Testing', start: '2024-09-08', end: '2024-09-15', color: 'lightcoral', dependency: 2 },
          { key: 4, name: 'Deployment', start: '2024-09-15', end: '2024-09-20', color: 'lightyellow', dependency: 3 },
        ],
        [
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 3, to: 4 },
        ]
      );

      // Set the model to the diagram
      diagramRef.current.model = model;

      // Assign the diagram to a div element
      // diagramRef.current.div = document.getElementById('myDiagramDiv');
      const myDiagramDiv = document.getElementById('myDiagramDiv') as HTMLDivElement | null;
      diagramRef.current.div = myDiagramDiv;
    }
  }, []);

  return (
    <div>
      <h2>Gantt Chart</h2>
      <div
        id="myDiagramDiv"
        style={{ width: '100%', height: '600px', border: '1px solid black' }}
      />
    </div>
  );
};

export default GanttChart;
