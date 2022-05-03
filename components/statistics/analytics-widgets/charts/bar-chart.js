import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, LabelList, XAxis, Bar, Cell, ResponsiveContainer } from 'recharts';

const HorizontalBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
      <XAxis dataKey="name" tickLine={false} tickSize={10} axisLine={false} />
      <Bar
        isAnimationActive={false} // required to show the labels 🤷‍♂️
        barSize={50}
        dataKey="value"
        fill="#3BB2D0"
        label={{ position: 'top' }}
      >
        {data.map(entry => (
          <Cell key={entry.name} fill={entry.color || '#3BB2D0'} />
        ))}
        <LabelList dataKey="value" position="top" />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

HorizontalBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

HorizontalBarChart.defaultProps = {
  data: null,
};

export default HorizontalBarChart;
