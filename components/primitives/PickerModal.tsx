import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export type PickerItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export type PickerModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: PickerItem[];
  onSelect: (value: string) => void;
  searchable?: boolean;
  selectedValue?: string;
};

export function PickerModal({
  visible,
  onClose,
  title,
  items,
  onSelect,
  searchable = false,
  selectedValue,
}: PickerModalProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, search, searchable]);

  function handleClose() {
    setSearch("");
    onClose();
  }

  function handleSelect(value: string) {
    setSearch("");
    onSelect(value);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={s.backdrop} onPress={handleClose} />
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
          </View>

          {/* Search */}
          {searchable && (
            <View style={s.searchWrap}>
              <Ionicons name="search-outline" size={16} color={Colors.textSecondary} style={s.searchIcon} />
              <TextInput
                style={s.searchInput}
                placeholder="Search..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {!!search && (
                <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={14}
            maxToRenderPerBatch={14}
            windowSize={7}
            renderItem={({ item }) => {
              const selected = item.value === selectedValue;
              return (
                <TouchableOpacity
                  style={[s.item, selected && s.itemSelected]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  {item.icon ? (
                    <View style={s.itemIcon}>{item.icon}</View>
                  ) : null}
                  <Text style={[s.itemText, selected && s.itemTextSelected]}>
                    {item.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyText}>No results found</Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "72%",
    paddingBottom: 32,
    overflow: "hidden",
  },
  header: {
    backgroundColor: Colors.modalHeader,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  itemSelected: {
    backgroundColor: "rgba(209,255,0,0.06)",
  },
  itemIcon: { marginRight: 14 },
  itemText: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  itemTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
