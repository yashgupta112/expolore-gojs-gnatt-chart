// GanttChart.js
import { DiagramWrapper } from './goChartWrapper-old';
// import './GanttChart.css'; // Optional: For custom styling

const GanttChart = () => {
  // Sample data representing tasks with start and end dates
  const options = { "class": "GraphLinksModel",
    "modelData": {"origin":1531540800000},
    "nodeDataArray": [
  {"key":0,"text":"Project X","start":0,"duration":85},
  {"key":1,"text":"Task 1","color":"darkgreen","start":0,"duration":19},
  {"key":11,"text":"Task 1.1","color":"green","duration":7,"start":0},
  {"key":12,"text":"Task 1.2","color":"green","start":7,"duration":12},
  {"key":121,"text":"Task 1.2.1","color":"lightgreen","duration":3,"start":7},
  {"key":122,"text":"Task 1.2.2","color":"lightgreen","duration":5,"start":10},
  {"key":123,"text":"Task 1.2.3","color":"lightgreen","duration":4,"start":15},
  {"key":2,"text":"Task 2","color":"darkblue","start":10,"duration":40},
  {"key":21,"text":"Task 2.1","color":"blue","duration":15,"start":10},
  {"key":22,"text":"Task 2.2","color":"goldenrod","start":25,"duration":14},
  {"key":221,"text":"Task 2.2.1","color":"yellow","duration":8,"start":25},
  {"key":222,"text":"Task 2.2.2","color":"yellow","duration":6,"start":33},
  {"key":23,"text":"Task 2.3","color":"darkorange","start":39,"duration":11},
  {"key":231,"text":"Task 2.3.1","color":"orange","duration":11,"start":39},
  {"key":3,"text":"Task 3","color":"maroon","start":50,"duration":35},
  {"key":31,"text":"Task 3.1","color":"brown","duration":10,"start":50},
  {"key":32,"text":"Task 3.2","color":"brown","start":60,"duration":25},
  {"key":321,"text":"Task 3.2.1","color":"lightsalmon","duration":8,"start":60},
  {"key":322,"text":"Task 3.2.2","color":"lightsalmon","duration":3,"start":68},
  {"key":323,"text":"Task 3.2.3","color":"lightsalmon","duration":7,"start":71},
  {"key":324,"text":"Task 3.2.4","color":"lightsalmon","duration":5,"start":71},
  {"key":325,"text":"Task 3.2.5","color":"lightsalmon","duration":4,"start":76},
  {"key":326,"text":"Task 3.2.6","color":"lightsalmon","duration":5,"start":80}
  ],
    "linkDataArray": [
  {"from":0,"to":1},
  {"from":1,"to":11},
  {"from":1,"to":12},
  {"from":12,"to":121},
  {"from":12,"to":122},
  {"from":12,"to":123},
  {"from":0,"to":2},
  {"from":2,"to":21},
  {"from":2,"to":22},
  {"from":22,"to":221},
  {"from":22,"to":222},
  {"from":2,"to":23},
  {"from":23,"to":231},
  {"from":0,"to":3},
  {"from":3,"to":31},
  {"from":3,"to":32},
  {"from":32,"to":321},
  {"from":32,"to":322},
  {"from":32,"to":323},
  {"from":32,"to":324},
  {"from":32,"to":325},
  {"from":32,"to":326},
  {"from":11,"to":2,"category":"Dep"}
  ],
  selectedKey: null,
  skipsDiagramUpdate: false};

  return (
    <div>
      <DiagramWrapper
        nodeDataArray={options.nodeDataArray}
        linkDataArray={options.linkDataArray}
        modelData={options.modelData}
        skipsDiagramUpdate={options.skipsDiagramUpdate}
        // onDiagramEvent={this.handleDiagramEvent}
        // onModelChange={this.handleModelChange}
      />
      {/* {selKey} */}
    </div>
  );
};

export default GanttChart;
