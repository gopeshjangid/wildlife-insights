import React from "react";

const SVG = ({ children, ...props }) => {
  return <svg {...props}>{children}</svg>;
};

export default React.memo(SVG);
