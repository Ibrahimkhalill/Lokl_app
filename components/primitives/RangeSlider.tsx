import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent } from "react-native";
import { Colors } from "../../constants/colors";

const THUMB = 34;

export interface RangeSliderProps {
  value: number;
  min: number;
  max: number;
  /** Value granularity, e.g. 0.1 for a score or 1 for miles. */
  step?: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  /** Text shown inside the thumb. Defaults to the value. */
  label?: (value: number) => string;
}

/**
 * A draggable slider that follows the finger smoothly.
 * It reads the finger's absolute screen position (pageX) against the track's measured position, so the
 * value does not jump when the thumb itself is touched, and it keeps one gesture handler for its whole life.
 */
export function RangeSlider({ value, min, max, step = 1, onChange, onChangeEnd, label }: RangeSliderProps) {
  const trackRef = useRef<View>(null);
  const geom = useRef({ left: 0, width: 1 });
  const latest = useRef({ value, min, max, step, onChange, onChangeEnd });
  latest.current = { value, min, max, step, onChange, onChangeEnd };
  const [width, setWidth] = useState(1);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const measure = (then?: () => void) => {
    trackRef.current?.measureInWindow((x, _y, w) => {
      geom.current = { left: x, width: Math.max(w, 1) };
      setWidth(Math.max(w, 1));
      then?.();
    });
  };

  const valueFromPageX = (pageX: number) => {
    const { left, width: w } = geom.current;
    const { min: lo, max: hi, step: st } = latest.current;
    const ratio = Math.min(Math.max((pageX - left) / w, 0), 1);
    const raw = lo + ratio * (hi - lo);
    const snapped = Math.round(raw / st) * st;
    return Math.min(hi, Math.max(lo, Math.round(snapped * 1000) / 1000));
  };

  const emit = (pageX: number, end = false) => {
    const v = valueFromPageX(pageX);
    setDragValue(end ? null : v);
    latest.current.onChange(v);
    if (end) latest.current.onChangeEnd?.(v);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // a parent ScrollView must not steal the drag
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const pageX = e.nativeEvent.pageX;
        measure(() => emit(pageX));
      },
      onPanResponderMove: (e: GestureResponderEvent) => emit(e.nativeEvent.pageX),
      onPanResponderRelease: (e: GestureResponderEvent) => emit(e.nativeEvent.pageX, true),
      onPanResponderTerminate: () => setDragValue(null),
    })
  ).current;

  // Re-measure when the layout changes (rotation, keyboard, scrolling parents).
  useEffect(() => { measure(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = dragValue ?? value;
  const ratio = max > min ? Math.min(Math.max((shown - min) / (max - min), 0), 1) : 0;
  const left = Math.max(0, Math.min(ratio * width - THUMB / 2, width - THUMB));

  return (
    <View style={styles.hit} {...pan.panHandlers}>
      <View ref={trackRef} style={styles.track} onLayout={() => measure()}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        <View pointerEvents="none" style={[styles.thumb, { left }]}>
          <Text style={styles.thumbText}>{label ? label(shown) : String(shown)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A tall touch area around the thin track makes it easy to grab.
  hit: { paddingVertical: 18, justifyContent: "center" },
  track: { height: 6, backgroundColor: Colors.cardBorder, borderRadius: 3 },
  fill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 3 },
  thumb: {
    position: "absolute",
    top: -14,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbText: { color: Colors.text, fontSize: 10, fontWeight: "700" },
});
