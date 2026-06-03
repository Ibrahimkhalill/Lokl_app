import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { COUNTRIES, CountryItem } from "./countryData";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (phone: string) => void;
  onChangeFormattedText?: (formatted: string) => void;
  error?: string | null;
}

function getDeviceCountryCode(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const parts = locale.split("-");
    if (parts.length >= 2) return parts[parts.length - 1].toUpperCase();
  } catch {}
  return "US";
}

function getFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

export function PhoneInput({
  label = "Phone Number",
  value,
  onChangeText,
  onChangeFormattedText,
  error,
}: PhoneInputProps) {
  const insets = useSafeAreaInsets();
  const [country, setCountry] = useState<CountryItem>(() => {
    const code = getDeviceCountryCode();
    return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES.find((c) => c.code === "US") ?? COUNTRIES[0];
  });
  const [pickerVisible, setPickerVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    const raw = value.replace(/\D/g, "");
    onChangeFormattedText?.(raw ? `+${country.dialCode}${raw}` : "");
  }, [value, country]);

  const selectCountry = useCallback((c: CountryItem) => {
    setCountry(c);
    setPickerVisible(false);
    setSearch("");
  }, []);

  const closePicker = useCallback(() => {
    setPickerVisible(false);
    setSearch("");
  }, []);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error ? styles.inputRowError : null,
        ]}
      >
        <TouchableOpacity
          style={styles.flagBtn}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.flagEmoji}>{getFlag(country.code)}</Text>
          <Text style={styles.dialCode}>+{country.dialCode}</Text>
          <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TextInput
          style={styles.textInput}
          placeholder="Phone number"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.primary}
          maxLength={country.maxLength}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        statusBarTranslucent={false}
        onRequestClose={closePicker}
      >
        <Pressable style={styles.backdrop} onPress={closePicker} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select Country</Text>
            <TouchableOpacity onPress={closePicker} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={15} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              selectionColor={Colors.primary}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryRow,
                  item.code === country.code && styles.countryRowActive,
                ]}
                onPress={() => selectCountry(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.countryFlag}>{getFlag(item.code)}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDial}>+{item.dialCode}</Text>
                {item.code === country.code && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.primary}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 52,
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: Colors.inputBorderActive,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: "100%",
  },
  flagEmoji: {
    fontSize: 20,
  },
  dialCode: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.cardBorder,
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
    height: "100%",
  },
  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  sheetTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    height: "100%",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  countryRowActive: {
    backgroundColor: Colors.inputBg,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  countryDial: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
