import * as d3 from 'd3';
import './style.scss';

export function createToolTip() {
  return d3
    .select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute');
}

export function createToolTipSvg(svg) {
  const group = svg
    .append('g')
    .style('opacity', 0) 
  group
    .append('rect')
    .attr('fill', 'white')
    .attr('filter', 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 1))')
    .attr('width', 100)
    .attr('height', 50)
    .attr('rx', "10")
    .attr('ry',"10")
    .style("border-radius", "5px")
    .style('position', 'absolute');
  return group;
}

export function sortByDateAscending(a, b) {
  // Dates will be cast to numbers automagically:
  return new Date(`${a.year}-${a.month}`) - new Date(`${b.year}-${b.month}`)
}
