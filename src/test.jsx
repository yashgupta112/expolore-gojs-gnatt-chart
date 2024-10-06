import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
// import React, { useEffect, useRef } from 'react';
import './GanttChart.css'; // Optional: For custom styling

const GanttChart = () => {
  // const diagramRef = useRef<go.Diagram | null>(null);

  function initDiagram() {
    var GridCellHeight = 20; // document units; cannot be changed dynamically
    var GridCellWidth = 12; // document units per day; this can be modified -- see rescale()
    var TimelineHeight = 24; // document units; cannot be changed dynamically

    const MsPerDay = 24 * 60 * 60 * 1000;
    function convertDaysToUnits(n) {
      return n;
    }

    function convertUnitsToDays(n) {
      return n;
    }

    function convertStartToX(start) {
      return convertUnitsToDays(start) * GridCellWidth;
    }

    function convertXToStart(x, node) {
      return convertDaysToUnits(x / GridCellWidth);
    }

    // these four functions are used in TwoWay Bindings on the task/node template
    function convertDurationToW(duration) {
      return convertUnitsToDays(duration) * GridCellWidth;
    }
    function convertWToDuration(w) {
      return convertDaysToUnits(w / GridCellWidth);
    }

    function convertStartToPosition(start, node) {
      return new go.Point(convertStartToX(start), node.position.y || 0);
    }

    function convertPositionToStart(pos) {
      return convertXToStart(pos.x);
    }
    var StartDate = new Date(); // set from Model.modelData.origin

  function valueToText(n) {
    // N document units after StartDate
    const startDate = StartDate;
    const startDateMs = startDate.getTime() + startDate.getTimezoneOffset() * 60000;
    const date = new Date(startDateMs + (n / GridCellWidth) * MsPerDay);
    return date.toLocaleDateString();
  }

  function dateToValue(d) {
    // D is a Date
    const startDate = StartDate;
    const startDateMs = startDate.getTime() + startDate.getTimezoneOffset() * 60000;
    const dateInMs = d.getTime() + d.getTimezoneOffset() * 60000;
    const msSinceStart = dateInMs - startDateMs;
    return (msSinceStart / MsPerDay) * GridCellWidth;
  }

  // the custom figure used for task bars that have downward points at their ends
  go.Shape.defineFigureGenerator('RangeBar', (shape, w, h) => {
    const b = Math.min(5, w);
    const d = Math.min(5, h);
    return new go.Geometry().add(
      new go.PathFigure(0, 0, true)
        .add(new go.PathSegment(go.SegmentType.Line, w, 0))
        .add(new go.PathSegment(go.SegmentType.Line, w, h))
        .add(new go.PathSegment(go.SegmentType.Line, w - b, h - d))
        .add(new go.PathSegment(go.SegmentType.Line, b, h - d))
        .add(new go.PathSegment(go.SegmentType.Line, 0, h).close())
    );
  });
    function standardContextMenus() {
      return {
        contextMenu: go.GraphObject.build('ContextMenu')
          .add(
            go.GraphObject.build('ContextMenuButton', {
              click: (e, button) => {
                const task = button.part.adornedPart;
              }
            })
              .add(
                new go.TextBlock('Details...')
              ),
            go.GraphObject.build('ContextMenuButton', {
              click: (e, button) => {
                const task = button.part.adornedPart;
                e.diagram.model.commit((m) => {
                  const newdata = { key: undefined, text: 'New Task', color: task.data.color, duration: convertDaysToUnits(5) };
                  m.addNodeData(newdata);
                  m.addLinkData({ from: task.key, to: newdata.key });
                  e.diagram.select(e.diagram.findNodeForData(newdata));
                });
              }
            })
              .add(
                new go.TextBlock('New Task')
              )
          )
      };
    }
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    const myGantt =
      new go.Diagram(
        {
          'undoManager.isEnabled': true,  // must be set to allow for model change listening
          // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },

          initialPosition: new go.Point(-10, -100), // show labels
          // make room on top for myTimeline and a bit of spacing; on bottom for whole task row and a bit more
          padding: new go.Margin(TimelineHeight + 4, GridCellWidth * 7, GridCellHeight, 0), // needs to be the same vertically as for myTasks
          scrollMargin: new go.Margin(0, GridCellWidth * 7, 0, 0), // and allow scrolling to a week beyond that
          allowCopy: false,
          'commandHandler.deletesTree': true,
          'draggingTool.isGridSnapEnabled': true,
          'draggingTool.gridSnapCellSize': new go.Size(GridCellWidth, GridCellHeight),
          'draggingTool.dragsTree': true,
          'resizingTool.isGridSnapEnabled': true,
          'resizingTool.cellSize': new go.Size(GridCellWidth, GridCellHeight),
          'resizingTool.minSize': new go.Size(GridCellWidth, GridCellHeight),
          mouseOver: (e) => {
            if (!myGrid || !myHighlightDay) return;
            const lp = myGrid.getLocalPoint(e.documentPoint);
            const day = Math.floor(convertXToStart(lp.x)); // floor gets start of day
            myHighlightDay.position = new go.Point(convertStartToX(day), myGrid.position.y);
            myHighlightDay.width = GridCellWidth; // 1 day
            myHighlightDay.height = myGrid.actualBounds.height;
            myHighlightDay.visible = true;
          },
          mouseLeave: (e) => (myHighlightDay.visible = false),
          'animationManager.isInitial': false,
          SelectionMoved: (e) => e.diagram.layoutDiagram(true),
          DocumentBoundsChanged: (e) => {
            // the grid extends to only the area needed
            const b = e.diagram.documentBounds;
            myGrid.desiredSize = new go.Size(b.width + GridCellWidth * 7, b.bottom);
            // the timeline, which is not in the documentBounds, only covers the needed area
            // widen to cover whole weeks
            myTimeline.graduatedMax = Math.ceil(b.width / (GridCellWidth * 7)) * (GridCellWidth * 7);
            myTimeline.findObject('MAIN').width = myTimeline.graduatedMax;
            myTimeline.findObject('TICKS').height = Math.max(e.diagram.documentBounds.height, e.diagram.viewportBounds.height);
          },
          // ChangedSelection: (e) => {
          //   // selecting a task also selects the corresponding bar in myGantt
          //   if (myChangingSelection) return;
          //   myChangingSelection = true;
          //   const bars = [];
          //   e.diagram.selection.each((part) => {
          //     if (part instanceof go.Node) bars.push(myTasks.findNodeForData(part.data));
          //   });
          //   myTasks.selectCollection(bars);
          //   myChangingSelection = false;
          // },
          model: new go.GraphLinksModel(
            {
              linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
            })
        });

        const myTimeline = new go.Part('Graduated', { // the timeline at the top of the myGantt viewport
          layerName: 'Adornment',
          pickable: false,
          position: new go.Point(-26, 0), // position will be set in "ViewportBoundsChanged" listener
          graduatedTickUnit: GridCellWidth // each tick is one day
          // assume graduatedMax == length of line
        })
          .add(
            new go.Shape('LineH', {
              name: 'MAIN',
              strokeWidth: 0, // don't draw the actual line
              height: TimelineHeight, // width will be set in "DocumentBoundsChanged" listener
              background: 'lightgray'
            }),
            new go.Shape('LineV', {
              name: 'TICKS',
              interval: 7, // once per week
              alignmentFocus: new go.Spot(0.5, 0, 0, -TimelineHeight / 2), // tick marks cross over the timeline itself
              stroke: 'lightgray',
              strokeWidth: 0.5
            }),
            new go.TextBlock({
              alignmentFocus: go.Spot.Left,
              interval: 7, // once per week
              graduatedFunction: valueToText,
              graduatedSkip: (val, tb) => val > tb.panel.graduatedMax - GridCellWidth * 7 // don't show last label
            })
          );
      myGantt.add(myTimeline);
    
      const myGrid = new go.Part('Grid', { // the grid of horizontal lines
        layerName: 'Grid',
        pickable: false,
        position: new go.Point(0, 0),
        gridCellSize: new go.Size(3000, GridCellHeight)
      })
        .add(
          new go.Shape('LineH', { strokeWidth: 0.5 })
        );
      myGantt.add(myGrid);
    
      const myHighlightDay = new go.Part({ // the vertical highlighter covering the day where the mouse is
        layerName: 'Grid',
        visible: false,
        pickable: false,
        background: 'rgba(255,0,0,0.2)',
        position: new go.Point(0, 0),
        width: GridCellWidth,
        height: GridCellHeight
      });
      myGantt.add(myHighlightDay);
    
      const myHighlightTask = new go.Part({ // the horizontal highlighter covering the current task
        layerName: 'Grid',
        visible: false,
        pickable: false,
        background: 'rgba(0,0,255,0.2)',
        position: new go.Point(0, 0),
        width: GridCellWidth,
        height: GridCellHeight
      });
      myGantt.add(myHighlightTask);
    

      var myChangingSelection = false;

    // define a simple Node template
    myGantt.nodeTemplate =
      new go.Node('Spot', {
        selectionAdorned: false,
        // selectionChanged: (node) => {
        //   node.diagram.commit((diag) => {
        //     node.findObject('SHAPE').fill = node.isSelected ? 'dodgerblue' : (node.data && node.data.color) || 'gray';
        //   }, null);
        // },
        minLocation: new go.Point(0, NaN),
        maxLocation: new go.Point(Infinity, NaN),
        toolTip: go.GraphObject.build('ToolTip')
          .add(
            new go.Panel('Table', { defaultAlignment: go.Spot.Left })
              .addColumnDefinition(1, { separatorPadding: 3 })
              .add(
                new go.TextBlock({ row: 0, column: 0, columnSpan: 9, font: 'bold 12pt sans-serif' })
                  .bind('text'),
                new go.TextBlock({ row: 1, column: 0 }, 'start:'),
                new go.TextBlock({ row: 1, column: 1 })
                  .bind('text', 'start', (d) => 'day ' + convertUnitsToDays(d).toFixed(0)),
                new go.TextBlock({ row: 2, column: 0 }, 'length:'),
                new go.TextBlock({ row: 2, column: 1 })
                  .bind('text', 'duration', (d) => convertUnitsToDays(d).toFixed(0) + ' days')
              )
          ),
        resizable: true,
        resizeObjectName: 'SHAPE',
        resizeAdornmentTemplate: new go.Adornment('Spot')
          .add(
            new go.Placeholder(),
            new go.Shape('Diamond', {
              alignment: go.Spot.Right,
              width: 8,
              height: 8,
              strokeWidth: 0,
              fill: 'fuchsia',
              cursor: 'e-resize'
            })
          ),
        mouseOver: (e, node) => myGantt.mouseOver(e),
        ...standardContextMenus()
      })
        .bindTwoWay('position', 'start', convertStartToPosition, convertPositionToStart)
        .bindObject('resizable', 'isTreeLeaf')
        .bindTwoWay('isTreeExpanded')
        .add(
          new go.Shape({
            name: 'SHAPE',
            height: 18,
            margin: new go.Margin(1, 0),
            strokeWidth: 0,
            fill: 'gray'
          })
            .bind('fill', 'color')
            .bindTwoWay('width', 'duration', convertDurationToW, convertWToDuration)
            .bindObject('figure', 'isTreeLeaf', (leaf) => (leaf ? 'Rectangle' : 'RangeBar')),
          // "RangeBar" is defined above as a custom figure
          new go.TextBlock({
            font: '8pt sans-serif',
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, 0, -2)
          })
            .bind('text')
            .bind('stroke', 'color', (c) => (go.Brush.isDark(c) ? '#DDDDDD' : '#333333'))
        );

        myGantt.linkTemplate = new go.Link({ visible: false });

  myGantt.linkTemplateMap.add('Dep',
    new go.Link({
      routing: go.Routing.Orthogonal,
      isTreeLink: false,
      isLayoutPositioned: false,
      fromSpot: new go.Spot(0.999999, 1),
      toSpot: new go.Spot(0.000001, 0)
    })
      .add(
        new go.Shape({ stroke: 'brown', strokeWidth: 3 }),
        new go.Shape({ toArrow: 'Standard', fill: 'brown', strokeWidth: 0, scale: 0.75 })
      )
  );

    return myGantt;
  }

  return (
    <ReactDiagram
      divClassName={'diagram-component'}
      initDiagram={initDiagram}
      // initDiagram: () => go.Diagram;
      // style?: React.CSSProperties;
      nodeDataArray={[
        { "key": 0, "text": "Project X", "start": 0, "duration": 85 },
        { "key": 1, "text": "Task 1", "color": "darkgreen", "start": 0, "duration": 19 },
        { "key": 11, "text": "Task 1.1", "color": "green", "duration": 7, "start": 0 },
        { "key": 12, "text": "Task 1.2", "color": "green", "start": 7, "duration": 12 },
        { "key": 121, "text": "Task 1.2.1", "color": "lightgreen", "duration": 3, "start": 7 },
        { "key": 122, "text": "Task 1.2.2", "color": "lightgreen", "duration": 5, "start": 10 },
        { "key": 123, "text": "Task 1.2.3", "color": "lightgreen", "duration": 4, "start": 15 },
        { "key": 2, "text": "Task 2", "color": "darkblue", "start": 10, "duration": 40 },
        { "key": 21, "text": "Task 2.1", "color": "blue", "duration": 15, "start": 10 },
        { "key": 22, "text": "Task 2.2", "color": "goldenrod", "start": 25, "duration": 14 },
        { "key": 221, "text": "Task 2.2.1", "color": "yellow", "duration": 8, "start": 25 },
        { "key": 222, "text": "Task 2.2.2", "color": "yellow", "duration": 6, "start": 33 },
        { "key": 23, "text": "Task 2.3", "color": "darkorange", "start": 39, "duration": 11 },
        { "key": 231, "text": "Task 2.3.1", "color": "orange", "duration": 11, "start": 39 },
        { "key": 3, "text": "Task 3", "color": "maroon", "start": 50, "duration": 35 },
        { "key": 31, "text": "Task 3.1", "color": "brown", "duration": 10, "start": 50 },
        { "key": 32, "text": "Task 3.2", "color": "brown", "start": 60, "duration": 25 },
        { "key": 321, "text": "Task 3.2.1", "color": "lightsalmon", "duration": 8, "start": 60 },
        { "key": 322, "text": "Task 3.2.2", "color": "lightsalmon", "duration": 3, "start": 68 },
        { "key": 323, "text": "Task 3.2.3", "color": "lightsalmon", "duration": 7, "start": 71 },
        { "key": 324, "text": "Task 3.2.4", "color": "lightsalmon", "duration": 5, "start": 71 },
        { "key": 325, "text": "Task 3.2.5", "color": "lightsalmon", "duration": 4, "start": 76 },
        { "key": 326, "text": "Task 3.2.6", "color": "lightsalmon", "duration": 5, "start": 80 }
      ]}
      linkDataArray={[
        { "from": 0, "to": 1 },
        { "from": 1, "to": 11 },
        { "from": 1, "to": 12 },
        { "from": 12, "to": 121 },
        { "from": 12, "to": 122 },
        { "from": 12, "to": 123 },
        { "from": 0, "to": 2 },
        { "from": 2, "to": 21 },
        { "from": 2, "to": 22 },
        { "from": 22, "to": 221 },
        { "from": 22, "to": 222 },
        { "from": 2, "to": 23 },
        { "from": 23, "to": 231 },
        { "from": 0, "to": 3 },
        { "from": 3, "to": 31 },
        { "from": 3, "to": 32 },
        { "from": 32, "to": 321 },
        { "from": 32, "to": 322 },
        { "from": 32, "to": 323 },
        { "from": 32, "to": 324 },
        { "from": 32, "to": 325 },
        { "from": 32, "to": 326 },
        { "from": 11, "to": 2, "category": "Dep" }
      ]}
      modelData={{ "origin": 1531540800000 }}
      skipsDiagramUpdate={false}
    // onModelChange?: (e: go.IncrementalData) => void;
    />
  );
};

export default GanttChart;
