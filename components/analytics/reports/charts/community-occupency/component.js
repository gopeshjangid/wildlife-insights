import React from 'react';
import Group from '../group';
import useD3 from '../useD3Hook';
import { createToolTip } from '../utils';

export default ({ scaleX, scaleY, data }) => {
  const ref = useD3(svg => {
    const tooltip = createToolTip();

    const onMouseOver = (d, i) => {
      const value = scaleX.invert(d.clientX).toFixed(2);
      tooltip.style('opacity', '1');
      tooltip
        .html(value)
        .style('left', d.pageX + 15 + 'px')
        .style('top', d.pageY - 28 + 'px')
        .style('cursor', 'pointer');
    };
    const onMouseOut = (d, i) => {
      tooltip
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
