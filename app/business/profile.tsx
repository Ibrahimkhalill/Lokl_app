import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import LocationsIcon from "../../assets/icons/locations.svg";
import StudentsIcon from "../../assets/icons/students.svg";
import CourseIcon from "../../assets/icons/course.svg";
import DollarIcon from "../../assets/icons/dollar.svg";
import WebsiteIcon from "../../assets/icons/website.svg";
import EmailIcon from "../../assets/icons/email.svg";
import PhoneIcon from "../../assets/icons/call.svg";
import StarIcon from "../../assets/icons/star.svg";
import { businessService } from "../../services/businessService";
import { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { pickCoverImage, pickAvatarImage } from "../../lib/mediaPicker";
import { EmptyState } from "../../components/primitives";

interface BusinessProfile {
  business_name: string;
  business_type: string;
  owner_name: string;
  address: string;
  website: string;
  bio?: string;
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
  social_media: { platform: string; link: string }[];
  phone_number?: string;
  rating?: number;
}

interface Event {
  id: number;
  title: string;
  event_type: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registered: number;
  status: string;
  price: string | number;
  description?: string;
  cover_image_url?: string | null;
  average_rating?: number;
  review_count?: number;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i + 0.5 < rating || i + 1 <= rating;
    return (
      <StarIcon
        key={i}
        width={13}
        height={13}
        color={filled ? "#D1FF00" : "#2A2A2A"}
      />
    );
  });
}

function buildMediaForm(field: string, uri: string) {
  const form = new FormData();
  const filename = uri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  form.append(field, { uri, name: filename, type } as any);
  return form;
}

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: businessIdParam } = useLocalSearchParams<{ id?: string }>();
  const isOwner = !businessIdParam;
  const businessId = businessIdParam ? Number(businessIdParam) : null;

  const [tab, setTab] = useState<"about" | "event">("about");
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // local URI overrides — owner only
  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // bio edit modal — owner only
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [bpRes, evRes] = await Promise.all([
        isOwner
          ? businessService.getBusinessProfile()
          : businessService.getBusinessProfileById(businessId!),
        isOwner
          ? businessService.getMyEvents()
          : businessService.getBusinessEvents(businessId!),
      ]);
      const bpData = bpRes.data?.data ?? bpRes.data;
      setBusinessProfile(bpData);
      const evPayload = evRes.data?.data ?? evRes.data;
      const raw = Array.isArray(evPayload)
        ? evPayload
        : Array.isArray(evPayload?.events)
        ? evPayload.events
        : Array.isArray(evPayload?.results)
        ? evPayload.results
        : [];
      setEvents(raw);
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOwner, businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  async function handlePickCover() {
    const picked = await pickCoverImage();
    if (!picked) return;
    setLocalCoverUri(picked.uri);
    setUploadingCover(true);
    try {
      const form = buildMediaForm("cover_photo", picked.uri);
      await businessService.updateProfileMedia(form);
    } catch (err) {
      setLocalCoverUri(null);
      Alert.alert("Upload Failed", getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  }

  async function handlePickAvatar() {
    const picked = await pickAvatarImage();
    if (!picked) return;
    setLocalAvatarUri(picked.uri);
    setUploadingAvatar(true);
    try {
      const form = buildMediaForm("profile_photo", picked.uri);
      await businessService.updateProfileMedia(form);
    } catch (err) {
      setLocalAvatarUri(null);
      Alert.alert("Upload Failed", getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  }

  function openBioModal() {
    const currentBio = businessProfile?.bio || user?.bio || "";
    setBioInput(currentBio);
    setBioModalVisible(true);
  }

  async function handleSaveBio() {
    setSavingBio(true);
    try {
      const form = new FormData();
      form.append("bio", bioInput.trim());
      await businessService.updateProfileMedia(form);
      setBusinessProfile((prev) =>
        prev ? { ...prev, bio: bioInput.trim() } : prev
      );
      setBioModalVisible(false);
    } catch (err) {
      Alert.alert("Save Failed", getErrorMessage(err));
    } finally {
      setSavingBio(false);
    }
  }

  async function handleDeleteEvent(id: number, title: string) {
    Alert.alert("Delete Event", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(id);
          try {
            await businessService.deleteEvent(id);
            setEvents((prev) => prev.filter((e) => e.id !== id));
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }

  const totalStudents = events.reduce(
    (sum, e) => sum + (e.registered ?? 0),
    0
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  console.log("Business Profile:", businessProfile);

  const displayName =
   
    businessProfile?.owner_name ||
    user?.name ||
    "—";
  const displayRole = businessProfile?.business_type || "—";
  const displayBusinessName = businessProfile?.business_name || "—";
  const displayBio = businessProfile?.bio || user?.bio || "";
  const displayAddress = businessProfile?.address || "";
  const displayWebsite = businessProfile?.website || "";
  const displaySocials = businessProfile?.social_media || [];
  const bussinesPhone = businessProfile?.phone_number || "";
  const displayEmail = user?.email || "";

  const coverUri =
    localCoverUri ?? businessProfile?.cover_photo_url ?? null;
  const avatarUri =
    localAvatarUri ??
    businessProfile?.profile_photo_url ??
    user?.profile_picture ??
    null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Cover Photo */}
        <TouchableOpacity
          activeOpacity={isOwner ? 0.85 : 1}
          onPress={isOwner ? handlePickCover : undefined}
          style={styles.heroBanner}
          disabled={uploadingCover}
        >
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder} />
          )}
          {isOwner && (
            <View style={styles.coverOverlay}>
              {uploadingCover ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <View style={styles.coverEditBadge}>
                  <Ionicons name="camera" size={16} color={Colors.white} />
                  <Text style={styles.coverEditText}>Edit Cover</Text>
                </View>
              )}
            </View>
          )}
          {/* Back button for visitor, Settings for owner */}
          {isOwner ? (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push("/settings/setting")}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View style={styles.topSection}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            <TouchableOpacity
              onPress={isOwner ? handlePickAvatar : undefined}
              activeOpacity={isOwner ? 0.85 : 1}
              disabled={uploadingAvatar}
              style={styles.avatarWrap}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={32} color={Colors.textMuted} />
                </View>
              )}
              {isOwner && (
                <View style={styles.avatarEditBadge}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Ionicons name="camera" size={12} color={Colors.black} />
                  )}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>{displayBusinessName}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <StudentsIcon width={16} height={16} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {totalStudents > 999
                  ? `${(totalStudents / 1000).toFixed(1)}k`
                  : totalStudents}
              </Text>
              <Text style={styles.statLabel}>People</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <CourseIcon width={16} height={16} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {String(events.length).padStart(2, "0")}
              </Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statItem}>
            <View style={styles.scoreBlock}>
              <View style={styles.coachPill}>
                <Text style={styles.coachPillText}>
                  {businessProfile?.business_type || "Business"}
                </Text>
               
              </View>
            </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{businessProfile?.rating || "0.0"}</Text>
              </View>
              <Text style={styles.statLabel}>Review</Text>
            </View>
          </View>

          {isOwner && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/business/create-event")}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
              <Text style={styles.createBtnText}>Create New Event</Text>
            </TouchableOpacity>
          )}

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "about" && styles.tabBtnActive]}
              onPress={() => setTab("about")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "about" && styles.tabTextActive,
                ]}
              >
                About
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "event" && styles.tabBtnActive]}
              onPress={() => setTab("event")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "event" && styles.tabTextActive,
                ]}
              >
                Events
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {tab === "about" ? (
          <>
            <View style={styles.aboutCard}>
              <View style={styles.aboutHeader}>
                <Text style={styles.aboutTitle}>Bio</Text>
                {isOwner && (
                  <TouchableOpacity onPress={openBioModal} hitSlop={8}>
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {displayBio ? (
                <Text style={styles.aboutBody}>{displayBio}</Text>
              ) : (
                <TouchableOpacity onPress={openBioModal}>
                  <Text style={styles.bioPlaceholder}>
                    Tap to add a bio...
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {displayAddress ? (
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <LocationsIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{displayAddress}</Text>
                </View>
              </View>
            ) : null}

            {displayEmail ? (
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <EmailIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{displayEmail}</Text>
                </View>
              </View>
            ) : null}

            {bussinesPhone ? (
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <PhoneIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Business Phone</Text>
                  <Text style={styles.infoValue}>{bussinesPhone}</Text>
                </View>
              </View>
            ) : null}

            {displayAddress ? (
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <LocationsIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Business Address</Text>
                  <Text style={styles.infoValue}>{displayAddress}</Text>
                </View>
              </View>
            ) : null}

            {displayWebsite ? (
              <TouchableOpacity
                style={styles.infoCard}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(
                  displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`
                )}
              >
                <View style={styles.infoIconWrap}>
                  <WebsiteIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Website </Text>
                  <Text style={styles.infoValue}>{displayWebsite}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            ) : null}

            {displaySocials.length > 0 ? (
              <>
                <Text style={styles.sectionHeader}>Social Media</Text>
                {displaySocials.map((s, i) => {
                  const platform = s.platform?.toLowerCase() ?? "";
                  const iconName =
                    platform.includes("instagram") ? "logo-instagram" :
                    platform.includes("facebook")  ? "logo-facebook"  :
                    platform.includes("twitter") || platform.includes("x")
                                                   ? "logo-twitter"   :
                    platform.includes("youtube")   ? "logo-youtube"   :
                    platform.includes("tiktok")    ? "logo-tiktok"    :
                    platform.includes("linkedin")  ? "logo-linkedin"  :
                    "globe-outline";
                  const label = s.platform
                    ? s.platform.charAt(0).toUpperCase() + s.platform.slice(1)
                    : "Social";
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.infoCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        s.link && Linking.openURL(
                          s.link.startsWith("http") ? s.link : `https://${s.link}`
                        )
                      }
                    >
                      <View style={styles.infoIconWrap}>
                        <Ionicons name={iconName as any} size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>{label}</Text>
                        <Text style={styles.infoValue}>{s.link}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : null}
          </>
        ) : (
          <View style={styles.eventsList}>
            {events.length === 0 ? (
              <EmptyState
                icon="calendar-outline"
                title="No events yet"
                subtitle="Create your first event to get started"
                
              />
            ) : (
              events.map((eventItem) => (
                <TouchableOpacity
                  key={eventItem.id}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/business/event-detail?id=${eventItem.id}`)}
                >
                <View style={styles.eventCard}>
                  {/* Cover image with overlay */}
                  <View style={styles.eventCoverWrap}>
                    {eventItem.cover_image_url ? (
                      <Image
                        source={{ uri: eventItem.cover_image_url }}
                        style={styles.eventCoverImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.eventCoverPlaceholder} />
                    )}
                    <View style={styles.eventCoverOverlay} />
                    {/* Status badge top-left */}
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {eventItem.status || "Upcoming"}
                      </Text>
                    </View>
                    {/* Title bottom-left */}
                    <Text style={styles.eventCoverTitle} numberOfLines={2}>
                      {eventItem.title}
                    </Text>
                  </View>

                  {/* Card body */}
                  <View style={styles.eventBody}>
                    {/* Description */}
                    {eventItem.description ? (
                      <Text style={styles.eventDesc} numberOfLines={3}>
                        {eventItem.description}
                      </Text>
                    ) : null}

                    {/* Row 1: stars + review count  |  enrolled */}
                    <View style={styles.infoRow}>
                      <View style={styles.infoLeft}>
                        <View style={styles.starsRow}>
                          {renderStars(eventItem.average_rating ?? 0)}
                        </View>
                        <Text style={styles.reviewCount}>
                          ({eventItem.review_count ?? 0})
                        </Text>
                      </View>
                      <View style={styles.enrolledRow}>
                        <StudentsIcon width={14} height={14} color={Colors.textSecondary} />
                        <Text style={styles.enrolledText}>{eventItem.registered} enrolled</Text>
                      </View>
                    </View>

                    {/* Row 2: price  |  trash */}
                    <View style={styles.priceRow}>
                      <View style={styles.priceLeft}>
                        <DollarIcon width={16} height={16} color={Colors.primary} />
                        <Text style={styles.priceText}>
                          {Number(eventItem.price) === 0 ? "Free" : `$${eventItem.price}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteEvent(eventItem.id, eventItem.title)}
                        disabled={deletingId === eventItem.id}
                      >
                        {deletingId === eventItem.id ? (
                          <ActivityIndicator size="small" color="#FF3B30" />
                        ) : (
                          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bio Edit Modal */}
      <Modal
        visible={bioModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setBioModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setBioModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Bio</Text>
              <TouchableOpacity
                onPress={() => setBioModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.bioTextInput}
              value={bioInput}
              onChangeText={setBioInput}
              multiline
              placeholder="Tell people about your business..."
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.primary}
              maxLength={400}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bioInput.length}/400</Text>

            <TouchableOpacity
              style={[styles.saveBtn, savingBio && styles.saveBtnDisabled]}
              onPress={handleSaveBio}
              disabled={savingBio}
            >
              {savingBio ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 120 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },

  heroBanner: { height: 200, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: { width: "100%", height: "100%", backgroundColor: Colors.card },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  coverEditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  coverEditText: { color: Colors.white, fontSize: 13, fontWeight: "600" },

  topSection: {
    backgroundColor: Colors.background,
    marginTop: -2,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -28,
    marginBottom: 16,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 76, height: 76, borderRadius: 14 },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileInfo: { flex: 1, marginTop: 20 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  role: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
    justifyContent: "space-between",
  },
  statItem: { gap: 8, alignItems: "center", paddingVertical: 6 },
  statIconCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 8,
  },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 11,  },
  scoreBlock: {  alignItems: "center", justifyContent: "center" },

    ratingBadge: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingVertical:5, paddingHorizontal: 12,
  },

  ratingText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  coachPill: {
    backgroundColor: "#248BFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coachPillText: { color: Colors.white, fontSize: 11, fontWeight: "700" },

  createBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1677E6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  createBtnText: { color: Colors.white, fontSize: 14, fontWeight: "700" },

  tabRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  tabBtn: {
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: Colors.black, fontWeight: "700" },

  aboutCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 14,
  },
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aboutTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  aboutBody: { color: Colors.text, fontSize: 13, lineHeight: 20 },
  bioPlaceholder: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },

  locationCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    justifyContent: "center",
  },
  locationRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  locationInfo: { flex: 1, gap: 4 },
  locationText: { color: Colors.textSecondary, fontSize: 13 },
  locationValue: { color: Colors.text, fontSize: 13 },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(209,255,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1, gap: 3 },
  infoLabel: { color: Colors.textSecondary, fontSize: 12 },
  infoValue: { color: Colors.text, fontSize: 14, fontWeight: "600" },

  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },

  emptyWrap: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },

  eventsList: { gap: 14, paddingHorizontal: 20 },
  eventCard: {
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },

  // cover image area
  eventCoverWrap: { height: 170, position: "relative" },
  eventCoverImage: { width: "100%", height: "100%" },
  eventCoverPlaceholder: { width: "100%", height: "100%", backgroundColor: Colors.card },
  eventCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  eventCoverTitle: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    color: Colors.white,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },

  eventBody: { padding: 14 },
  eventMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  eventDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  infoText: { color: Colors.textSecondary, fontSize: 12 },
  infoDot: { color: Colors.textMuted, fontSize: 12, marginHorizontal: 2 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  reviewCount: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4 },
  enrolledText: { color: Colors.textSecondary, fontSize: 12 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: { color: Colors.textSecondary, fontSize: 12 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  priceText: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  enrolledRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,59,48,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Bio Modal
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
    marginBottom: 16,
  },
  modalTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  bioTextInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
    padding: 14,
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.black, fontSize: 16, fontWeight: "700" },

  backBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 14,
  },
  menuSheet: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
    minWidth: 160,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: { color: "#FF3B30", fontSize: 15, fontWeight: "600" },
});
