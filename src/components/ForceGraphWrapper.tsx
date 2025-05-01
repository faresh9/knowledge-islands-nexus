"use client";

import { forwardRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d'; // A simpler alternative without A-Frame

const ForceGraphWrapper = forwardRef((props, ref) => {
  return <ForceGraph2D ref={ref} {...props} />;
});

ForceGraphWrapper.displayName = 'ForceGraphWrapper';
export default ForceGraphWrapper;