// Stub for @ptomasroos/react-native-multi-slider on web
import React from 'react';
import { View } from 'react-native-web';

const MultiSlider = ({ values, min, max, onValuesChange, sliderLength, ...props }) => (
  <View style={{ height: 40, justifyContent: 'center' }}>
    <input
      type="range"
      min={min || 0}
      max={max || 100}
      value={values ? values[0] : 50}
      onChange={(e) => onValuesChange && onValuesChange([Number(e.target.value)])}
      style={{ width: sliderLength || '100%' }}
    />
  </View>
);

export default MultiSlider;
