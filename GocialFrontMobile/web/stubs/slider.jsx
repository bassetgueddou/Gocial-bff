// Stub for @react-native-community/slider on web
import React from 'react';

const Slider = ({ value, minimumValue, maximumValue, onValueChange, style, ...props }) => (
  <input
    type="range"
    min={minimumValue || 0}
    max={maximumValue || 1}
    step={0.01}
    value={value || 0}
    onChange={(e) => onValueChange && onValueChange(Number(e.target.value))}
    style={{ width: '100%', ...(style || {}) }}
  />
);

export default Slider;
