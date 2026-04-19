import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const GROUPS = [
  "Public",
  "Golf Group",
  "Yoga Group",
  "Gym Club",
  "Run Club",
  "Book Club",
];
const ACTIVITIES = ["Court", "Gym", "Course", "Runs", "Yoga"];

// ─── Bottom Sheet Component ───────────────────────────────────────────────────
function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
            <Ionicons name="close" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        {subtitle && <Text style={styles.sheetSubtitle}>{subtitle}</Text>}

        {children}
      </Animated.View>
    </Modal>
  );
}

// ─── Main Post Screen ─────────────────────────────────────────────────────────
export default function PostScreen() {
  const [caption, setCaption] = useState("");
  const [lokiScore, setLokiScore] = useState(8.9);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    "Public",
    "Golf Group",
    "Book Club",
  ]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPostToModal, setShowPostToModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");

  const toggleGroup = (g: string) =>
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  const removeGroup = (g: string) =>
    setSelectedGroups((prev) => prev.filter((x) => x !== g));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Share Your Content</Text>
          <Text style={styles.subtitle}>Share Your Moments With The World</Text>

          {/* Media */}
          <TouchableOpacity style={styles.mediaBox}>
            <Ionicons
              name="image-outline"
              size={40}
              color={Colors.textSecondary}
            />
            <Text style={styles.mediaText}>Select a image or video</Text>
          </TouchableOpacity>

          {/* Caption */}
          <Text style={styles.label}>Add a Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="add a caption"
            placeholderTextColor={Colors.textSecondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />

          {/* Tag Groups */}
          <Text style={styles.label}>Tag your Groups</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowGroupModal(true)}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.dropdownPlaceholder}>
              Who do you want to share this with?
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Tag a Friend */}
          <Text style={styles.label}>Tag a friend</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowActivityModal(true)}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text
              style={[
                styles.dropdownPlaceholder,
                selectedActivity && { color: Colors.text },
              ]}
            >
              {selectedActivity || "Tell us what you're doing"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Lokl Score */}
          <Text style={styles.label}>Lokl Score (1-10)</Text>
          <View style={styles.sliderWrap}>
            <View style={styles.sliderTrack}>
              <View
                style={[styles.sliderFill, { width: `${lokiScore * 10}%` }]}
              />
              <View
                style={[
                  styles.sliderThumb,
                  { left: `${lokiScore * 10 - 4.5}%` as any },
                ]}
              >
                <Text style={styles.sliderThumbText}>{lokiScore}</Text>
              </View>
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1</Text>
              <Text style={styles.sliderLabel}>10</Text>
            </View>
          </View>

          {/* Where to post */}
          <Text style={styles.label}>Where you want to post?</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowPostToModal(true)}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={Colors.textSecondary}
            />
            {selectedGroups.length > 0 ? (
              <View style={styles.tagsRow}>
                {selectedGroups.map((g) => (
                  <View key={g} style={styles.groupTag}>
                    <Text style={styles.groupTagText}>{g}</Text>
                    <TouchableOpacity onPress={() => removeGroup(g)}>
                      <Ionicons name="close" size={11} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>
                Select groups to post to...
              </Text>
            )}
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Tag Groups Bottom Sheet ── */}
      <BottomSheet
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Share to Groups"
        subtitle="Who do you want to share this with?"
      >
        <ScrollView style={styles.sheetList}>
          {GROUPS.map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.sheetItem}
              onPress={() => toggleGroup(g)}
              activeOpacity={0.7}
            >
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetItemAvatar}>
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.sheetItemText}>{g}</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  selectedGroups.includes(g) && styles.checkboxChecked,
                ]}
              >
                {selectedGroups.includes(g) && (
                  <Ionicons name="checkmark" size={13} color={Colors.black} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.sheetDoneBtn}
          onPress={() => setShowGroupModal(false)}
        >
          <Text style={styles.sheetDoneText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ── Tag Activity Bottom Sheet ── */}
      <BottomSheet
        visible={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Tag Activity"
        subtitle="What are you doing?"
      >
        <ScrollView style={styles.sheetList}>
          {ACTIVITIES.map((a) => (
            <TouchableOpacity
              key={a}
              style={styles.sheetItem}
              onPress={() => {
                setSelectedActivity(a);
                setShowActivityModal(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetItemAvatar}>
                  <Ionicons
                    name="fitness-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.sheetItemText}>{a}</Text>
              </View>
              {selectedActivity === a && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={Colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.sheetDoneBtn}
          onPress={() => setShowActivityModal(false)}
        >
          <Text style={styles.sheetDoneText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* ── Post To Bottom Sheet ── */}
      <BottomSheet
        visible={showPostToModal}
        onClose={() => setShowPostToModal(false)}
        title="Post To"
        subtitle="Select where you want to post"
      >
        <ScrollView style={styles.sheetList}>
          {GROUPS.map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.sheetItem}
              onPress={() => toggleGroup(g)}
              activeOpacity={0.7}
            >
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetItemAvatar}>
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.sheetItemText}>{g}</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  selectedGroups.includes(g) && styles.checkboxChecked,
                ]}
              >
                {selectedGroups.includes(g) && (
                  <Ionicons name="checkmark" size={13} color={Colors.black} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.sheetDoneBtn}
          onPress={() => setShowPostToModal(false)}
        >
          <Text style={styles.sheetDoneText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 120 },

  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 22 },

  mediaBox: {
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  mediaText: { color: Colors.textSecondary, fontSize: 14 },

  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },

  captionInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    color: Colors.text,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 18,
  },

  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  dropdownPlaceholder: { flex: 1, color: Colors.textSecondary, fontSize: 14 },

  tagsRow: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  groupTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  groupTagText: { color: Colors.text, fontSize: 12 },

  sliderWrap: { marginBottom: 28, paddingHorizontal: 4 },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.cardBorder,
    borderRadius: 3,
    position: "relative",
    marginBottom: 8,
  },
  sliderFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -15,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -17,
  },
  sliderThumbText: { color: Colors.text, fontSize: 10, fontWeight: "700" },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabel: { color: Colors.textSecondary, fontSize: 12 },

  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  shareBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },

  // ── Bottom Sheet ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 32,
  },
  dragArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  sheetTitle: { color: Colors.text, fontSize: 17, fontWeight: "700" },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sheetList: { maxHeight: SCREEN_HEIGHT * 0.45 },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  sheetItemLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  sheetItemAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetItemText: { color: Colors.text, fontSize: 15, fontWeight: "500" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sheetDoneBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetDoneText: { color: Colors.black, fontSize: 16, fontWeight: "700" },
});
