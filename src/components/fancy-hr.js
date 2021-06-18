import React from 'react';

const FancyHr = ({ className = '' }) => {
  return <hr className={`fade-edges ${className}`} />;
};

export default FancyHr;
