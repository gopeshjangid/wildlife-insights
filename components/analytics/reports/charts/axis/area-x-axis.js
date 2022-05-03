import React from 'react';
import moment from 'moment';
import Group from '../group';
import * as d3 from 'd3';
import './styles.scss';

const Tick = React.memo(({ index, scaleX, tick, interval, tickFormat }) => {
  return (
    <Group className="c-linechart-axis-x-tick" x={scaleX(tick)} y={20}>
      <line stroke="currentColor" y2="6"></line>
      <text
        className="c-linechart-axis-x-tick__label"
        y="0"
        textAnchor="middle"
        alignmentBaseline="middle"
        y="9"
        dy=".71em"
      >
        {index % interval === 0 ? moment(tick).format('HH:00') : ''}
      </text>
    </Group>
  );
});

const AxisX = props => {
  const { scaleY, scaleX, interval = 4 } = props;
  const ticks = scaleX.ticks(d3.timeHour.every(1));
  const [minY, maxY] = scaleY.domain();
  const [minX, maxX] = scaleX.range();

  return (
    <Group x={10} y={scaleY(minY)}>
      <line
        strokeWidth="1"
        stroke="green"
        x1="0"
        y1="20"
        x2={maxX + 1}
        y2="17"
      />
      {ticks.map((tick, index) => (
        <Tick
          interval={interval}
          key={'tick-' + index}
          index={index}
          scaleX={scaleX}
          tick={tick}
        />
      ))}
    </Group>
  );
};

export default React.memo(AxisX);
