import React from 'react';
import { formatCurrency } from '../utils';

const SankeyNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
  const isRight = x > containerWidth / 2;
  const nodeColor = payload.color || '#6366F1';

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={nodeColor} fillOpacity="0.9" rx="2" />
      <text
        textAnchor={isRight ? 'end' : 'start'}
        x={isRight ? x - 6 : x + width + 6}
        y={y + height / 2}
        dy="0.35em"
        className="font-bold fill-light-text dark:fill-dark-text"
      >
        {payload.name}
      </text>
      <text
        textAnchor={isRight ? 'end' : 'start'}
        x={isRight ? x - 6 : x + width + 6}
        y={y + height / 2 + 15}
        className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
      >
        {formatCurrency(payload.value, 'EUR')}
      </text>
    </g>
  );
};

export default SankeyNode;