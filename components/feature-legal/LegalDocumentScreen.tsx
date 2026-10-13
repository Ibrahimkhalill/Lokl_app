import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { api, BASE_URL } from "../../lib/api";

export type LegalDoc = "privacy" | "terms";

type Block = { p?: string; ul?: string[] };
type LegalDocument = {
  title: string;
  effective: string;
  contact: string;
  intro: string[];
  sections: { heading: string; blocks: Block[] }[];
  url?: string;
};

const FALLBACK_TITLE: Record<LegalDoc, string> = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

/** Public web page for a document (same content, hosted by the backend). */
export function legalDocUrl(doc: LegalDoc) {
  return `${BASE_URL.replace(/\/api\/?$/, "")}/${doc}/`;
}

/**
 * Renders the official Privacy Policy / Terms from the backend (single source of truth:
 * the same text is published at https://api.loklusa.com/privacy/ and /terms/).
 */
export function LegalDocumentScreen({ doc }: { doc: LegalDoc }) {
  const router = useRouter();
  const [data, setData] = useState<LegalDocument | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await api.get(`/legal/${doc}/`);
      setData((res.data?.data ?? res.data) as LegalDocument);
    } catch {
      setError(true);
    }
  }, [doc]);

  useEffect(() => {
    load();
  }, [load]);

  const title = data?.title ?? FALLBACK_TITLE[doc];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        <View style={s.center}>
          <Text style={s.errorText}>Couldn&apos;t load the {title.toLowerCase()}.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={load}>
            <Text style={s.primaryBtnText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(legalDocUrl(doc))}>
            <Text style={s.link}>Open in browser</Text>
          </TouchableOpacity>
        </View>
      ) : !data ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.meta}>Effective {data.effective} · Lokl, Inc.</Text>

          <View style={s.card}>
            {data.intro.map((para, i) => (
              <Text key={i} style={[s.body, i > 0 && s.gap]}>{para}</Text>
            ))}
          </View>

          {data.sections.map((section, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardTitle}>{section.heading}</Text>
              {section.blocks.map((block, j) =>
                block.ul ? (
                  <View key={j} style={j > 0 && s.gap}>
                    {block.ul.map((item, k) => (
                      <View key={k} style={s.bulletRow}>
                        <Text style={s.bullet}>•</Text>
                        <Text style={[s.body, s.flex]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text key={j} style={[s.body, j > 0 && s.gap]}>{block.p}</Text>
                )
              )}
            </View>
          ))}

          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${data.contact}`)}>
            <Text style={s.contact}>
              Questions? <Text style={s.link}>{data.contact}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 14 },
  errorText: { color: Colors.textSecondary, textAlign: "center" },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12 },
  primaryBtnText: { color: Colors.black, fontWeight: "700" },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
  meta: { color: Colors.textSecondary, fontSize: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
  },
  cardTitle: { color: Colors.primary, fontSize: 15, fontWeight: "700", marginBottom: 10 },
  body: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  gap: { marginTop: 10 },
  bulletRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  bullet: { color: Colors.primary, fontSize: 13, lineHeight: 20 },
  flex: { flex: 1 },
  contact: { color: Colors.textSecondary, fontSize: 13, textAlign: "center", marginTop: 8 },
  link: { color: Colors.primary, fontWeight: "600" },
});
