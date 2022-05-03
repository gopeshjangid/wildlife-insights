import React from 'react';
import Group from '../group';
import XAxis from './x-axis';
import YAxis from './y-axis';
import Component from './component';
import * as d3 from 'd3';
import { sortByDateAscending } from '../utils';

const margin = 15;

const Chart = ({ data }) => {
  const height = 600;
  const width = 1300;

  data.sort(sortByDateAscending)

  const parsedData =  [
    ...new Map(data.map((item) => [`${item["year"]}-${item["month"]}`, item])).values(),
  ]
  parsedData.sort(sortByDateAscending)
  const dates = parsedData.map(val => {
    return new Date(`${val.year}-${val.month}`)
  })

  const upperMeanValues = parsedData.map(val => {
    return val.upp_95ci;
  })

  const minDate = new Date(d3.min(dates));
  const minDomainVal = new Date(minDate.setMonth(minDate.getMonth() - 1));
  const maxDate = new Date(d3.max(dates));
  const maxDomainVAl = new Date(maxDate.setMonth(maxDate.getMonth() + 1))

  let scaleX = d3
    .scaleTime()
    .domain([
      minDomainVal,
      maxDomainVAl
    ])
    .range([margin, width])
    .clamp(true);

  const scaleY = d3
    .scaleLinear()
    .domain([d3.max(upperMeanValues), 0.0])
    .range([margin, height - margin])
    .clamp(true);

  return (
    <svg viewBox="0 0 1500 1100" className="chart-container">
      <Group x={margin} y={10}>
        <XAxis scaleY={scaleY} scaleX={scaleX} isMultiYear={minDomainVal.getFullYear() === maxDomainVAl.getFullYear()} parsedData={parsedData}/>
        <YAxis scaleY={scaleY} scaleX={scaleX} />
        <Component
          data={parsedData}
          scaleY={scaleY}
          scaleX={scaleX}
        />
      </Group>
    </svg>
  );
};

export default Chart;
