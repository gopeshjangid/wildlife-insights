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

    const valueWrapper = (tooltip, d, value) => {
      tooltip
        .html(value.toFixed(4))
        .style('left', d.x - 10 + 'px')
        .style('top', d.y + 'px')
        .style('cursor', 'pointer');
    };
    const onMouseOver = (d, i) => {
      const value = i.rate;
      var coords = d3.pointer(d);
      let x = coords[0];
      x = d.x < x ? d.x : x;
      tooltip1.style('opacity', '1').classed('tooltip', true);
      tooltip2.style('opacity', '1').classed('tooltip', true);
      tooltip3.style('opacity', '1').classed('tooltip', true);
      valueWrapper(tooltip1, { x, y: scaleY(value.v1) }, value.v1);
      valueWrapper(tooltip2, { x, y: scaleY(value.v2) }, value.v2);
      valueWrapper(tooltip3, { x, y: scaleY(value.v3) }, value.v3);
    };
    const onMouseOut = () => {
      tooltip1.style('opacity', '0');
      tooltip2.style('opacity', '0');
      tooltip3.style('opacity', '0');
    };

    svg
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', d => scaleX(d.date))
      .attr('x2', d => scaleX(d.date))
      .attr('y1', d => scaleY(d.rate.v1))
      .attr('y2', d => scaleY(d.rate.v3))
      .attr('stroke', '#E5E4E3')
      .attr('stroke-width', '2')
      .style('cursor', 'pointer')
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut);

    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .style('cursor', 'pointer')
      .attr('cx', d => scaleX(d.date))
      .attr('cy', d => scaleY(d.rate.v2))
      .attr('r', 8)
      .attr('stroke-width', 2)
      .attr('fill', 'green')
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut);
  }, []);

  return <Group ref={ref} x={0} y={0}></Group>;
};
