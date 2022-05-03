import React from 'react';
import Group from '../group';

import './styles.scss';

const Tick = React.memo(({ scaleX, tick }) => {
  return (
    <>
      <text
        className="c-linechart-axis-x-tick__label"
        y="0"
        textAnchor="middle"
        x={scaleX(tick)}
        alignmentBaseline="middle"
      >
        {tick}
      </text>
    </>
  );
});

const AxisX = props => {
  const { scaleX, scaleY } = props;
  const ticks = scaleX.ticks(10);
  const [minY, maxY] = scaleY.range();
  const [minX, maxX] = scaleX.range();
  return (
    <Group x={0} y={minY} className="x-axis">
      <Group x={minX} y={20}>
        {ticks.map((tick, index) => (
          <Tick
            key={'tick-' + index}
            index={index}
            scaleX={scaleX}
            tick={tick}
          />
        ))}
      </Group>
      <line
        strokeWidth="1"
        stroke="#D5E4E7"
        x1="10"
        y1="0"
        x2={maxX + minX}
        y2={0}
      />
    </Group>
  );
};

export default React.memo(AxisX);
