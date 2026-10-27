import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { BottomSheet } from "./BottomSheet";
import { REPORT_REASONS, submitReport, confirmBlock } from "../../lib/safety";

export type ReportBlockTarget = {
  userId: number;
  name?: string;
  postId?: number; // set when opened from a post → "Report post" is offered
};

type Props = {
  visible: boolean;
  onClose: () => void;
  target: ReportBlockTarget;
  /** Called after the user reported or blocked, so the caller can hide the content. */
  onDone?: (kind: "reported" | "blocked") => void;
};

type Step = "menu" | "reasons";

/** Report a post / report a user / block a user — shared by posts, profiles and chat. */
export function ReportBlockSheet({ visible, onClose, target, onDone }: Props) {
  const [step, setStep] = useState<Step>("menu");
  const [reporting, setReporting] = useState<"post" | "user">("user");
  const [busy, setBusy] = useState(false);
  const name = target.name || "this user";

  useEffect(() => {
    if (visible) setStep("menu");
  }, [visible]);

  const startReport = (kind: "post" | "user") => {
    setReporting(kind);
    setStep("reasons");
  };

  const sendReport = async (reason: string) => {
    if (busy) return;
    setBusy(true);
    const ok = await submitReport(
      reporting === "post" && target.postId ? { postId: target.postId } : { userId: target.userId },
      reason,
    );
    setBusy(false);
    if (ok) {
      onClose();
      onDone?.("reported");
    }
  };

  const block = async () => {
    onClose();
    if (await confirmBlock(target.userId, name)) onDone?.("blocked");
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={step === "menu" ? "More options" : reporting === "post" ? "Report this post" : `Report ${name}`}
      subtitle={step === "reasons" ? "Why are you reporting this?" : undefined}
    >
      {step === "menu" ? (
        <View style={styles.list}>
          {!!target.postId && (
            <Row icon="flag-outline" label="Report post" onPress={() => startReport("post")} />
          )}
          <Row icon="person-circle-outline" label={`Report ${name}`} onPress={() => startReport("user")} />
          <Row icon="ban-outline" label={`Block ${name}`} danger onPress={block} />
        </View>
      ) : (
        <View style={styles.list}>
          {REPORT_REASONS.map((reason) => (
            <Row key={reason} label={reason} onPress={() => sendReport(reason)} />
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

function Row({
  label,
  icon,
  danger,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {icon && <Ionicons name={icon} size={20} color={danger ? "#FF4444" : Colors.text} />}
      <Text style={[styles.rowText, danger && { color: "#FF4444" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12, paddingBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  rowText: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "600" },
});
