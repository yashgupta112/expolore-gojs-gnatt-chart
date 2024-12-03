/*
*  Copyright (C) 1998-2021 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import {
  GanttLayout,
  GridCellWidth, GridCellHeight, TimelineHeight,
  convertDaysToUnits, convertUnitsToDays,
  convertDurationToW, convertWToDuration,
  convertStartToPosition, convertPositionToStart,
  valueToText
} from './GanttLayout';

import './Diagram.css';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onModelChange: (e: go.IncrementalData) => void;
}

export class DiagramWrapper extends React.Component<DiagramProps, {}> {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private myTasksRef: React.RefObject<ReactDiagram>;
  private myGanttRef: React.RefObject<ReactDiagram>;

  // the timeline
  private myTimeline: go.Part;

  // a model shared between the diagrams
  private sharedModel: go.GraphLinksModel;

  private changingView: boolean = false;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.myTasksRef = React.createRef();
    this.myGanttRef = React.createRef();

    this.sharedModel = go.GraphObject.make(go.GraphLinksModel, { linkKeyProperty: "key" });

    this.myTimeline =
      go.GraphObject.make(go.Part, "Graduated",
        {
          layerName: "Adornment",
          location: new go.Point(0, 0),
          locationSpot: go.Spot.Left,
          locationObjectName: "MAIN",
          graduatedTickUnit: GridCellWidth
        },
        go.GraphObject.make(go.Shape, "LineH", { name: "MAIN", strokeWidth: 0, height: TimelineHeight, background: "lightgray" }),
        go.GraphObject.make(go.Shape, { name: "TICKS", geometryString: "M0 0 V1000", interval: 7, stroke: "lightgray", strokeWidth: 0.5 }),
        go.GraphObject.make(go.TextBlock,
          {
            alignmentFocus: go.Spot.Left,
            interval: 7,  // once per week
            graduatedFunction: valueToText
          }
        )
      );

    // the custom figure used for task bars that have downward points at their ends
    go.Shape.defineFigureGenerator("RangeBar", (shape, w, h) => {
      const b = Math.min(5, w);
      const d = Math.min(5, h);
      return new go.Geometry()
        .add(new go.PathFigure(0, 0, true)
          .add(new go.PathSegment(go.PathSegment.Line, w, 0))
          .add(new go.PathSegment(go.PathSegment.Line, w, h))
          .add(new go.PathSegment(go.PathSegment.Line, w-b, h-d))
          .add(new go.PathSegment(go.PathSegment.Line, b, h-d))
          .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
    });

    this.onMyTasksVpbChanged = this.onMyTasksVpbChanged.bind(this);
    this.onMyGanttVpbChanged = this.onMyGanttVpbChanged.bind(this);
    this.layoutGantt = this.layoutGantt.bind(this);
    this.initMyTasks = this.initMyTasks.bind(this);
    this.initMyGantt = this.initMyGantt.bind(this);
  }

  private onMyTasksVpbChanged(e: go.DiagramEvent) {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();
    
    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      if (this.changingView) return;
      this.changingView = true;
      myGantt.scale = myTasks.scale;
      myGantt.position = new go.Point(myGantt.position.x, myTasks.position.y);
      this.myTimeline.position = new go.Point(this.myTimeline.position.x, myTasks.viewportBounds.position.y);
      this.changingView = false;
    }
  }

  private onMyGanttVpbChanged(e: go.DiagramEvent) {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();
    
    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      if (this.changingView) return;
      this.changingView = true;
      myTasks.scale = myGantt.scale;
      myTasks.position = new go.Point(myTasks.position.x, myGantt.position.y);
      this.myTimeline.position = new go.Point(this.myTimeline.position.x, myGantt.viewportBounds.position.y);
      this.changingView = false;
    }
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  public componentDidMount() {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();
    
    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      (myGantt.layout as GanttLayout).myTasks = myTasks;
      myGantt.layoutDiagram(true);

      myTasks.addDiagramListener("ViewportBoundsChanged", this.onMyTasksVpbChanged);
      myGantt.addDiagramListener("ViewportBoundsChanged", this.onMyGanttVpbChanged);
    }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  public componentWillUnmount() {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();
    
    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      myTasks.removeDiagramListener("ViewportBoundsChanged", this.onMyTasksVpbChanged);
      myGantt.removeDiagramListener("ViewportBoundsChanged", this.onMyGanttVpbChanged);
    }
  }

  private layoutGantt() {
    const myGantt = this.myGanttRef.current?.getDiagram();
    if (myGantt instanceof go.Diagram) myGantt.layoutDiagram(true);
  }

  private standardContextMenus() {
    const $ = go.GraphObject.make;
    return {
        contextMenu: $("ContextMenu",
          $("ContextMenuButton",
            $(go.TextBlock, "Details..."),
            {
              click: (e, button) => {
                const task = (button.part as go.Adornment).adornedPart;
                if (task === null) return;
                console.log("show HTML panel with details about the task " + task.text);
              }
            }
          ),
          $("ContextMenuButton",
            $(go.TextBlock, "New Task"),
            {
              click: (e, button) => {
                const task = (button.part as go.Adornment).adornedPart;
                if (task === null) return;
                e.diagram.model.commit(m => {
                  const newdata = { key: undefined, text: "New Task", color: task.data.color, duration: convertDaysToUnits(5) };
                  m.addNodeData(newdata);
                  (m as go.GraphLinksModel).addLinkData({ from: task.key, to: newdata.key });
                  e.diagram.select(e.diagram.findNodeForData(newdata));
                });
              }
            }
          )
        )
    };
  }

  private initMyTasks(): go.Diagram {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    // the left side of the whole diagram
    const myTasks =
      new go.Diagram({
        "undoManager.isEnabled": true,
        model: this.sharedModel,
        initialContentAlignment: go.Spot.Right,
        padding: new go.Margin(TimelineHeight + 10, 0, 0, 0),
        hasVerticalScrollbar: false,
        allowMove: false,
        allowCopy: false,
        "commandHandler.deletesTree": true,
        layout: $(
          go.TreeLayout,
          {
            alignment: go.TreeLayout.AlignmentStart,
            compaction: go.TreeLayout.CompactionNone,
            layerSpacing: 28,
            layerSpacingParentOverlap: 1,
            nodeIndentPastParent: 1,
            nodeSpacing: 10,
            portSpot: go.Spot.Bottom,
            childPortSpot: go.Spot.Left,
            arrangementSpacing: new go.Size(0, 0),
          }
        ),
        "animationManager.isInitial": false,
        "TreeCollapsed": this.layoutGantt,
        "TreeExpanded": this.layoutGantt,
      });
  
    // Add header to the myTasks diagram
    // const myTasksHeader = $(
    //   go.Part,
    //   "Table", // Specify it as a Part of type Table
    //   {
    //     layerName: "Adornment", // This ensures it appears on a separate layer
    //     pickable: false,
    //     position: new go.Point(-26, 0), // Adjust as needed
    //     columnSizing: go.Sizing.None,
    //     selectionAdorned: false,
    //     height: GridCellHeight,
    //     background: "lightgray",
    //   },
    //   $(
    //     go.RowColumnDefinition,
    //     { column: 0, width: 14 }
    //   ),
    //   $(
    //     go.RowColumnDefinition,
    //     { column: 1 }
    //   ),
    //   $(
    //     go.RowColumnDefinition,
    //     { column: 2, width: 40, alignment: go.Spot.Right, separatorPadding: new go.Margin(0, 4), separatorStroke: "gray" }
    //   ),
    //   $(
    //     go.RowColumnDefinition,
    //     { column: 3, width: 40, alignment: go.Spot.Right, separatorPadding: new go.Margin(0, 4), separatorStroke: "gray" }
    //   ),
    //   $(
    //     go.TextBlock,
    //     "Name",
    //     { column: 1, font: "bold 12pt sans-serif", margin: new go.Margin(2, 0, 2, 5) }
    //   ),
    //   $(
    //     go.TextBlock,
    //     "Start",
    //     { column: 2, font: "bold 12pt sans-serif", margin: new go.Margin(2, 0, 2, 5) }
    //   ),
    //   $(
    //     go.TextBlock,
    //     "Dur.",
    //     { column: 3, font: "bold 12pt sans-serif", margin: new go.Margin(2, 0, 2, 5) }
    //   )
    // );
  
    // myTasks.add(myTasksHeader);
  
    myTasks.nodeTemplate = $(
      go.Node,
      "Horizontal",
      { height: 56 },
      new go.Binding("isTreeExpanded").makeTwoWay(),
      $("TreeExpanderButton", { portId: "", scale: 0.85 }),
      $(
        go.TextBlock,
        { editable: true },
        new go.Binding("text").makeTwoWay()
      ),
      this.standardContextMenus()
    );
  
    myTasks.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.Orthogonal,
        fromEndSegmentLength: 1,
        toEndSegmentLength: 1,
      },
      $(go.Shape)
    );
  
    myTasks.linkTemplateMap.add(
      "Dep",
      $(
        go.Link, // ignore these links in the Tasks diagram
        { visible: false, isTreeLink: false }
      )
    );
  
    return myTasks;
  }
  

  private initMyGantt(): go.Diagram {
    const $ = go.GraphObject.make;

    // the right side of the whole diagram
    const myGantt =
      new go.Diagram(
        {
          "undoManager.isEnabled": true,
          model: this.sharedModel,
          initialPosition: new go.Point(-7, -100),  // show labels
          padding: new go.Margin(TimelineHeight, 0, 0, 0),
          scrollMargin: new go.Margin(0, GridCellWidth*7, 0, 0),  // show a week beyond
          allowCopy: false,
          "commandHandler.deletesTree": true,
          "draggingTool.isGridSnapEnabled": true,
          "draggingTool.gridSnapCellSize": new go.Size(GridCellWidth, GridCellHeight),
          "draggingTool.dragsTree": true,
          "resizingTool.isGridSnapEnabled": true,
          "resizingTool.cellSize": new go.Size(GridCellWidth, GridCellHeight),
          "resizingTool.minSize": new go.Size(GridCellWidth, GridCellHeight),
          layout: $(GanttLayout),
          "animationManager.isInitial": false,
          "SelectionMoved": e => e.diagram.layoutDiagram(true),
          "DocumentBoundsChanged": e => {
            // the grid extends to only the area needed
            const b = e.diagram.documentBounds;
            const gridpart = e.diagram.parts.first();
            if (gridpart !== null && gridpart.type === go.Panel.Grid) {
              gridpart.desiredSize = new go.Size(b.right - gridpart.position.x, b.bottom);
            }
            // the timeline only covers the needed area
            if (this.myTimeline) {
              const main = this.myTimeline.findObject("MAIN");
              if (main) main.width = b.right;
              const ticks = this.myTimeline.findObject("TICKS");
              if (ticks) ticks.height = e.diagram.viewportBounds.height;
              this.myTimeline.graduatedMax = b.right;
            }
          }
        });

    myGantt.add($(go.Part, "Grid",
      { layerName: "Grid", position: new go.Point(-10, 0), gridCellSize: new go.Size(3000, GridCellHeight), defaultSeparatorPadding: 10 },
      $(go.Shape, "LineH", { strokeWidth: 0.2 })
    ));

    myGantt.nodeTemplate =
      $(go.Node, "Spot",
        {
          selectionAdorned: false,
          selectionChanged: (node: go.Part) => {
            node.diagram?.commit(diag => {
              var shp = node.findObject("SHAPE") as go.Shape;
              if (shp) shp.fill = node.isSelected ? "dodgerblue" : (node.data && node.data.color) || "gray";
            }, null);
          },
          minLocation: new go.Point(0, NaN),
          maxLocation: new go.Point(Infinity, NaN),
          toolTip:
            $("ToolTip",
              $(go.Panel, "Table",
                { defaultAlignment: go.Spot.Left },
                $(go.RowColumnDefinition, { column: 1, separatorPadding: 3 }),
                $(go.TextBlock, { row: 0, column: 0, columnSpan: 9, font: "bold 12pt sans-serif" }, new go.Binding("text")),
                $(go.TextBlock, { row: 1, column: 0 }, "start:"),
                $(go.TextBlock, { row: 1, column: 1 }, new go.Binding("text", "start", d => "day " + convertUnitsToDays(d).toFixed(0))),
                $(go.TextBlock, { row: 2, column: 0 }, "length:"),
                $(go.TextBlock, { row: 2, column: 1 }, new go.Binding("text", "duration", d => convertUnitsToDays(d).toFixed(0) + " days")),
              )
            ),
          resizable: true,
          resizeObjectName: "SHAPE",
          resizeAdornmentTemplate: $(go.Adornment, "Spot",
            $(go.Placeholder),
            $(go.Shape, "Diamond",
              {
                alignment: go.Spot.Right,
                width: 8, height: 8,
                strokeWidth: 0,
                fill: "fuchsia",
                cursor: 'e-resize'
              }
            )
          )
        },
        this.standardContextMenus(),
        new go.Binding("position", "start", convertStartToPosition).makeTwoWay(convertPositionToStart),
        new go.Binding("resizable", "isTreeLeaf").ofObject(),
        new go.Binding("isTreeExpanded").makeTwoWay(),
        $(go.Shape,
          { name: "SHAPE", height: 28, margin: new go.Margin(40  - 28, 0), strokeWidth: 0, fill: "gray" },
          new go.Binding("fill", "color"),
          new go.Binding("width", "duration", convertDurationToW).makeTwoWay(convertWToDuration),
          new go.Binding("figure", "isTreeLeaf", leaf => "Rectangle" ).ofObject()),
          // "RangeBar" is defined above as a custom figure
        $(go.TextBlock,
          { font: "12pt sans-serif", alignment: go.Spot.LeftCenter, alignmentFocus: new go.Spot(0, 0, 0, 5) },
          new go.Binding("text"),
          new go.Binding("stroke", "color", c => go.Brush.isDark(c) ? "#DDDDDD" : "#333333"))
      );

    myGantt.linkTemplate =
      $(go.Link, { visible: false });

    myGantt.linkTemplateMap.add("Dep",
      $(go.Link,
        {
          routing: go.Link.Orthogonal,
          isTreeLink: false, isLayoutPositioned: false,
          fromSpot: new go.Spot(0.999999, 1), toSpot: new go.Spot(0.000001, 0)
        },
        $(go.Shape, { stroke: "brown" }),
        $(go.Shape, { toArrow: "Standard", fill: "brown", strokeWidth: 0, scale: 0.75 })
      ));

    myGantt.add(this.myTimeline);

    return myGantt;
  }

  public render() {
    return (
      <div className='gojs-wrapper-div'>
        <ReactDiagram
          ref={this.myTasksRef}
          divClassName='myTasks'
          initDiagram={this.initMyTasks}
          nodeDataArray={this.props.nodeDataArray}
          linkDataArray={this.props.linkDataArray}
          modelData={this.props.modelData}
          onModelChange={this.props.onModelChange}
          skipsDiagramUpdate={this.props.skipsDiagramUpdate}
        />
        <ReactDiagram
          ref={this.myGanttRef}
          divClassName='myGantt'
          initDiagram={this.initMyGantt}
          nodeDataArray={this.props.nodeDataArray}
          linkDataArray={this.props.linkDataArray}
          modelData={this.props.modelData}
          skipsDiagramUpdate={this.props.skipsDiagramUpdate}
        />
      </div>
    );
  }
}
