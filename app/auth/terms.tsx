import { useLocalSearchParams } from "expo-router";
import { LegalDocumentScreen, type LegalDoc } from "../../components/feature-legal/LegalDocumentScreen";

/** Public (pre-login) legal screen: /auth/terms or /auth/terms?doc=privacy */
export default function AuthLegalScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  return <LegalDocumentScreen doc={(doc === "privacy" ? "privacy" : "terms") as LegalDoc} />;
}
