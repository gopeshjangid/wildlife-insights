import React from 'react';
import Group from '../group';
import './styles.scss';

const Tick = ({ maxX, scaleY, value }) => {
  return (
    <Group className="c-barchart-axis-y-tick" x={0} y={scaleY(value)}>
      <line
        className="c-tlch-grid-x__line"
        stroke="#ecf4f1"
        strokeWidth=".2"
        x1={10}
        y1={0}
        x2={maxX + 50}
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
  const ticks = scaleY.ticks();
  const [, MaxY] = scaleY.range();
  const [, MaxX] = scaleX.range();

  return (
    <Group className="c-tlch-axis-y-right" x={0} y={0}>
      <Group className="c-tlch-axis-y-right" x={0} y={0}>
        {ticks.map(tick => (
          <Tick maxX={MaxX} key={tick} scaleY={scaleY} value={tick} />
        ))}
      </Group>
      <text
        className="c-linechart-axis-x-tick__label"
        y="0"
        textAnchor="middle"
        x={100}
        transform="rotate(-90) translate(-260,-35)"
        alignmentBaseline="middle"
        dy=".11em"
      >
        Species Richness
      </text>
      <line className="c-tlch-grid-x__line" y1={0} y2={MaxY} x1={10} x2={10} />
    </Group>
  );
};

export default React.memo(AxisY);
