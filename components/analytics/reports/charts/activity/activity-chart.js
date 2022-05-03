import React, { useMemo } from 'react';
import Chart from './container';
import Group from '../group';
import useD3 from '../useD3Hook';
import * as d3 from 'd3';

function Activity() {
  const plotHeight = 300;
  const from = new Date(2022, 0, 1, 0);
  const to = new Date(2022, 0, 1, 24, 0);
  const plotWidth = 700;
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
    .domain([from, to])
    .range([0, plotWidth])
    .nice(4)
    .clamp(true);

  const data = [
    { x: new Date('2020-05-01T00:00:00Z'), y: 6 },
    { x: new Date('2020-05-01T00:00:00Z'), y: 8 },
    { x: new Date('2020-05-01T00:00:00Z'), y: 13 },
    { x: new Date('2020-04-01T00:00:00Z'), y: 15 },
    { x: new Date('2020-04-01T00:00:00Z'), y: 12 },
    { x: new Date('2020-04-01T00:00:00Z'), y: 26 },
    { x: new Date('2020-06-01T00:00:00Z'), y: 28 },
    { x: new Date('2020-06-01T00:00:00Z'), y: 29 },
    { x: new Date('2020-06-01T00:00:00Z'), y: 22 },
    { x: new Date('2020-01-01T00:00:00Z'), y: 12 },
    { x: new Date('2020-01-01T00:00:00Z'), y: 10 },
    { x: new Date('2020-01-01T00:00:00Z'), y: 6 }
  ];

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

      svg
        .append('path')
        .classed('shadow', true)
        .attr('d', curve(points))
        .attr('stroke', '#44a766')
        .attr('stroke-width', '3')
        .attr('fill', 'none');
    },
    [data]
  );
  return (
    <div className="detection-chart">
      <Chart
        xAxis={{ label: 'Day of time', hide: true }}
        yAxis={{ label: 'Frequency', hide: true }}
        showHorizontalLine={true}
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

export default React.memo(Activity);
