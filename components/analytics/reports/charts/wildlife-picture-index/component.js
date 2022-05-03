import React from 'react';
import * as d3 from 'd3';
import Group from '../group';
import useD3 from '../useD3Hook';
import { createToolTip } from '../utils';

export default ({ scaleX, scaleY, data }) => {
  const ref = useD3(svg => {
    const tooltip1 = createToolTip();
    const tooltip2 = createToolTip();
    const tooltip3 = createToolTip();

    let margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
    let curveWidth = 15;

    // append the svg object to the body of the page
    svg = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    svg
      .append('path')
      .datum(data)
      .attr('fill', '#cce5df')
      .attr(
        'd',
        d3
          .area()
          .x0(function(d) {
            return scaleX(d.date) - curveWidth;
          })
          .x1(function(d) {
            return scaleX(d.date) + curveWidth;
          })
          .y0(function(d) {
            return scaleY(d.index) - curveWidth;
          })
          .y1(function(d) {
            return scaleY(d.index) + curveWidth;
          })
      );

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#72c990')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line()
          .x(function(d) {
            return scaleX(d.date);
          })
          .y(function(d) {
            return scaleY(d.index);
          })
      );

    // Add the points
    svg
      .append('g')
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return scaleX(d.date);
      })
      .attr('cy', function(d) {
        return scaleY(d.index);
      })
      .attr('r', 7)
      .attr('fill', '#72c990');
  }, []);

  return <Group ref={ref} x={0} y={0}></Group>;
};
