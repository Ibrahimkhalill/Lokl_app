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
  PhoneInput,
  PrimaryButton,
  OrDivider,
  SocialButtons,
} from "../../components/ui";
import { AuthHeaderBlock, AuthFooterLinkRow } from "../../components/auth";
import { Colors } from "../../constants/colors";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

function formatDob(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function SignUp() {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!username.trim() || !firstName.trim() || !formattedPhone || !password.trim()) {
      showToast({ type: "error", title: "Error", message: "Please fill in all required fields." });
      return;
    }
    if (!dobDate) {
      showToast({ type: "error", title: "Error", message: "Please select your date of birth." });
      return;
    }
    setLoading(true);
    try {
      const dob = dobDate.toISOString().split("T")[0];
      const res = await authService.register({
        username: username.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: formattedPhone,
        password,
        date_of_birth: dob

      });
      const userId: number = res.data.data.user_id;
      router.push({
        pathname: "/auth/email-otp-verifications",
        params: { user_id: String(userId) },
      });
    } catch (err) {
      showToast({ type: "error", title: "Sign Up Failed", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scrollable>
      <LogoText />

      <AuthHeaderBlock
        title="Create your account"
        subtitle="Join the Lokl community today"
        titleStyle={styles.headerTitle}
        subtitleStyle={styles.headerSubtitle}
        containerStyle={{ marginBottom: 28 }}
      />

      <Input
        label="Username*"
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Input
        label="First Name*"
        placeholder="Enter first name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Input
        label="Last Name"
        placeholder="Enter last name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowDobPicker(true)}
        style={styles.dobBlock}
      >
        <Text style={styles.dobLabel}>Date of Birth*</Text>
        <View style={styles.dobRow}>
          <Text style={[styles.dobValue, !dobDate && styles.dobPlaceholder]}>
            {dobDate ? formatDob(dobDate) : "DD/MM/YYYY"}
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
          value={dobDate ?? new Date()}
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
              value={dobDate ?? new Date()}
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
      <PhoneInput
        value={phone}
        onChangeText={setPhone}
        onChangeFormattedText={setFormattedPhone}
      />
      <Input
        label="Password*"
        placeholder="Create a password"
        isPassword
        value={password}
        onChangeText={setPassword}
      />

   

      <PrimaryButton
        title={loading ? "Creating account..." : "Sign Up"}
        onPress={handleSignUp}
        disabled={loading}
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
  dobPlaceholder: { color: Colors.textMuted },
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
