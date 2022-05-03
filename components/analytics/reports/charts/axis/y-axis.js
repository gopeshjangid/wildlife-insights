import React from 'react';
import Group from '../group';

const Tick = ({ scaleX, scaleY, value, format }) => {
  const [minX] = scaleX.domain();
  return (
    <Group
      className="c-barchart-axis-y-tick"
      x={scaleX(minX)}
      y={scaleY(value)}
    >
      <text
        className={'c-barchart-axis-y-tick__label'}
        textAnchor="end"
        alignmentBaseline="middle"
      >
        {value}
      </text>
    </Group>
  );
};

const AxisY = ({ scaleX, scaleY }) => {
  const ticks = scaleY.ticks(5);
  const minX = scaleX.ticks(5);
  return (
    <Group className="c-tlch-axis-y-right" y={scaleX(minX)}>
      {ticks.map(tick => (
        <Tick key={tick} scaleX={scaleX} scaleY={scaleY} value={tick} />
      ))}
    </Group>
  );
};

export default React.memo(AxisY);
