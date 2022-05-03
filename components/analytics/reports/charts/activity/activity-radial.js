import React from 'react';
import * as d3 from 'd3';
import Group from '../group';
import useD3 from '../useD3Hook';
import moment from 'moment';
import Chart from '../chart';

export default ({ container, scaleX, scaleY }) => {
  const data = [
    { x: new Date('2020-09-01T00:00:00Z'), y: 9 },
    { x: new Date('2020-08-01T00:00:00Z'), y: 14 },
    { x: new Date('2020-07-01T00:00:00Z'), y: 21 },
    { x: new Date('2020-06-01T00:00:00Z'), y: 18 },
    { x: new Date('2020-05-01T00:00:00Z'), y: 24 },
    { x: new Date('2020-04-01T00:00:00Z'), y: 25 },
    { x: new Date('2020-03-01T00:00:00Z'), y: 4 },
    { x: new Date('2020-02-01T00:00:00Z'), y: 13 },
    { x: new Date('2020-01-01T00:00:00Z'), y: 16 },
    { x: new Date('2020-01-01T00:00:00Z'), y: 28 },
    { x: new Date('2020-01-01T00:00:00Z'), y: 29 },
    { x: new Date('2019-12-01T00:00:00Z'), y: 26.4 },
    { x: new Date('2019-11-01T00:00:00Z'), y: 5 }
  ];

  const ref = useD3(
    svg => {
      const tickData = [
        new Date(2022, 1, 1, 0),
        new Date(2022, 1, 1, 1),
        new Date(2022, 1, 1, 2),
        new Date(2022, 1, 1, 3),
        new Date(2022, 1, 1, 4),
        new Date(2022, 1, 1, 5),
        new Date(2022, 1, 1, 6)
      ];

      const from = new Date('2019-12-01T00:00:00Z'),
        to = new Date('2020-10-01T00:00:00Z');
      const margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = 460 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom,
        innerRadius = 80,
        outerRadius = Math.min(width, height) / 2;

      var band = d3
        .scaleBand()
        .domain(data.map(d => d.x))
        .range([0, 2 * Math.PI]);
      const colors = d3
        .scaleLinear()
        .domain([from, to])
        .range(['#ab6dc5', '#9ec94d', '#76b021', '#44a4f6']);

      var x = d3
        .scaleTime()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .domain([from, to]); // The domain of the X axis is the list of states.
      var x1 = d3
        .scaleLinear()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .domain([0, 30]);
      const ticks = x.ticks();
      // Y scale
      var y = d3
        .scaleLinear()
        .domain([0, 30])
        .range([innerRadius, outerRadius]); // Domain will be define later.
      // Domain of Y is from 0 to the max seen in the data
      svg
        .append('g')
        .selectAll('text')
        .data(ticks)
        .enter()
        .append('text')
        .attr('x', d => x1(d))
        .attr('y', d => y(d))
        .text(d => d);

      // Add bars
      svg
        .append('g')

        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('fill', '#72c990')
        .attr(
          'd',
          d3
            .arc() // imagine your doing a part of a donut plot
            .innerRadius(0)
            .outerRadius(function(d) {
              return y(d.y);
            })
            .startAngle(function(d) {
              return x(d.x);
            })
            .endAngle(function(d) {
              return x(d.x) + band.bandwidth();
            })
            .padAngle(0.1)
            .padRadius(10)
        );

      svg
        .append('g')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('id', function(d, i) {
          return 'monthArc_' + i;
        })
        .attr(
          'd',
          d3
            .arc() // imagine your doing a part of a donut plot
            .innerRadius(0)
            .outerRadius(180)
            .startAngle(function(d) {
              return x(d.x);
            })
            .endAngle(function(d) {
              return x(d.x) + 1;
            })
        )
        .attr('stroke', '#cad6ce') // <-- THIS
        .attr('stroke-width', '1') // <-- THIS
        .attr('fill', 'none');

      svg
        .selectAll('.monthText')
        .data(tickData)
        .enter()
        .append('text')
        .attr('class', 'monthText')
        .attr('x', 30) //Move the text from the start angle of the arc
        .attr('dy', -20) //Move the text down
        .append('textPath')
        .attr('xlink:href', function(d, i) {
          return '#monthArc_' + i;
        })
        .text(function(d) {
          return moment(d).format('HH A');
        })
        .attr('transform', 'rotate(90)');
    },
    [data]
  );

  return (
    <div className="detection-chart">
      <Chart x={100} y={100} viewBox="0 0 800 500" className="svg-container">
        <Group ref={ref} x={290} y={140}></Group>
      </Chart>
    </div>
  );
};
