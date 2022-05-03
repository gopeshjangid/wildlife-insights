import React from 'react';

const Group = React.forwardRef(({ x = 0, y = 0, ...props }, ref) => {
  const pass = {
    ...((x || y) && { transform: `translate(${x} ${y})` }),
    ...props
  };
  return <g ref={ref} {...pass} />;
});

export default React.memo(Group);
