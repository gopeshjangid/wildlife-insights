import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');

  return d;
}

function LoadingSpinner(props) {
  const { progress } = props;
  const size = 24;
  const width = 3;
  const color = '#2E7B4F';
  const color2 = '#E3F4E9';

  const x = size / 2;
  const y = size / 2;
  const radius = (size - width * 2) / 2;
  const startAngle = 0;
  const endAngle = Math.round(progress * 360);

  return (
    <div className="c-progress-spinner">
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <circle
          cy={y}
          cx={x}
          fill="none"
          r={radius}
          strokeWidth={width}
          stroke={color2}
        />
        <path
          fill="none"
          stroke={color}
          strokeWidth={width}
          d={describeArc(x, y, radius, startAngle, endAngle)}
        />
      </svg>
    </div>
  );
}

LoadingSpinner.propTypes = {
  // Number between 0 and 1
  progress: PropTypes.number
};

LoadingSpinner.defaultProps = {
  progress: 0
};

export default LoadingSpinner;
