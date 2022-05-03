import React from 'react';
import Group from '../group';
import XAxis from './x-axis';
import YAxis from './y-axis';
import Component from './component';
import * as d3 from 'd3';
export const margin = 50;
const Chart = ({ data }) => {
  data = [
    { index: 1, date: new Date('2012-01-01T00:00:00Z') },
    { index: 4.9, date: new Date('2012-02-01T00:00:00Z') },
    { index: 6.4, date: new Date('2012-03-01T00:00:00Z') },
    { index: 5.9, date: new Date('2012-04-01T00:00:00Z') },
    { index: 4.9, date: new Date('2012-05-01T00:00:00Z') },
    { index: 6.5, date: new Date('2012-06-01T00:00:00Z') },
    { index: 7.5, date: new Date('2012-07-01T00:00:00Z') },
    { index: 9.8, date: new Date('2012-08-01T00:00:00Z') }
  ];
  const height = 500;
  const width = 800;
  let scaleX = d3
    .scaleTime()
    .domain([
      new Date('2011-12-31T00:00:00Z'),
      new Date('2012-06-01T00:00:00Z')
    ])
    .range([margin, width])
    .clamp(true);

  const scaleY = d3
    .scaleLinear()
    .domain([0, d3.max(data.map(item => Math.ceil(item.index)))])
    .range([height - margin, 0])
    .clamp(true);

  return (
    <svg viewBox="0 0 900 600" className="chart-container">
      <Group x={margin} y={margin}>
        <XAxis scaleY={scaleY} scaleX={scaleX} />
        <YAxis scaleY={scaleY} scaleX={scaleX} />
        <Component data={data} scaleY={scaleY} scaleX={scaleX} />
      </Group>
    </svg>
  );
};

export default Chart;
