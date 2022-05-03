import React, { useMemo } from 'react';
import Chart from './container';
import Group from '../group';
import * as d3 from 'd3';
import useD3 from '../useD3Hook';

function DoubleActivity() {
  const plotHeight = 300;
  const plotWidth = 700;
  const margin = { top: 10, right: 30, bottom: 30, left: 50 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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

  const scaleY = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, 30])
        .range([plotHeight, 0])
        .clamp(true)
        .nice(10),
    [plotHeight]
  );

  const scaleX = d3
    .scaleTime()
    .domain([new Date(2022, 0, 1, 0), new Date(2022, 0, 1, 24, 0)])
    .range([0, plotWidth])
    .nice(4)
    .clamp(true);
  const ref = useD3(
    svg => {
      const curve = d3.line().curve(d3.curveNatural);
      const points = [
        [0, 300],
        [30, 250],
        [50, 60],
        [120, 180],
        [150, 190],
        [160, 60],
        [170, 50],
        [190, 140],
        [200, 230]
      ];
      const points1 = [
        [10, 300],
        [140, 100],
        [190, 110],
        [220, 190],
        [230, 140],
        [230, 120],
        [250, 180],
        [260, 30]
      ];

      svg
        .append('path')
        .classed('shadow', true)
        .attr('d', curve(points))
        .attr('stroke', '#44a766')
        .attr('stroke-width', '3')
        .attr('fill', 'none');
      svg
        .append('path')
        .classed('shadow', true)
        .attr('d', curve(points1))
        .attr('stroke', '#cad6ce')
        .attr('fill', 'none');
      var points11 = [
        { xpoint: 25, ypoint: 120 },
        { xpoint: 75, ypoint: 150 },
        { xpoint: 100, ypoint: 150 },
        { xpoint: 100, ypoint: 50 },
        { xpoint: 200, ypoint: 150 }
      ];

      var margin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = 460 - margin.left - margin.right;

      var x = d3.scaleTime().rangeRound([0, width]);

      var y = d3.scaleLinear().rangeRound([600, 0]);

      var area = d3
        .area()
        .x(function(d) {
          return d.xpoint;
        })
        .y1(function(d) {
          return d.ypoint;
        });
      area.y0(y(0));

      x.domain(
        d3.extent(points11, function(d) {
          return d.xpoint;
        })
      );
      y.domain([
        0,
        d3.max(points11, function(d) {
          return d.ypoint;
        })
      ]);
      area.y0(y(0));
      svg
        .selectAll('path')
        .data(points11)
        .enter()
        .append('path')
        .attr('d', d => {
          return area;
        })
        .attr('fill', 'green')
        .attr('stroke', 'black');
    },
    [data]
  );
  return (
    <div className="detection-chart">
      <Chart
        xAxis={{ label: 'Day of time', hide: true }}
        yAxis={{ label: 'Frequency', hide: true }}
        showHorizontalLine
        scaleX={scaleX}
        scaleY={scaleY}
        viewBox="0 0 800 500"
        x={30}
        y={30}
        className="svg-container"
      >
        <Group ref={ref} x={90} y={0}></Group>
      </Chart>
    </div>
  );
}

export default React.memo(DoubleActivity);
