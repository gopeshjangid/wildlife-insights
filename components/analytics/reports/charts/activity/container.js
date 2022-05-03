import React from 'react';
import Group from '../group';
import XAxis from '../axis/area-x-axis';
import YAxis from '../axis/y-axis';
import HorizontalLine from '../horizontal-lines';

const Chart = ({ x, y, scaleX, scaleY, ...props }) => {
  const { xAxis, yAxis, showHorizontalLine } = props;

  return (
    <svg viewBox="0 0 800 500" className={props.className}>
      <Group x={50} y={60}>
        {yAxis && <YAxis scaleX={scaleX} scaleY={scaleY} />}
        {yAxis?.label && (
          <text transform={`rotate(-90) translate(-160,${-35})`}>
            {yAxis?.label}
          </text>
        )}
        <Group x={20} y={0}>
          {props.children}
          {xAxis && (
            <Group x={0} y={20}>
              <XAxis scaleX={scaleX} scaleY={scaleY} />
              {xAxis?.label && (
                <text transform={`translate(300,${382})`}>{xAxis?.label}</text>
              )}
            </Group>
          )}
          <HorizontalLine scaleX={scaleX} scaleY={scaleY} />
        </Group>
      </Group>
    </svg>
  );
};

export default Chart;
