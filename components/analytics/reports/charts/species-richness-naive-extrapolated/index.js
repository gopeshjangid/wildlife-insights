import React from 'react';
import * as d3 from 'd3';
import Group from '../group';
import XAxis from './x-axis';
import YAxis from './y-axis';
import Component from './component';
import './styles.scss';

export const margin = 50;
const Chart = ({ data }) => {
  data = [
    {
      date: new Date('2012-01-01T00:00:00Z'),
      rate: { v1: 0.1, v2: 0.4, v3: 0.7, extrapolated: 0.8 }
    },
    {
      date: new Date('2012-02-01T00:00:00Z'),
      rate: { v1: 2, v2: 5, v3: 18, extrapolated: 19 }
    },
    {
      date: new Date('2012-03-01T00:00:00Z'),
      rate: { v1: 15, v2: 17, v3: 19, extrapolated: 14 }
    },
    {
      date: new Date('2012-04-01T00:00:00Z'),
      rate: { v1: 13, v2: 16, v3: 19, extrapolated: 22 }
    },
    {
      date: new Date('2012-05-01T00:00:00Z'),
      rate: { v1: 14, v2: 17, v3: 11, extrapolated: 13 }
    }
  ];

  const height = 600;
  const width = 900;
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
    .domain([
      0,
      d3.max(data.map(row => Math.max.apply(null, Object.values(row.rate))))
    ])
    .range([height - margin, 0])
    .clamp(true);

  return (
    <svg viewBox="0 0 1000 700" className="chart-container">
      <Group x={margin} y={10}>
        <XAxis scaleY={scaleY} scaleX={scaleX} />
        <YAxis scaleY={scaleY} scaleX={scaleX} />
        <Component data={data} scaleY={scaleY} scaleX={scaleX} />
      </Group>
    </svg>
  );
};

export default Chart;
