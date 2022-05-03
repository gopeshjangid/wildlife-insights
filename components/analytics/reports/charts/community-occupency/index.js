import React from 'react';
import Group from '../group';
import XAxis from './x-axis';
import YAxis from './y-axis';
import Component from './component';
import * as d3 from 'd3';

const margin = 50;

const Chart = ({ data }) => {
  data = [
    { name: 'Turkey Vulture', rate: { v1: 0.1, v2: 0.5, v3: 0.5 } },
    { name: 'Great Blue Heron', rate: { v1: 0.2, v2: 0.5, v3: 0.8 } },
    { name: 'Raccon', rate: { v1: 0.5, v2: 0.7, v3: 0.9 } },
    { name: 'Red Wolf', rate: { v1: 0.3, v2: 0.6, v3: 0.9 } },
    { name: 'Vignia Possum', rate: { v1: 0.4, v2: 0.7, v3: 1 } }
  ];

  const height = 600;
  const width = 800;
  const scaleY = d3
    .scaleBand()
    .domain(data.map(row => row.name))
    .range([margin, height - margin]);

  const scaleX = d3
    .scaleLinear()
    .domain([0.0, 1])
    .range([margin, width - margin])
    .clamp(true);

  return (
    <svg viewBox="0 0 900 600" className="chart-container">
      <Group x={margin + 100} y={margin}>
        <XAxis scaleY={scaleY} scaleX={scaleX} />
        <YAxis scaleY={scaleY} scaleX={scaleX} />
        <Component data={data} scaleY={scaleY} scaleX={scaleX} />
      </Group>
    </svg>
  );
};

export default Chart;
