import React from "react";
import moment from "moment";
import Group from "../group";
import * as d3 from 'd3';

import "./styles.scss";

const Tick = React.memo(({ tick, index, isMultiYear }) => {
  return (
    <text
      textAnchor="end"        
      alignmentBaseline="text-after-edge"
      dy=".35em"
      transform="rotate(-65)"
    >
      {index ? moment(tick).format("YYYY MMMM"): ((!isMultiYear)? moment(tick).format("YYYY MMMM"): '')}
    </text>
  );
});

const AxisX = (props) => {
  const { scaleX, scaleY, isMultiYear } = props;
  const ticks = scaleX.ticks(d3.timeMonth.every(1));

  const [minY, maxY] = scaleY.range();
  const [minX, maxX] = scaleX.range();
  return (
    <Group x={0} y={maxY} className="x-axis">
      {ticks.map((tick, index) => (
        <Group x={minX} y={20} transform={`translate(${scaleX(tick)},15)`}>
          <Tick
            key={"tick-" + index}
            index={index}
            tick={tick}
            isMultiYear={isMultiYear}
          />
          </Group>
      ))}
      <line
        stroke-width="1"
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
