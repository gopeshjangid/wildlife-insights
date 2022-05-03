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
    const onMouseOver = (d, i) => {
      const value1 = i.rate.v1.toFixed(4);
      const value2 = i.rate.v2.toFixed(4);
      const value3 = i.rate.v3.toFixed(4);
      const [, y] = d3.pointer(d);
      const x1 = scaleX(value1);
      const x2 = scaleX(value2);
      const x3 = scaleX(value3);
      tooltip1.style('opacity', '1');
      tooltip2.style('opacity', '1');
      tooltip3.style('opacity', '1');
      tooltip1
        .html(value1)
        .style('left', x1 + 'px')
        .style('top', y + 'px');
      tooltip2
        .html(value2)
        .style('left', x2 + 15 + 'px')
        .style('top', y + 'px');
      tooltip3
        .html(value3)
        .style('left', x3 + 15 + 'px')
        .style('top', y + 'px');
    };
    const onMouseOut = (d, i) => {
      tooltip1
        .transition()
        .duration(0)
        .style('opacity', '0');
      tooltip2
        .transition()
        .duration(0)
        .style('opacity', '0');
      tooltip3
        .transition()
        .duration(0)
        .style('opacity', '0');
    };

    svg
      .selectAll('line, circle')
      .data(data)
      .join('line')
      .style('cursor', 'pointer')
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut);

    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .style('cursor', 'pointer')
      .attr('cx', d => scaleX(d.rate.v2))
      .attr('cy', d => scaleY(d.name))
      .attr('r', 8)
      .attr('stroke-width', 2)
      .attr('fill', 'green')
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut);
  }, []);

  return (
    <Group ref={ref} x={-50} y={0}>
      {data.map(row => (
        <line
          strokeWidth="3"
          stroke="#E5E4E3"
          x1={scaleX(row.rate.v1)}
          y1={scaleY(row.name)}
          x2={scaleX(row.rate.v3)}
          y2={scaleY(row.name)}
        />
      ))}
    </Group>
  );
};
