import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Label } from 'recharts';
import numeral from 'numeral';
import sumBy from 'lodash/sumBy';
import classnames from 'classnames';

const PieSectorChart = ({ data }) => {
  const total = sumBy(data, 'value');
  const { length: totalLength } = total.toString();

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={80}
          fill="#8884d8"
        >
          {data.map(d => (
            <Cell key={`cell-${d.name}`} fill={d.color} />
          ))}
          <Label
            value={numeral(total).format('0,0')}
            position="center"
            className={classnames('custom-center-label', {
              medium: totalLength >= 6,
              small: totalLength >= 7,
            })}
          />
        </Pie>
        <Legend
          align="right"
          // @ts-ignore
          formatter={(value, { payload }) => `${numeral(payload.value).format('0,0')} ${value}`}
          iconType="circle"
          layout="vertical"
          verticalAlign="middle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

PieSectorChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

PieSectorChart.defaultProps = {
  data: null,
};

export default PieSectorChart;
