import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  LogoText,
  Input,
  PrimaryButton,
  OrDivider,
  SocialButtons,
} from "../../components/ui";
import { AuthHeaderBlock, AuthFooterLinkRow } from "../../components/auth";
import { Colors } from "../../constants/colors";

function defaultBirthDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 21);
  d.setHours(12, 0, 0, 0);
  return d;
}

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dobDate, setDobDate] = useState(defaultBirthDate);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Screen scrollable>
      <LogoText />

      <AuthHeaderBlock
        title="Create your account"
        subtitle="join the LOKL community today"
        titleStyle={styles.headerTitle}
        subtitleStyle={styles.headerSubtitle}
        containerStyle={{ marginBottom: 28 }}
      />

      <Input
        label="Username"
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Input
        label="Full Name"
        placeholder="Enter full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowDobPicker(true)}
        style={styles.dobBlock}
      >
        <Text style={styles.dobLabel}>Date of Birth</Text>
        <View style={styles.dobRow}>
          <Text style={styles.dobValue}>
            {dobDate.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {Platform.OS === "android" && showDobPicker ? (
        <DateTimePicker
          value={dobDate}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={(event, date) => {
            setShowDobPicker(false);
            if (event.type === "set" && date) setDobDate(date);
          }}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={showDobPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDobPicker(false)}
        >
          <Pressable
            style={styles.dobModalBackdrop}
            onPress={() => setShowDobPicker(false)}
          />
          <View style={styles.dobModalSheet}>
            <View style={styles.dobModalBar}>
              <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                <Text style={styles.dobModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                <Text style={styles.dobModalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={dobDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              onChange={(_, date) => {
                if (date) setDobDate(date);
              }}
            />
          </View>
        </Modal>
      ) : null}
      <Input
        label="Phone Number"
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Input
        label="Password"
        placeholder="Create a password"
        isPassword
        value={password}
        onChangeText={setPassword}
      />

      {/* Remember Me */}
      <TouchableOpacity
        style={styles.rememberRow}
        onPress={() => setRememberMe(!rememberMe)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
          {rememberMe && (
            <Ionicons name="checkmark" size={12} color={Colors.black} />
          )}
        </View>
        <Text style={styles.rememberText}>Remember Me</Text>
      </TouchableOpacity>

      <PrimaryButton
        title="Sign Up"
        onPress={() => router.push("/auth/email-otp-verifications")}
      />

      <OrDivider />
      <SocialButtons />

      <AuthFooterLinkRow
        prefixText="Already have an account? "
        linkText="Sign in"
        onPress={() => router.push("/auth/sign-in")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    marginTop: -4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  dobBlock: { marginBottom: 16 },
  dobLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  dobRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 52,
    paddingHorizontal: 16,
  },
  dobValue: { color: Colors.text, fontSize: 15 },
  dobModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dobModalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
  },
  dobModalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  dobModalCancel: { color: Colors.textSecondary, fontSize: 16 },
  dobModalDone: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
