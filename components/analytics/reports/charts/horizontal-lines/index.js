import React from 'react';
import Group from '../group';
import './styles.scss';

const HorizontalLines = ({ scaleX, scaleY }) => {
  const [minX, maxX] = scaleX.range();
  const ticks = scaleY.ticks(5);
  const marginX = 10;
  return (
    <Group className="c-tlch-grid-x">
      {ticks.map((tick, idx) => (
        <line
          className="c-tlch-grid-x__line"
          key={idx}
          x1={minX + marginX}
          y1={scaleY(tick)}
          x2={maxX}
          y2={scaleY(tick)}
        />
      ))}
    </Group>
  );
};

export default React.memo(HorizontalLines);
