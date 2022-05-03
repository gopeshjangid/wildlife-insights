import React from 'react';
import Group from './group';

const Chart = ({ x, y, ...props }) => {
  return (
    <svg {...props} className={props.className}>
      <Group x={x} y={y}>
        {' '}
        {props.children}
      </Group>
    </svg>
  );
};

export default Chart;
