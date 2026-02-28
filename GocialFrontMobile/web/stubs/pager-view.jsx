// Stub for react-native-pager-view on web
import React, { useState } from 'react';
import { View } from 'react-native-web';

const PagerView = React.forwardRef(({ children, style, initialPage, onPageSelected, ...props }, ref) => {
  const [page, setPage] = useState(initialPage || 0);
  const pages = React.Children.toArray(children);

  React.useImperativeHandle(ref, () => ({
    setPage: (index) => {
      setPage(index);
      onPageSelected && onPageSelected({ nativeEvent: { position: index } });
    },
    setPageWithoutAnimation: (index) => {
      setPage(index);
    },
  }));

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      {pages[page] || null}
    </View>
  );
});

PagerView.displayName = 'PagerView';

export default PagerView;
