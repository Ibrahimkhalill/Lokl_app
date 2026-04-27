import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageIcon from "../../assets/icons/image.svg";
import TagIcon from "../../assets/icons/find.svg";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";
import { MediaPickerCard, FormField, AppTextInput } from "../primitives";
import { BottomSheet, BOTTOM_SHEET_MAX_LIST_HEIGHT } from "../overlays";
import { useToggleSet } from "../../hooks/useToggleSet";
import { useSliderScore } from "../../hooks/useSliderScore";
import { pickPostMedia } from "../../lib/mediaPicker";

const GROUPS = [
  "Public",
  "Golf Group",
  "Yoga Group",
  "Gym Club",
  "Run Club",
  "Book Club",
];
const ACTIVITIES = ["Court", "Gym", "Course", "Runs", "Yoga"];

export default function PostScreen() {
  const [caption, setCaption] = useState("");
  const {
    score: lokiScore,
    setTrackWidth,
    scoreProgress,
    thumbLeft,
    updateFromPosition,
  } = useSliderScore(8.9);
  const { selected: selectedGroups, toggle: toggleGroup } = useToggleSet([
    "Public",
    "Golf Group",
    "Book Club",
  ]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPostToModal, setShowPostToModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");

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

          <MediaPickerCard
            height={140}
            previewUri={mediaUri}
            previewKind={mediaKind}
            onPress={async () => {
              const picked = await pickPostMedia();
              if (!picked) return;
              setMediaUri(picked.uri);
              setMediaKind(picked.type === "video" ? "video" : "image");
            }}
            icon={<ImageIcon width={40} height={40} color={Colors.textSecondary} />}
            title="Select a image or video"
          />

          <FormField label="Add a Caption" style={{ marginBottom: 18 }}>
            <AppTextInput
              placeholder="add a caption"
              placeholderTextColor={Colors.textSecondary}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              style={styles.captionInput}
            />
          </FormField>

          <Text style={styles.label}>Tag your Groups</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowGroupModal(true)}
          >
            <TagIcon width={16} height={16} color={Colors.textSecondary} />
            <Text style={styles.dropdownPlaceholder}>
              Who do you want to share this with?
            </Text>
            <ChevronDownIcon
              width={16}
              height={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <Text style={styles.label}>Tag a friend</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowActivityModal(true)}
          >
            <TagIcon width={16} height={16} color={Colors.textSecondary} />
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

          <Text style={styles.label}>Lokl Score (1-10)</Text>
          <View style={styles.sliderWrap}>
            <View
              style={styles.sliderTrack}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(e) =>
                updateFromPosition(e.nativeEvent.locationX)
              }
              onResponderMove={(e) =>
                updateFromPosition(e.nativeEvent.locationX)
              }
            >
              <View
                style={[styles.sliderFill, { width: `${scoreProgress}%` }]}
              />
              <View
                pointerEvents="none"
                style={[styles.sliderThumb, { left: thumbLeft }]}
              >
                <Text style={styles.sliderThumbText}>
                  {lokiScore.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Where you want to post?</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowPostToModal((prev) => !prev)}
          >
            <Text style={styles.dropdownPlaceholder}>
              Select groups to post to...
            </Text>
            <Ionicons
              name={showPostToModal ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {showPostToModal && (
            <View style={styles.inlineDropdownList}>
              {GROUPS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.inlineDropdownItem}
                  onPress={() => toggleGroup(g)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedGroups.includes(g) && styles.checkboxChecked,
                    ]}
                  >
                    {selectedGroups.includes(g) && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={Colors.black}
                      />
                    )}
                  </View>
                  <Text style={styles.inlineDropdownText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Share to Groups"
        subtitle="Who do you want to share this with?"
      >
        <View style={styles.groupsField}>
          <TagIcon width={16} height={16} color={Colors.textSecondary} />
          <Text style={styles.groupsFieldText}>Groups</Text>
        </View>
        <ScrollView style={styles.sheetList}>
          {GROUPS.filter((g) => g !== "Public").map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.groupOptionItem,
                selectedGroups.includes(g) && styles.groupOptionItemActive,
              ]}
              onPress={() => toggleGroup(g)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.groupOptionText,
                  selectedGroups.includes(g) && styles.groupOptionTextActive,
                ]}
              >
                {g}
              </Text>
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

      <BottomSheet
        visible={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Tag Activity"
        subtitle="What are you doing?"
      >
        <View style={styles.groupsField}>
          <TagIcon width={16} height={16} color={Colors.textSecondary} />
          <Text style={styles.groupsFieldText}>Friends</Text>
        </View>
        <ScrollView style={styles.sheetList}>
          {ACTIVITIES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.groupOptionItem,
                selectedActivity === g && styles.groupOptionItemActive,
              ]}
              onPress={() =>
                setSelectedActivity((prev) => (prev === g ? "" : g))
              }
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.groupOptionText,
                  selectedActivity === g && styles.groupOptionTextActive,
                ]}
              >
                {g}
              </Text>
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

    paddingHorizontal: 14,
    paddingVertical: 15,
    gap: 5,
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
  groupsField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  groupsFieldText: {
    color: Colors.textSecondary,
    fontSize: 28 / 2,
    fontWeight: "500",
  },
  inlineDropdownList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    marginTop: -8,
    marginBottom: 18,
    paddingVertical: 6,
    overflow: "hidden",
  },
  inlineDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inlineDropdownText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },

  sliderWrap: { marginBottom: 28, paddingHorizontal: 4 },
  sliderTrack: {
    marginTop: 10,
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

  sheetList: { maxHeight: BOTTOM_SHEET_MAX_LIST_HEIGHT },
  groupOptionItem: {
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupOptionItemActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  groupOptionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  groupOptionTextActive: {
    color: Colors.black,
  },
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
