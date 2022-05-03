import React from 'react';
import Group from '../group';
import XAxis from './x-axis';
import YAxis from './y-axis';
import Component from './component';
import * as d3 from 'd3';

const margin = 50;

const Chart = ({ data }) => {
  const height = 600;
  const width = 800;
  let scaleX = d3
    .scaleTime()
    .domain([
      new Date('2011-12-31T00:00:00Z'),
      new Date('2012-05-01T00:00:00Z')
    ])
    .range([margin, width])
    .clamp(true);

  const scaleY = d3
    .scaleLinear()
    .domain([1, 0.0])
    .range([margin, height - margin])
    .clamp(true);

  return (
    <svg viewBox="0 0 900 600" className="chart-container">
      <Group x={margin} y={10}>
        <XAxis scaleY={scaleY} scaleX={scaleX} />
        <YAxis scaleY={scaleY} scaleX={scaleX} />
        <Component data={data} scaleY={scaleY} scaleX={scaleX} />
      </Group>
    </svg>
  );
};

export default Chart;
