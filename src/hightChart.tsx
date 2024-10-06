// GanttChart.js
import React from 'react';
import Highcharts from 'highcharts/highcharts-gantt';
import HighchartsReact from 'highcharts-react-official';

const Highchart = () => {
//   const chartOptions = {
//     title: {
//       text: 'Project Timeline',
//     },
//     series: [
//       {
//         name: 'Project 1',
//         data: [
//           {
//             name: 'Planning',
//             start: Date.UTC(2024, 9, 1),
//             end: Date.UTC(2024, 9, 3),
//           },
//           {
//             name: 'Development',
//             start: Date.UTC(2024, 9, 3),
//             end: Date.UTC(2024, 9, 8),
//             dependency: 0, // Dependency on the 'Planning' task
//           },
//           {
//             name: 'Testing',
//             start: Date.UTC(2024, 9, 8),
//             end: Date.UTC(2024, 9, 15),
//             dependency: 1, // Dependency on the 'Development' task
//           },
//           {
//             name: 'Deployment',
//             start: Date.UTC(2024, 9, 15),
//             end: Date.UTC(2024, 9, 20),
//             dependency: 2, // Dependency on the 'Testing' task
//           },
//         ],
//       },
//     ],
//   };
const today = new Date(),
    day = 1000 * 60 * 60 * 24;

// Set to 00:00:00:000 today
today.setUTCHours(0);
today.setUTCMinutes(0);
today.setUTCSeconds(0);
today.setUTCMilliseconds(0);  
const chartOptions = {
    title: {
        text: 'Highcharts Gantt With Subtasks'
    },
    xAxis: {
        min: today.getTime() - (2 * day),
        max: today.getTime() + (32 * day)
    },
    accessibility: {
        keyboardNavigation: {
            seriesNavigation: {
                mode: 'serialize'
            }
        },
        point: {
            descriptionFormatter: function (point: { dependency: any; series: { chart: { get: (arg0: any) => { (): any; new(): any; name: any; }; }; }; }) {
                const dependency = point.dependency &&
                        point.series.chart.get(point.dependency).name,
                    dependsOn = dependency ?
                        ' Depends on ' + dependency + '.' : '';

                return Highcharts.format(
                    '{point.yCategory}. Start {point.x:%Y-%m-%d}, end ' +
                    '{point.x2:%Y-%m-%d}.{dependsOn}',
                    { point, dependsOn }
                );
            }
        }
    },
    lang: {
        accessibility: {
            axis: {
                xAxisDescriptionPlural: 'The chart has a two-part X axis ' +
                    'showing time in both week numbers and days.'
            }
        }
    },
    series: [{
        name: 'Project 1',
        data: [{
            name: 'Planning',
            id: 'planning',
            start: today.getTime(),
            end: today.getTime() + (20 * day)
        }, {
            name: 'Requirements',
            id: 'requirements',
            parent: 'planning',
            start: today.getTime(),
            end: today.getTime() + (5 * day)
        }, {
            name: 'Design',
            id: 'design',
            dependency: 'requirements',
            parent: 'planning',
            start: today.getTime() + (3 * day),
            end: today.getTime() + (20 * day)
        }, {
            name: 'Layout',
            id: 'layout',
            parent: 'design',
            start: today.getTime() + (3 * day),
            end: today.getTime() + (10 * day)
        }, {
            name: 'Graphics',
            parent: 'design',
            dependency: 'layout',
            start: today.getTime() + (10 * day),
            end: today.getTime() + (20 * day)
        }, {
            name: 'Develop',
            id: 'develop',
            start: today.getTime() + (5 * day),
            end: today.getTime() + (30 * day)
        }, {
            name: 'Create unit tests',
            id: 'unit_tests',
            dependency: 'requirements',
            parent: 'develop',
            start: today.getTime() + (5 * day),
            end: today.getTime() + (8 * day)
        }, {
            name: 'Implement',
            id: 'implement',
            dependency: 'unit_tests',
            parent: 'develop',
            start: today.getTime() + (8 * day),
            end: today.getTime() + (30 * day)
        }]
    }]
}

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'ganttChart'}
        options={chartOptions}
      />
    </div>
  );
};

export default Highchart;
