import React from 'react';
import Group from '../group';
import XAxis from './x-axis';
import YAxis from './y-axis';
import Component from './component';
import * as d3 from 'd3';

const Chart = ({ data }) => {
  const margin = 50;
  const height = 600;
  const width = 800;

  data = [
    { species: 5, richness: 1 },
    { species: 10, richness: 6 },
    { species: 18, richness: 11 },
    { species: 25, richness: 10 },
    { species: 28, richness: 6 },
    { species: 30, richness: 9 },
    { species: 34, richness: 8 }
  ]; // this data will be removed once actual data will be passed from parent component

  let scaleX = d3
    .scaleLinear()
    .domain([0, d3.max(data.map(d => d.species))])
    .range([margin, width])
    .clamp(true);

  const scaleY = d3
    .scaleLinear()
    .domain([0, d3.max(data.map(d => d.richness))])
    .range([height - margin, 0])
    .clamp(true);

  return (
    <svg viewBox="0 0 900 600" className="chart-container">
      <Group x={margin} y={10}>
        <XAxis scaleY={scaleY} scaleX={scaleX} />
        <YAxis scaleY={scaleY} scaleX={scaleX} />
        <Component data={data} scaleY={scaleY} scaleX={scaleX} />
        <text
          className="c-linechart-axis-x-tick__label"
          y="-20"
          textAnchor="middle"
          x={scaleX(scaleX.domain()[1])}
          alignmentBaseline="middle"
        >
          Max richness {scaleY.domain()[1]}
        </text>
      </Group>
    </svg>
  );
};

export default Chart;
