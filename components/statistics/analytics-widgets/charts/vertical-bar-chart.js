import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import {
  ResponsiveContainer,
  BarChart,
  YAxis,
  XAxis,
  Bar,
  LabelList,
  Cell,
} from 'recharts';

const VerticalBarChart = ({ data }) => {
  const marginRight = data?.[0].value ? 10 + `${data[0].value}`.length * 7 : 30;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: marginRight, left: 20, bottom: 5 }}
      >
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickLine={false}
          tickSize={10}
          axisLine={false}
        />
        <XAxis type="number" domain={[0, 'dataMax']} hide />
        <Bar
          isAnimationActive={false} // required to show the labels 🤷‍♂️
          barSize={20}
          dataKey="value"
          fill="#2E7B4F"
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={entry.color || '#2E7B4F'} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={value => numeral(value).format('0,0')}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

VerticalBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

VerticalBarChart.defaultProps = {
  data: null,
};

export default VerticalBarChart;
