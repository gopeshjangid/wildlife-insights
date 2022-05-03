import React from 'react';
import * as d3 from 'd3';
import Group from '../group';
import useD3 from '../useD3Hook';
import { createToolTipSvg } from '../utils';

export default ({ scaleX, scaleY, data }) => {
  const ref = useD3(svg => {
    const onMouseOver = (d, i) => {
      var coords = d3.pointer(d);
      let x = coords[0];

      tooltipMean
        .style('opacity', '1')
        .attr(
          'transform',
          `translate(${x + 35}, ${scaleY(i.mean_det_rates) - 30})`
        )
        .classed('tooltip', true)
        .append('text')
        .text(i.mean_det_rates)
        .classed('tooltipText', true)
        .attr('transform', `translate(15,30)`)
        .style('fill', 'green')
        .style('font-size', '20px');
      tooltipLow
        .style('opacity', '1')
        .attr('transform', `translate(${x + 35}, ${scaleY(i.low_95ci) - 30})`)
        .classed('tooltip', true)
        .append('text')
        .attr('transform', `translate(10,30)`)
        .text(i.low_95ci)
        .classed('tooltipText', true)
        .attr('transform', `translate(15,30)`)
        .style('font-size', '20px');

      tooltipUpp
        .style('opacity', '1')
        .attr('transform', `translate(${x + 35}, ${scaleY(i.upp_95ci) - 30})`)
        .classed('tooltip', true)
        .append('text')
        .text(i.upp_95ci)
        .classed('tooltipText', true)
        .attr('transform', `translate(15,30)`)
        .style('font-size', '20px');
    };
    const onMouseOut = () => {
      svg.selectAll('.tooltipText').remove();
      tooltipMean.style('opacity', '0');
      tooltipLow.style('opacity', '0');
      tooltipUpp.style('opacity', '0');
    };
    svg
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', d => scaleX(new Date(`${d.year}-${d.month}`)))
      .attr('x2', d => scaleX(new Date(`${d.year}-${d.month}`)))
      .attr('y1', d => scaleY(d.low_95ci))
      .attr('y2', d => scaleY(d.upp_95ci))
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
      .attr('cx', d => scaleX(new Date(`${d.year}-${d.month}`)))
      .attr('cy', d => scaleY(d.mean_det_rates))
      .attr('r', 8)
      .attr('stroke-width', 2)
      .attr('fill', 'green')
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut);
    const tooltipMean = createToolTipSvg(svg);
    const tooltipLow = createToolTipSvg(svg);
    const tooltipUpp = createToolTipSvg(svg);
  }, []);

  return <Group ref={ref} x={0} y={0}></Group>;
};
