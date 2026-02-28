// Stub for @react-native-community/datetimepicker on web
import React from 'react';

const DateTimePicker = ({ mode, value, onChange, ...props }) => (
  <input
    type={mode === 'date' ? 'date' : 'time'}
    value={value instanceof Date ? value.toISOString().split('T')[0] : ''}
    onChange={(e) => onChange && onChange({ type: 'set' }, new Date(e.target.value))}
    style={{ padding: 8, fontSize: 16 }}
  />
);

export default DateTimePicker;
