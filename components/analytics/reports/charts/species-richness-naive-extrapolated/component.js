import React from 'react';
import Group from '../group';
import useD3 from '../useD3Hook';

export default ({ scaleX, scaleY, data }) => {
  const [maxY] = scaleY.range();
  const [, maxX] = scaleX.range();
  const ref = useD3(svg => {
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
      .style('cursor', 'pointer');

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
      .attr('fill', 'green');

    svg
      .append('svg')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .style('cursor', 'pointer')
      .attr('cx', d => scaleX(d.date))
      .attr('cy', d => {
        return scaleY(d.rate.extrapolated);
      })
      .attr('r', 8)
      .attr('stroke-width', 3)
      .attr('fill', 'blue');
  }, []);

  return (
    <>
      <Group ref={ref} x={0} y={0}></Group>
      <Group x={maxX - 130} y={maxY - 120}>
        <rect rx="5" height="100" width="150" fill="white" className="board" />
        <circle cx={12} cy={35} r="5" fill="green" />
        <circle cx={12} cy={72} r="5" fill="blue" />

        <text
          className="richness-text"
          y={35}
          textAnchor="middle"
          x={65}
          font-size=".5em"
          alignmentBaseline="middle"
          dy=".11em"
        >
          Extrapolated Richness
        </text>
        <text
          className="richness-text"
          y={73}
          textAnchor="middle"
          font-size=".5em"
          x={53}
          alignmentBaseline="middle"
          dy=".11em"
        >
          Naive Richness
        </text>
        <text
          className="richness-text"
          y={10}
          textAnchor="middle"
          font-size=".8em"
          x={65}
          alignmentBaseline="middle"
          dy=".11em"
        >
          Species Richness
        </text>
      </Group>
    </>
  );
};
