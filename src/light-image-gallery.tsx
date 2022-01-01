import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ImageTransition } from './light-image-transition';
import {
  LightImageItemProps,
  LightImageProps,
  LightImageItem,
  RenderItem,
} from './';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useRefs } from './hooks/useRefs';
import { useRef } from 'react';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { GestureEvent } from 'react-native-gesture-handler';
import { TapGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { PinchGestureHandler } from 'react-native-gesture-handler';
const timingConfig = {
  duration: 240,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};
export type EventsCallbacks = {
  onSwipeToClose?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onScaleStart?: () => void;
  onPanStart?: () => void;
  onLongPress?: () => void;
};

type ImageDimensions = {
  height: number;
  width: number;
};

export type RenderItemInfo<T> = {
  index: number;
  item: T;
  setImageDimensions: (imageDimensions: ImageDimensions) => void;
};
export type GalleryRef = {
  setIndex: (newIndex: number) => void;
  reset: (animated?: boolean) => void;
};
export type GalleryReactRef = React.Ref<GalleryRef>;

type LightImageGalleryProps<T> = EventsCallbacks & {
  ref?: GalleryReactRef;
  data: T[];
  renderItem?: RenderItem<T>;
  keyExtractor?: (item: T, index: number) => string | number;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  numToRender?: number;
  emptySpaceWidth?: number;
  doubleTapScale?: number;
  doubleTapInterval?: number;
  maxScale?: number;
  style?: ViewStyle;
  containerDimensions?: { width: number; height: number };
  pinchEnabled?: boolean;
  disableTransitionOnScaledImage?: boolean;
  hideAdjacentImagesOnScaledImage?: boolean;
  disableVerticalSwipe?: boolean;
  disableSwipeUp?: boolean;
  loop?: boolean;
  onScaleChange?: (scale: number) => void;
  onScaleChangeRange?: { start: number; end: number };
};
export const LightImageGallery = <T extends any>({
  initialIndex = 0,
  emptySpaceWidth = 40,
  data,
  containerDimensions,
  keyExtractor,
  ...rest
}: LightImageGalleryProps<T>) => {
  const windowDimensions = useWindowDimensions();
  const dimensions = containerDimensions || windowDimensions;
  const [index, setIndex] = useState(initialIndex);
  const backdropOpacity = useSharedValue(0);
  const animationProgress = useSharedValue(0);

  const currentIndex = useSharedValue(initialIndex);
  const translateX = useSharedValue(
    initialIndex * -(dimensions.width + emptySpaceWidth),
  );
  const backdropStyles = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  useEffect(() => {
    if (index >= data.length) {
      const newIndex = data.length - 1;
      setIndex(newIndex);
      currentIndex.value = newIndex;
      translateX.value = newIndex * -(dimensions.width + emptySpaceWidth);
    }
    animationProgress.value = withTiming(1, timingConfig);
    backdropOpacity.value = withTiming(1, timingConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.length]);
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[styles.backdrop, backdropStyles]} />
      {data.map((item, i) => {
        return (
          <LightImageItem
            key={keyExtractor ? keyExtractor(item, i) : i}
            currentIndex={currentIndex}
            {...rest}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    backgroundColor: '#fff',
  },

  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
});
