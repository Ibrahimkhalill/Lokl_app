import { Alert } from "react-native";
import { getErrorMessage } from "./api";
import { safetyService, ReportTarget } from "../services/safetyService";

export const REPORT_REASONS = [
  "Spam or scam",
  "Harassment or bullying",
  "Hate speech or abuse",
  "Nudity or sexual content",
  "Violence or dangerous content",
  "Something else",
];

/** Sends a report and tells the user what happens next. Resolves true on success. */
export async function submitReport(
  target: ReportTarget,
  reason: string,
  details?: string,
): Promise<boolean> {
  try {
    await safetyService.report(target, reason, details);
    Alert.alert("Report sent", "Thanks for letting us know. Our team reviews every report within 24 hours.");
    return true;
  } catch (e) {
    Alert.alert("Couldn't send report", getErrorMessage(e));
    return false;
  }
}

/** Asks for confirmation, then blocks. Resolves true when the user is blocked. */
export function confirmBlock(userId: number, name: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      `Block ${name || "this user"}?`,
      "You won't see each other's posts, comments or messages, and you'll stop following each other. You can unblock anytime in Settings → Blocked users.",
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              await safetyService.block(userId);
              resolve(true);
            } catch (e) {
              Alert.alert("Couldn't block", getErrorMessage(e));
              resolve(false);
            }
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
