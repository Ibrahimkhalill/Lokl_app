import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

type ToastOptions = {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type ToastContextValue = {
  showToast: (opts: ToastOptions) => void;
  showConfirm: (opts: ConfirmOptions) => void;
};

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  showConfirm: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Toast config ─────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { icon: string; color: string; bg: string }> = {
  success: { icon: "checkmark-circle",  color: "#4ADE80", bg: "#0F2A1A" },
  error:   { icon: "close-circle",      color: "#F87171", bg: "#2A0F0F" },
  warning: { icon: "warning",           color: "#FBBF24", bg: "#2A1F00" },
  info:    { icon: "information-circle", color: "#60A5FA", bg: "#0F1A2A" },
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  // Toast state
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef(0);

  // Confirm state
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
  const confirmScaleAnim = useRef(new Animated.Value(0.85)).current;
  const confirmOpacityAnim = useRef(new Animated.Value(0)).current;

  // ── Show toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((opts: ToastOptions) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    const id = ++toastIdRef.current;
    setToast({ ...opts, id });

    // Slide in
    slideAnim.setValue(-120);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    // Auto-dismiss
    const duration = opts.duration ?? 3500;
    toastTimer.current = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast((t) => (t?.id === id ? null : t)));
    }, duration);
  }, [slideAnim]);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [slideAnim]);

  // ── Show confirm ────────────────────────────────────────────────────────────
  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setConfirm(opts);
    confirmScaleAnim.setValue(0.85);
    confirmOpacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(confirmScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(confirmOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [confirmScaleAnim, confirmOpacityAnim]);

  const dismissConfirm = useCallback(() => {
    Animated.parallel([
      Animated.timing(confirmScaleAnim, { toValue: 0.85, duration: 180, useNativeDriver: true }),
      Animated.timing(confirmOpacityAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setConfirm(null));
  }, [confirmScaleAnim, confirmOpacityAnim]);

  const handleConfirm = useCallback(() => {
    const cb = confirm?.onConfirm;
    dismissConfirm();
    setTimeout(() => cb?.(), 200);
  }, [confirm, dismissConfirm]);

  const handleCancel = useCallback(() => {
    const cb = confirm?.onCancel;
    dismissConfirm();
    setTimeout(() => cb?.(), 200);
  }, [confirm, dismissConfirm]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const cfg = toast ? TOAST_CONFIG[toast.type ?? "info"] : null;

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* ── Toast ── */}
      {toast && cfg && (
        <Animated.View
          style={[
            styles.toastWrap,
            { top: insets.top + 12, transform: [{ translateY: slideAnim }] },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={[styles.toast, { backgroundColor: cfg.bg, borderColor: cfg.color + "40" }]}
            activeOpacity={0.9}
            onPress={dismissToast}
          >
            <View style={[styles.toastIcon, { backgroundColor: cfg.color + "20" }]}>
              <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
            </View>
            <View style={styles.toastBody}>
              <Text style={[styles.toastTitle, { color: cfg.color }]}>{toast.title}</Text>
              {!!toast.message && (
                <Text style={styles.toastMessage}>{toast.message}</Text>
              )}
            </View>
            <Ionicons name="close" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Confirm Modal ── */}
      <Modal
        visible={!!confirm}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleCancel}
      >
        <Animated.View style={[styles.modalBackdrop, { opacity: confirmOpacityAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={handleCancel} />
          <Animated.View
            style={[
              styles.modalCard,
              { transform: [{ scale: confirmScaleAnim }], opacity: confirmOpacityAnim },
            ]}
          >
            {/* Icon */}
            <View style={[
              styles.modalIconWrap,
              { backgroundColor: confirm?.destructive ? "#F8717120" : Colors.primary + "20" },
            ]}>
              <Ionicons
                name={confirm?.destructive ? "warning-outline" : "help-circle-outline"}
                size={32}
                color={confirm?.destructive ? "#F87171" : Colors.primary}
              />
            </View>

            <Text style={styles.modalTitle}>{confirm?.title}</Text>
            {!!confirm?.message && (
              <Text style={styles.modalMessage}>{confirm.message}</Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
                <Text style={styles.cancelText}>{confirm?.cancelText ?? "Cancel"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  confirm?.destructive && styles.confirmBtnDestructive,
                ]}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={[
                  styles.confirmText,
                  confirm?.destructive && styles.confirmTextDestructive,
                ]}>
                  {confirm?.confirmText ?? "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ToastContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Toast
  toastWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  toastBody: { flex: 1 },
  toastTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  toastMessage: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },

  // Confirm modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 24,
    alignItems: "center",
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnDestructive: { backgroundColor: "#F87171" },
  confirmText: { color: Colors.black, fontSize: 15, fontWeight: "700" },
  confirmTextDestructive: { color: "#fff" },
});
