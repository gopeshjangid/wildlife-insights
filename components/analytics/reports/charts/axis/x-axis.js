import React from 'react';
import moment from 'moment';
import Group from '../group';
import './styles.scss';

const Tick = ({ scaleX, tick }) => {
  return (
    <Group className="c-linechart-axis-x-tick" x={scaleX(tick)} y={20}>
      <text
        className="c-linechart-axis-x-tick__label"
        y="0"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {moment(tick).format('MMM yyyy')}
      </text>
    </Group>
  );
};

const AxisX = ({ scaleY, scaleX }) => {
  const ticks = scaleX.ticks(12, 1);
  const [minY] = scaleY.domain();

  return (
    <Group className="c-linechart-axis-x" y={scaleY(minY)}>
      {ticks.map((tick, index) => (
        <Tick scaleX={scaleX} key={index} tick={tick} />
      ))}
    </Group>
  );
};

export default React.memo(AxisX);
