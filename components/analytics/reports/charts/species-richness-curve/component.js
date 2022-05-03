import React from 'react';
import * as d3 from 'd3';
import Group from '../group';
import useD3 from '../useD3Hook';
import { createToolTip } from '../utils';

export default ({ scaleX, scaleY, data }) => {
  const ref = useD3(svg => {
    const tooltip = createToolTip();
    let margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
    let curveWidth = 15;

    svg = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const onMouseOver = (d, i) => {
      var coords = d3.pointer(d);
      let value = scaleY.invert(coords[1]);
      tooltip
        .style('opacity', '1')
        .style('left', d.pageX + 15 + 'px')
        .style('top', d.pageY - 28 + 'px')
        .style('cursor', 'pointer')
        .html(value.toFixed(4));
    };
    const onMouseOut = () => {
      tooltip.style('opacity', '0');
    };

    const curve = d3
      .line()
      .curve(d3.curveBasis)
      .x(function(d) {
        return scaleX(d.species);
      })
      .y(function(d) {
        return scaleY(d.richness);
      });

    svg
      .append('path')
      .datum(data)
      .attr('fill', '#cce5df')
      .attr(
        'd',
        d3
          .area()
          .x0(function(d) {
            return scaleX(d.species) - curveWidth;
          })
          .x1(function(d) {
            return scaleX(d.species) + curveWidth;
          })
          .y0(function(d) {
            return scaleY(d.richness) - curveWidth;
          })
          .y1(function(d) {
            return scaleY(d.richness) + curveWidth;
          })
          .curve(d3.curveBasis)
      );

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', '3')
      .attr('d', curve(data))
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut);
  }, []);

  return <Group ref={ref} x={0} y={0}></Group>;
};
