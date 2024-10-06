import './App.css';
import Highchart from './hightChart';
// import GoChart from './goChart';
import GoGanttChart from './goChartGantt';


import { convertDaysToUnits } from './GanttLayout';

function App() {

  const object1 = {
    nodeDataArray: [
      { key: 0, text: "Project X" },
      { key: 1, text: "Task 1", color: "darkgreen" },
      { key: 11, text: "Task 1.1", color: "green", duration: convertDaysToUnits(10) },
      { key: 12, text: "Task 1.2", color: "green" },
      { key: 121, text: "Task 1.2.1", color: "lightgreen", duration: convertDaysToUnits(3) },
      { key: 122, text: "Task 1.2.2", color: "lightgreen", duration: convertDaysToUnits(5) },
      { key: 123, text: "Task 1.2.3", color: "lightgreen", duration: convertDaysToUnits(4) },
      { key: 2, text: "Task 2", color: "darkblue" },
      { key: 21, text: "Task 2.1", color: "blue", duration: convertDaysToUnits(15), start: convertDaysToUnits(10) },
      { key: 22, text: "Task 2.2", color: "goldenrod" },
      { key: 221, text: "Task 2.2.1", color: "yellow", duration: convertDaysToUnits(8) },
      { key: 222, text: "Task 2.2.2", color: "yellow", duration: convertDaysToUnits(6) },
      { key: 23, text: "Task 2.3", color: "darkorange" },
      { key: 231, text: "Task 2.3.1", color: "orange", duration: convertDaysToUnits(11) },
      { key: 3, text: "Task 3", color: "maroon" },
      { key: 31, text: "Task 3.1", color: "brown", duration: convertDaysToUnits(10) },
      { key: 32, text: "Task 3.2", color: "brown" },
      { key: 321, text: "Task 3.2.1", color: "lightsalmon", duration: convertDaysToUnits(8) },
      { key: 322, text: "Task 3.2.2", color: "lightsalmon", duration: convertDaysToUnits(3) },
      { key: 323, text: "Task 3.2.3", color: "lightsalmon", duration: convertDaysToUnits(7) },
      { key: 324, text: "Task 3.2.4", color: "lightsalmon", duration: convertDaysToUnits(5), start: convertDaysToUnits(71) },
      { key: 325, text: "Task 3.2.5", color: "lightsalmon", duration: convertDaysToUnits(4) },
      { key: 326, text: "Task 3.2.6", color: "lightsalmon", duration: convertDaysToUnits(5) },
    ],
    linkDataArray: [
      { key: -1, from: 0, to: 1 },
      { key: -2, from: 1, to: 11 },
      { key: -3, from: 1, to: 12 },
      { key: -4, from: 12, to: 121 },
      { key: -5, from: 12, to: 122 },
      { key: -6, from: 12, to: 123 },
      { key: -7, from: 0, to: 2 },
      { key: -8, from: 2, to: 21 },
      { key: -9, from: 2, to: 22 },
      { key: -10, from: 22, to: 221 },
      { key: -11, from: 22, to: 222 },
      { key: -12, from: 2, to: 23 },
      { key: -13, from: 23, to: 231 },
      { key: -14, from: 0, to: 3 },
      { key: -15, from: 3, to: 31 },
      { key: -16, from: 3, to: 32 },
      { key: -17, from: 32, to: 321 },
      { key: -18, from: 32, to: 322 },
      { key: -19, from: 32, to: 323 },
      { key: -20, from: 32, to: 324 },
      { key: -21, from: 32, to: 325 },
      { key: -22, from: 32, to: 326 },
      { key: -23, from: 11, to: 2, category: "Dep" },
    ],
    modelData: {
      origin: 1531540800000,  // new Date(2018, 6, 14);
    },
    selectedData: null,
    skipsDiagramUpdate: false
  };
  const object2 = {
    nodeDataArray: [
      {
        key: 1,
        text: 'Planning',
        start: 0,
        duration: 20,
        color: '#2caffe'
      },
      {
        key: 2,
        text: 'Requirements',
        start: 0,
        duration: 5,
        color: '#544fc5'
      },
      {
        key: 3,
        text: 'Design',
        start: 3,
        duration: 17,
        color: '#00e272'
      },
      { key: 4, text: 'Layout', start: 3, duration: 7, color: '#fe6a35' },
      {
        key: 5,
        text: 'Graphics',
        start: 10,
        duration: 10,
        color: '#6b8abc'
      },
      {
        key: 6,
        text: 'Develop',
        start: 5,
        duration: 25,
        color: '#d568fb'
      },
      {
        key: 7,
        text: 'Create unit tests',
        start: 5,
        duration: 3,
        color: '#2ee0ca'
      },
      {
        key: 8,
        text: 'Implement',
        start: 8,
        duration: 22,
        color: '#fa4b42'
      }
    ],
    linkDataArray: [
      { key: -2, from: 2, to: 3 },
      { key: -4, from: 4, to: 5 },
      { key: -6, from: 2, to: 7 },
      { key: -7, from: 7, to: 8 }
    ],
    modelData: {
      origin: 1672511400000,  // new Date(2023, 0, 1);
    },
    selectedData: null,
    skipsDiagramUpdate: false
  };
  return (
    <div className="App">
      <Highchart />
      {/* <GoChart /> */}

      <GoGanttChart config = {object2} />
      <GoGanttChart config = {object1} />
      
    </div>
  );
}

export default App;
