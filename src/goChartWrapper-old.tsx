import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

// props passed in from a parent component holding state, some of which will be passed to ReactDiagram
interface WrapperProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  // onDiagramEvent: (e: go.DiagramEvent) => void;
  // onModelChange: (e: go.IncrementalData) => void;
}

export class DiagramWrapper extends React.Component<WrapperProps, {}> {
  /**
   * Ref to keep a reference to the component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject<ReactDiagram>;

  constructor(props: WrapperProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener,
   * with the function using a switch statement to handle the events.
   * This is only necessary when you want to define additional app-specific diagram listeners.
   */
  public componentDidMount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      // diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   * This is only necessary when you have defined additional app-specific diagram listeners.
   */
  public componentWillUnmount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      // diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
   */
  private initDiagram(): go.Diagram {
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    const diagram =
      new go.Diagram(
        {
          'undoManager.isEnabled': true,  // must be set to allow for model change listening
          // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
          model: new go.GraphLinksModel(
            {
              linkKeyProperty: 'key',  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
              // positive keys for nodes
              makeUniqueKeyFunction: (m: go.Model, data: any) => {
                let k = data.key || 1;
                while (m.findNodeDataForKey(k)) k++;
                data.key = k;
                return k;
              },
              // negative keys for links
              makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
                let k = data.key || -1;
                while (m.findLinkDataForKey(k)) k--;
                data.key = k;
                return k;
              }
            })
        });

    // define a simple Node template
    diagram.nodeTemplate =
      new go.Node('Auto')  // the Shape will go around the TextBlock
        .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
        .add(
          new go.Shape('RoundedRectangle',
            {
              name: 'SHAPE', fill: 'white', strokeWidth: 0,
              // set the port properties:
              portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
            })
            // Shape.fill is bound to Node.data.color
            .bind('fill', 'color'),
          new go.TextBlock(
            { margin: 8, editable: true, font: '400 .875rem Roboto, sans-serif' })  // some room around the text
            .bindTwoWay('text')
        );

    // relinking depends on modelData
    diagram.linkTemplate =
      new go.Link()
        .bindModel('relinkableFrom', 'canRelink')
        .bindModel('relinkableTo', 'canRelink')
        .add(
          new go.Shape(),
          new go.Shape({ toArrow: 'Standard' })
        );

    return diagram;
  }

  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='diagram-component'
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        linkDataArray={this.props.linkDataArray}
        modelData={this.props.modelData}
        // onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}