import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_MENU_WIDTH = 126;
const EDGE_GAP = 12;

export interface ContextMenuDropdownProps {
  visible: boolean;
  onClose: () => void;
  anchor: { x: number; y: number };
  menuWidth?: number;
  offsetBelow?: number;
  children: React.ReactNode;
}

/** Full-screen transparent dismiss layer + absolutely positioned menu */
export function ContextMenuDropdown({
  visible,
  onClose,
  anchor,
  menuWidth = DEFAULT_MENU_WIDTH,
  offsetBelow = 12,
  children,
}: ContextMenuDropdownProps) {
  if (!visible) return null;

  const left = Math.min(
    SCREEN_WIDTH - menuWidth - EDGE_GAP,
    Math.max(EDGE_GAP, anchor.x - menuWidth + 18),
  );

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={onClose}
        activeOpacity={1}
      />
      <View
        style={[
          styles.sheet,
          { top: anchor.y + offsetBelow, left, minWidth: menuWidth },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function capturePressAnchor(
  e: GestureResponderEvent,
): { x: number; y: number } {
  const { pageX, pageY } = e.nativeEvent;
  return { x: pageX, y: pageY };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  sheet: {
    position: "absolute",
    backgroundColor: Colors.text,
    borderRadius: 12,
    overflow: "hidden",
  },
});
