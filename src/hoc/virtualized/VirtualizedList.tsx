import React, { ForwardedRef, forwardRef, memo, RefObject, useCallback, useMemo } from 'react';
import { Animated, FlatList, FlatListProps, StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { withScrollEndEvent } from "../../utils/scrolling";
import type { KeyExtractor, ListMethods, PickerItem, RenderPickerItem } from "../../base/types";

// TODO "any" is not an exact type. How to pass the generic type?
const ExtendedAnimatedFlatList = withScrollEndEvent(Animated.FlatList<any>);
export type AdditionalProps = Pick<FlatListProps<any>, 'initialNumToRender' | 'maxToRenderPerBatch' | 'windowSize' | 'updateCellsBatchingPeriod'>;
type VirtualizedListProps<ItemT extends PickerItem<any>> = {
  data: ReadonlyArray<ItemT>;
  keyExtractor: KeyExtractor<ItemT>;
  renderItem: RenderPickerItem<ItemT>;
  itemHeight: number;
  pickerHeight: number;
  visibleItemCount: number;
  readOnly: boolean;
  initialIndex: number;
  scrollOffset: Animated.Value;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
  onScrollEnd: () => void;
  contentContainerStyle: StyleProp<ViewStyle> | undefined;
} & AdditionalProps;
const VirtualizedList = <ItemT extends PickerItem<any>,>({
  initialIndex,
  data,
  keyExtractor,
  renderItem,
  itemHeight,
  pickerHeight,
  visibleItemCount,
  readOnly,
  scrollOffset,
  onTouchEnd,
  onTouchStart,
  onTouchCancel,
  onScrollEnd,
  contentContainerStyle: contentContainerStyleProp,
  initialNumToRender,
  maxToRenderPerBatch,
  updateCellsBatchingPeriod = 10,
  windowSize,
  ...restProps
}: VirtualizedListProps<ItemT>, forwardedRef: ForwardedRef<ListMethods>) => {
  const snapToOffsets = useMemo(() => data.map((_, i) => i * itemHeight), [data, itemHeight]);
  const onScroll = useMemo(() => Animated.event([{
    nativeEvent: {
      contentOffset: {
        y: scrollOffset
      }
    }
  }], {
    useNativeDriver: true
  }), [scrollOffset]);
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  }), [itemHeight]);
  const contentContainerStyle = useMemo(() => {
    return [{
      paddingVertical: (pickerHeight - itemHeight) / 2
    }, contentContainerStyleProp];
  }, [pickerHeight, itemHeight, contentContainerStyleProp]);
  return <ExtendedAnimatedFlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} scrollEventThrottle={16} scrollEnabled={!readOnly} {...restProps} ref={forwardedRef as RefObject<FlatList>} data={data as Animated.WithAnimatedObject<typeof data>} renderItem={renderItem} keyExtractor={keyExtractor} getItemLayout={getItemLayout} initialScrollIndex={initialIndex} onScroll={onScroll} snapToOffsets={snapToOffsets} style={styles.list} contentContainerStyle={contentContainerStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={onTouchCancel} onScrollEnd={onScrollEnd} initialNumToRender={initialNumToRender ?? Math.ceil(visibleItemCount / 2)} maxToRenderPerBatch={maxToRenderPerBatch ?? Math.ceil(visibleItemCount / 2)} updateCellsBatchingPeriod={updateCellsBatchingPeriod} windowSize={windowSize} nestedScrollEnabled={true} removeClippedSubviews={false} />;
};
const styles = StyleSheet.create({
  list: {
    width: '100%',
    overflow: 'visible'
  }
});
export default memo(forwardRef(VirtualizedList));