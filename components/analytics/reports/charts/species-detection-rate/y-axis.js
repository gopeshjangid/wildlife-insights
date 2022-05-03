import React from 'react';
import Group from '../group';
import './styles.scss';

const Tick = ({ scaleX, maxX, scaleY, value, format }) => {
  return (
    <Group className="c-barchart-axis-y-tick" x={0} y={scaleY(value)}>
      <line
        className="c-tlch-grid-x__line"
        stroke="#ecf4f1"
        strokeWidth=".2"
        x1={10}
        y1={0}
        x2={maxX + 100}
        y2={0}
      />
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
  const ticks = scaleY.ticks(4);
  const [, MaxY] = scaleY.range();
  const [, MaxX] = scaleX.range();

  return (
    <Group className="c-tlch-axis-y-right" x={0} y={0}>
      <Group className="c-tlch-axis-y-right" x={0} y={0}>
        {ticks.map(tick => (
          <Tick
            maxX={MaxX}
            key={tick}
            scaleX={scaleX}
            scaleY={scaleY}
            value={tick}
          />
        ))}
      </Group>
      <line className="c-tlch-grid-x__line" y1={0} y2={MaxY} x1={10} x2={10} />
    </Group>
  );
};

export default React.memo(AxisY);
