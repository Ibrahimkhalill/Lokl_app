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
  Dimensions,
  Switch,
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
import StarIcon from "../../assets/icons/star.svg";
import { businessService } from "../../services/businessService";
import { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { pickCoverImage, pickAvatarImage } from "../../lib/mediaPicker";
import { EmptyState } from "../../components/primitives";
import DateTimePicker from "@react-native-community/datetimepicker";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_GAP = 2;
const GRID_COLS = 3;
const CELL_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram",  placeholder: "@yourhandle" },
  { key: "tiktok",    label: "TikTok",     placeholder: "@yourhandle" },
  { key: "youtube",   label: "YouTube",    placeholder: "@yourchannel" },
  { key: "x",         label: "X (Twitter)", placeholder: "@yourhandle" },
  { key: "threads",   label: "Threads",    placeholder: "@yourhandle" },
  { key: "facebook",  label: "Facebook",   placeholder: "facebook.com/yourpage" },
  { key: "pinterest", label: "Pinterest",  placeholder: "@yourhandle" },
  { key: "snapchat",  label: "Snapchat",   placeholder: "@yourhandle" },
];

function formatTimeForApi(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function formatTimeDisplay(d: Date) {
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function slotTimeDisplay(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const ampm = (hh ?? 0) >= 12 ? "PM" : "AM";
  return `${(hh ?? 0) % 12 || 12}:${String(mm ?? 0).padStart(2, "0")} ${ampm}`;
}

function socialIcon(platform: string): string {
  const p = (platform ?? "").toLowerCase();
  if (p.includes("instagram")) return "logo-instagram";
  if (p.includes("facebook"))  return "logo-facebook";
  if (p.includes("youtube"))   return "logo-youtube";
  if (p.includes("twitter") || p.includes(" x")) return "logo-twitter";
  if (p.includes("snapchat"))  return "logo-snapchat";
  if (p.includes("pinterest")) return "logo-pinterest";
  return "share-social-outline";
}

function socialLink(platform: string, handle: string): string {
  const p = (platform ?? "").toLowerCase();
  const h = handle.replace(/^@/, "");
  if (p.includes("instagram")) return `https://instagram.com/${h}`;
  if (p.includes("tiktok"))    return `https://tiktok.com/@${h}`;
  if (p.includes("youtube"))   return `https://youtube.com/@${h}`;
  if (p.includes("twitter") || p.includes(" x")) return `https://x.com/${h}`;
  if (p.includes("threads"))   return `https://threads.net/@${h}`;
  return handle.startsWith("http") ? handle : `https://${handle}`;
}

function extractHandle(link: string): string {
  try {
    const url = new URL(link.startsWith("http") ? link : `https://${link}`);
    const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
    return "@" + (parts[parts.length - 1] || "").replace(/^@/, "");
  } catch {
    return link;
  }
}

interface CoachScheduleSlot {
  id: number;
  day_of_week: string;
  time: string;
  description: string;
  venue_name?: string | null;
}

interface CoachOffering {
  id: number;
  name: string;
  description: string;
  price?: number | null;
}

interface CoachContactInfo {
  social_platform?: string;
  social_handle?: string;
  show_social?: boolean;
  email?: string;
  phone?: string;
  show_email?: boolean;
  show_phone?: boolean;
}

interface TrainingLocation {
  id: number;
  venue?: number;
  venue_name: string;
  venue_address?: string;
  note?: string;
}

interface FeaturedReview {
  id: number;
  reviewer_name: string;
  review_comment?: string;
  review_rating?: number;
  review_date?: string;
}

interface CoachPost {
  id: number;
  image_url?: string | null;
  video_url?: string | null;
  type?: string;
}

interface BusinessProfile {
  id?: number;
  user_id?: number;
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
  average_rating?: number;
  review_count?: number;
  clients_count?: number | null;
  schedule_slots?: CoachScheduleSlot[];
  offerings?: CoachOffering[];
  contact_info?: CoachContactInfo | null;
  training_locations?: TrainingLocation[];
  featured_reviews?: FeaturedReview[];
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
  const [coachPosts, setCoachPosts] = useState<CoachPost[]>([]);
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

  // Schedule modal
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [slotDay, setSlotDay] = useState("Monday");
  const [slotTimeDate, setSlotTimeDate] = useState<Date>(() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d; });
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [slotDesc, setSlotDesc] = useState("");
  const [savingSlot, setSavingSlot] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);
  const [dayPickerVisible, setDayPickerVisible] = useState(false);

  // Offerings modal
  const [offeringModalVisible, setOfferingModalVisible] = useState(false);
  const [offeringName, setOfferingName] = useState("");
  const [offeringDesc, setOfferingDesc] = useState("");
  const [offeringPrice, setOfferingPrice] = useState("");
  const [savingOffering, setSavingOffering] = useState(false);
  const [deletingOfferingId, setDeletingOfferingId] = useState<number | null>(null);

  // Contact modal
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactSocialPlatform, setContactSocialPlatform] = useState("");
  const [contactSocial, setContactSocial] = useState("");
  const [showSocial, setShowSocial] = useState(false);
  const [socialPickerVisible, setSocialPickerVisible] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Deletion states
  const [deletingLocationId, setDeletingLocationId] = useState<number | null>(null);
  const [unfeatuingId, setUnfeaturingId] = useState<number | null>(null);

  // Feature review picker
  const [reviewPickerVisible, setReviewPickerVisible] = useState(false);
  const [availableReviews, setAvailableReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [featuringReviewId, setFeaturingReviewId] = useState<number | null>(null);


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

      // Owner endpoint lacks nested data — fetch full public profile to get
      // schedule_slots, offerings, contact_info, training_locations, featured_reviews
      if (isOwner && bpData?.id) {
        try {
          const fullRes = await businessService.getBusinessProfileById(bpData.id);
          const full = fullRes.data?.data ?? fullRes.data;
          setBusinessProfile((prev) =>
            prev
              ? {
                  ...prev,
                  schedule_slots: full.schedule ?? full.schedule_slots ?? [],
                  offerings: full.offerings ?? [],
                  contact_info: full.contact_info ?? null,
                  training_locations: full.training_locations ?? [],
                  featured_reviews: full.featured_reviews ?? [],
                  average_rating: full.average_rating,
                  review_count: full.review_count,
                  clients_count: full.clients_count,
                }
              : prev
          );
        } catch {
          // non-critical — profile still renders without nested data
        }
      }

      const evPayload = evRes.data?.data ?? evRes.data;
      const raw = Array.isArray(evPayload)
        ? evPayload
        : Array.isArray(evPayload?.events)
        ? evPayload.events
        : Array.isArray(evPayload?.results)
        ? evPayload.results
        : [];
      setEvents(raw);

      // Fetch posts for the grid using user_id from profile
      const ownerUserId = bpData?.user_id;
      if (ownerUserId) {
        try {
          const postsRes = await businessService.getBusinessPosts(ownerUserId);
          const postsPayload = postsRes.data?.data ?? postsRes.data;
          const rawPosts = Array.isArray(postsPayload)
            ? postsPayload
            : Array.isArray(postsPayload?.posts)
            ? postsPayload.posts
            : [];
          setCoachPosts(rawPosts);
        } catch {
          // posts grid is non-critical
        }
      }
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

  function openSlotModal(slot?: CoachScheduleSlot) {
    if (slot) {
      setEditingSlotId(slot.id);
      setSlotDay(slot.day_of_week);
      const [hh, mm] = slot.time.split(":").map(Number);
      const d = new Date();
      d.setHours(hh ?? 9, mm ?? 0, 0, 0);
      setSlotTimeDate(d);
      setSlotDesc(slot.description || "");
    } else {
      setEditingSlotId(null);
      setSlotDay("Monday");
      const d = new Date(); d.setHours(9, 0, 0, 0);
      setSlotTimeDate(d);
      setSlotDesc("");
    }
    setSlotModalVisible(true);
  }

  async function handleSaveSlot() {
    setSavingSlot(true);
    const payload = {
      day_of_week: slotDay,
      time: formatTimeForApi(slotTimeDate),
      description: slotDesc.trim(),
    };
    try {
      if (editingSlotId) {
        await businessService.updateScheduleSlot(businessProfile!.id!, editingSlotId, payload);
      } else {
        await businessService.addScheduleSlot(businessProfile!.id!, payload);
      }
      setSlotModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSavingSlot(false);
    }
  }

  function handleDeleteSlot(slotId: number) {
    Alert.alert("Delete Slot", "Remove this schedule slot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          setDeletingSlotId(slotId);
          try {
            await businessService.deleteScheduleSlot(businessProfile!.id!, slotId);
            setBusinessProfile((prev) =>
              prev ? { ...prev, schedule_slots: prev.schedule_slots?.filter((s) => s.id !== slotId) } : prev
            );
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setDeletingSlotId(null);
          }
        },
      },
    ]);
  }

  async function handleAddOffering() {
    if (!offeringName.trim()) {
      Alert.alert("Required", "Please enter a service name.");
      return;
    }
    setSavingOffering(true);
    try {
      await businessService.addOffering(businessProfile!.id!, {
        name: offeringName.trim(),
        description: offeringDesc.trim(),
        price: offeringPrice ? Number(offeringPrice) : null,
      });
      setOfferingModalVisible(false);
      setOfferingName("");
      setOfferingDesc("");
      setOfferingPrice("");
      fetchData();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSavingOffering(false);
    }
  }

  function handleDeleteOffering(offeringId: number) {
    Alert.alert("Delete Offering", "Remove this offering?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          setDeletingOfferingId(offeringId);
          try {
            await businessService.deleteOffering(businessProfile!.id!, offeringId);
            setBusinessProfile((prev) =>
              prev ? { ...prev, offerings: prev.offerings?.filter((o) => o.id !== offeringId) } : prev
            );
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setDeletingOfferingId(null);
          }
        },
      },
    ]);
  }

  function openContactModal() {
    const c = businessProfile?.contact_info;

    // Default platform: use what's saved, or first social media they have
    const firstSocial = businessProfile?.social_media?.[0];
    const defaultPlatform = c?.social_platform || firstSocial?.platform?.toLowerCase() || "";
    const defaultHandle = c?.social_handle ||
      (firstSocial ? extractHandle(firstSocial.link) : "");

    setContactSocialPlatform(defaultPlatform);
    setContactSocial(defaultHandle);
    setShowSocial(c?.show_social ?? false);
    setContactEmail(c?.email || user?.email || "");
    setContactPhone(c?.phone || businessProfile?.phone_number || "");
    setShowEmail(c?.show_email ?? true);
    setShowPhone(c?.show_phone ?? false);
    setContactModalVisible(true);
  }

  async function handleSaveContact() {
    setSavingContact(true);
    try {
      await businessService.updateContact(businessProfile!.id!, {
        social_platform: contactSocialPlatform.toLowerCase(),
        social_handle: contactSocial.trim(),
        show_social: showSocial,
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        show_email: showEmail,
        show_phone: showPhone,
      });
      setContactModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSavingContact(false);
    }
  }

  function handleDeleteLocation(lid: number) {
    Alert.alert("Remove Location", "Remove this training location?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          setDeletingLocationId(lid);
          try {
            await businessService.deleteTrainingLocation(businessProfile!.id!, lid);
            setBusinessProfile((prev) =>
              prev ? { ...prev, training_locations: prev.training_locations?.filter((l) => l.id !== lid) } : prev
            );
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setDeletingLocationId(null);
          }
        },
      },
    ]);
  }

  function handleUnfeatureReview(fid: number) {
    Alert.alert("Unpin Review", "Remove this review from your profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unpin", style: "destructive",
        onPress: async () => {
          setUnfeaturingId(fid);
          try {
            await businessService.deleteFeaturedReview(businessProfile!.id!, fid);
            setBusinessProfile((prev) =>
              prev ? { ...prev, featured_reviews: prev.featured_reviews?.filter((r) => r.id !== fid) } : prev
            );
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setUnfeaturingId(null);
          }
        },
      },
    ]);
  }

  async function openReviewPicker() {
    setReviewPickerVisible(true);
    setLoadingReviews(true);
    try {
      const res = await businessService.getAvailableReviews(businessProfile!.id!);
      const data = res.data?.data ?? res.data;
      setAvailableReviews(Array.isArray(data) ? data : []);
    } catch {
      setAvailableReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handleFeatureReview(reviewId: number) {
    setFeaturingReviewId(reviewId);
    try {
      const res = await businessService.addFeaturedReview(businessProfile!.id!, reviewId);
      const newFeatured = res.data?.data ?? res.data;
      setBusinessProfile((prev) =>
        prev ? { ...prev, featured_reviews: [...(prev.featured_reviews ?? []), newFeatured] } : prev
      );
      setAvailableReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if ((businessProfile?.featured_reviews?.length ?? 0) + 1 >= 3) {
        setReviewPickerVisible(false);
      }
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setFeaturingReviewId(null);
    }
  }

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
              <Text style={styles.role}>{displayRole}</Text>
              {/* {!!displayRole && displayRole !== "—" && (
                <View style={styles.accountTypeBadge}>
                  <Text style={styles.accountTypeBadgeText}>{displayRole}</Text>
                </View>
              )} */}
            </View>
          </View>

          <View style={styles.statsRow}>
            {/* Reviews — visible to everyone */}
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <StudentsIcon width={16} height={16} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>
                {(businessProfile?.review_count ?? 0) > 999
                  ? `${((businessProfile?.review_count ?? 0) / 1000).toFixed(1)}k`
                  : businessProfile?.review_count ?? 0}
              </Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>

            {/* Clients — owner only */}
            {isOwner && (
              <View style={styles.statItem}>
                <View style={styles.statIconCircle}>
                  <Ionicons name="people-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>
                  {(businessProfile?.clients_count ?? 0) > 999
                    ? `${((businessProfile?.clients_count ?? 0) / 1000).toFixed(1)}k`
                    : businessProfile?.clients_count ?? 0}
                </Text>
                <Text style={styles.statLabel}>Clients</Text>
              </View>
            )}

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
                  <Text style={styles.coachPillText} numberOfLines={1}>
                    {"Business"}
                  </Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {businessProfile?.average_rating?.toFixed(1) ?? businessProfile?.rating ?? "0.0"}
                </Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
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
            {/* ── Section 1: Posts / Class Clips Grid ─────────────────── */}
            {coachPosts.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Posts & Class Clips</Text>
                <View style={styles.postsGrid}>
                  {coachPosts.slice(0, 12).map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.gridCell}
                      activeOpacity={0.85}
                    >
                      {post.image_url ? (
                        <Image
                          source={{ uri: post.image_url }}
                          style={styles.gridCellImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.gridCellImage, styles.gridCellPlaceholder]}>
                          <Ionicons
                            name={post.video_url ? "play-circle-outline" : "image-outline"}
                            size={22}
                            color={Colors.textMuted}
                          />
                        </View>
                      )}
                      {post.video_url && (
                        <View style={styles.videoIndicator}>
                          <Ionicons name="play" size={10} color={Colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* ── Bio ─────────────────────────────────────────────────── */}
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

            {/* ── Schedule ─────────────────────────────────────────── */}
            {(isOwner || (businessProfile?.schedule_slots?.length ?? 0) > 0) && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Schedule</Text>
                  {isOwner && (
                    <TouchableOpacity style={styles.sectionAddBtn} onPress={() => openSlotModal()}>
                      <Ionicons name="add" size={14} color={Colors.primary} />
                      <Text style={styles.sectionAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {(businessProfile?.schedule_slots?.length ?? 0) === 0 && isOwner ? (
                  <TouchableOpacity style={styles.addPlaceholder} onPress={() => openSlotModal()}>
                    <View style={styles.addPlaceholderIcon}>
                      <Ionicons name="calendar-outline" size={26} color={Colors.primary} />
                    </View>
                    <Text style={styles.addPlaceholderTitle}>Add Your Schedule</Text>
                    <Text style={styles.addPlaceholderText}>Let clients know when you train</Text>
                  </TouchableOpacity>
                ) : (
                  businessProfile!.schedule_slots!.map((slot) => (
                    <View key={slot.id} style={styles.slotCard}>
                      <View style={styles.slotAccent} />
                      <View style={styles.slotBody}>
                        <View style={styles.slotTopRow}>
                          <Text style={styles.slotDay}>{slot.day_of_week.toUpperCase()}</Text>
                          {isOwner && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                              <TouchableOpacity onPress={() => openSlotModal(slot)} hitSlop={8}>
                                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleDeleteSlot(slot.id)}
                                hitSlop={8}
                                disabled={deletingSlotId === slot.id}
                              >
                                {deletingSlotId === slot.id ? (
                                  <ActivityIndicator size="small" color="#FF3B30" />
                                ) : (
                                  <Ionicons name="trash-outline" size={15} color="#FF3B30" />
                                )}
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Text style={styles.slotTime}>{slotTimeDisplay(slot.time)}</Text>
                        {slot.description ? <Text style={styles.slotDesc}>{slot.description}</Text> : null}
                        {slot.venue_name ? <Text style={styles.slotVenue}>{slot.venue_name}</Text> : null}
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* ── Offerings ────────────────────────────────────────── */}
            {(isOwner || (businessProfile?.offerings?.length ?? 0) > 0) && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Offerings</Text>
                  {isOwner && (
                    <TouchableOpacity style={styles.sectionAddBtn} onPress={() => setOfferingModalVisible(true)}>
                      <Ionicons name="add" size={14} color={Colors.primary} />
                      <Text style={styles.sectionAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {(businessProfile?.offerings?.length ?? 0) === 0 && isOwner ? (
                  <TouchableOpacity style={styles.addPlaceholder} onPress={() => setOfferingModalVisible(true)}>
                    <View style={styles.addPlaceholderIcon}>
                      <Ionicons name="pricetag-outline" size={26} color={Colors.primary} />
                    </View>
                    <Text style={styles.addPlaceholderTitle}>Add Offerings</Text>
                    <Text style={styles.addPlaceholderText}>List your services & pricing</Text>
                  </TouchableOpacity>
                ) : (
                  businessProfile!.offerings!.map((offer) => (
                    <View key={offer.id} style={styles.offeringCard}>
                      <View style={styles.offeringHeader}>
                        <Text style={styles.offeringName}>{offer.name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          {offer.price != null && (
                            <Text style={styles.offeringPrice}>${offer.price}</Text>
                          )}
                          {isOwner && (
                            <TouchableOpacity
                              onPress={() => handleDeleteOffering(offer.id)}
                              hitSlop={8}
                              disabled={deletingOfferingId === offer.id}
                            >
                              {deletingOfferingId === offer.id ? (
                                <ActivityIndicator size="small" color="#FF3B30" />
                              ) : (
                                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      {offer.description ? (
                        <Text style={styles.offeringDesc}>{offer.description}</Text>
                      ) : null}
                    </View>
                  ))
                )}
              </>
            )}

            {/* ── Contact ──────────────────────────────────────────── */}
            {(isOwner || businessProfile?.contact_info) ? (() => {
              const c = businessProfile?.contact_info;
              const items: { icon: string; label: string; value: string; link?: string }[] = [];
              if (c?.social_handle && (isOwner || c.show_social))
                items.push({
                  icon: socialIcon(c.social_platform || ""),
                  label: c.social_platform
                    ? c.social_platform.charAt(0).toUpperCase() + c.social_platform.slice(1)
                    : "Social",
                  value: c.social_handle,
                  link: socialLink(c.social_platform || "", c.social_handle),
                });
              if (c?.email && (isOwner || c.show_email !== false))
                items.push({ icon: "mail-outline", label: "Email", value: c.email, link: `mailto:${c.email}` });
              if (c?.phone && (isOwner || c.show_phone !== false))
                items.push({ icon: "call-outline", label: "Phone", value: c.phone, link: `tel:${c.phone}` });
              return (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeader}>Contact</Text>
                    {isOwner && (
                      <TouchableOpacity style={styles.sectionAddBtn} onPress={openContactModal}>
                        <Ionicons name="create-outline" size={14} color={Colors.primary} />
                        <Text style={styles.sectionAddBtnText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {items.length === 0 && isOwner ? (
                    <TouchableOpacity style={styles.addPlaceholder} onPress={openContactModal}>
                      <View style={styles.addPlaceholderIcon}>
                        <Ionicons name="call-outline" size={26} color={Colors.primary} />
                      </View>
                      <Text style={styles.addPlaceholderTitle}>Add Contact Info</Text>
                      <Text style={styles.addPlaceholderText}>Instagram, email, or phone</Text>
                    </TouchableOpacity>
                  ) : (
                    items.map((item, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.infoCard}
                        activeOpacity={0.7}
                        onPress={() => item.link && Linking.openURL(item.link)}
                      >
                        <View style={styles.infoIconWrap}>
                          <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>{item.label}</Text>
                          <Text style={styles.infoValue}>{item.value}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    ))
                  )}
                </>
              );
            })() : null}

            {/* ── Training Locations ──────────────────────────────── */}
            {(businessProfile?.training_locations?.length ?? 0) > 0 ? (
              <>
                <Text style={styles.sectionHeader}>Trains At</Text>
                {businessProfile!.training_locations!.map((loc) => (
                  <TouchableOpacity
                    key={loc.id}
                    style={styles.infoCard}
                    activeOpacity={0.85}
                    onPress={() => loc.venue ? router.push(`/home/details?id=${loc.venue}`) : undefined}
                  >
                    <View style={styles.infoIconWrap}>
                      <LocationsIcon width={18} height={18} color={Colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoValue}>{loc.venue_name}</Text>
                      {loc.venue_address ? <Text style={styles.infoLabel}>{loc.venue_address}</Text> : null}
                      {loc.note ? <Text style={styles.infoLabel}>{loc.note}</Text> : null}
                    </View>
                    {loc.venue ? (
                      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                    ) : null}
                    {isOwner && (
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation?.(); handleDeleteLocation(loc.id); }}
                        hitSlop={8}
                        disabled={deletingLocationId === loc.id}
                      >
                        {deletingLocationId === loc.id ? (
                          <ActivityIndicator size="small" color="#FF3B30" />
                        ) : (
                          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                        )}
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            {/* ── Featured Reviews ────────────────────────────────── */}
            {(isOwner || (businessProfile?.featured_reviews?.length ?? 0) > 0) && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Featured Reviews</Text>
                  {isOwner && (businessProfile?.featured_reviews?.length ?? 0) < 3 && (
                    <TouchableOpacity style={styles.sectionAddBtn} onPress={openReviewPicker}>
                      <Text style={styles.sectionAddBtnText}>+ Pin Review</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {(businessProfile?.featured_reviews?.length ?? 0) === 0 ? (
                  <TouchableOpacity style={styles.addPlaceholder} onPress={openReviewPicker}>
                    <View style={styles.addPlaceholderIcon}>
                      <Ionicons name="star-outline" size={22} color={Colors.primary} />
                    </View>
                    <Text style={styles.addPlaceholderTitle}>Pin your best reviews</Text>
                  </TouchableOpacity>
                ) : (
                  businessProfile!.featured_reviews!.map((rev) => (
                    <View key={rev.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Ionicons name="person-circle-outline" size={22} color={Colors.textSecondary} />
                        <Text style={styles.reviewerName}>{rev.reviewer_name}</Text>
                        {rev.review_rating != null && (
                          <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{rev.review_rating}</Text>
                          </View>
                        )}
                        {isOwner && (
                          <TouchableOpacity
                            onPress={() => handleUnfeatureReview(rev.id)}
                            hitSlop={8}
                            disabled={unfeatuingId === rev.id}
                            style={{ flex: 1, alignItems: "flex-end" }}
                          >
                            {unfeatuingId === rev.id ? (
                              <ActivityIndicator size="small" color="#FF3B30" />
                            ) : (
                              <Ionicons name="pin-outline" size={16} color="#FF3B30" />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={styles.reviewComment}>{rev.review_comment}</Text>
                    </View>
                  ))
                )}
              </>
            )}
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

      {/* ── Add Schedule Slot Modal ── */}
      <Modal
        visible={slotModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSlotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSlotModalVisible(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingSlotId ? "Edit Schedule Slot" : "Add Schedule Slot"}</Text>
                <TouchableOpacity onPress={() => setSlotModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Day</Text>
              <TouchableOpacity
                style={styles.modalPickerBtn}
                onPress={() => setDayPickerVisible(true)}
              >
                <Text style={styles.modalPickerBtnText}>{slotDay}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Time</Text>
              <TouchableOpacity
                style={styles.modalPickerBtn}
                onPress={() => setTimePickerVisible(true)}
              >
                <Text style={styles.modalPickerBtnText}>{formatTimeDisplay(slotTimeDate)}</Text>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              {timePickerVisible && (
                <DateTimePicker
                  value={slotTimeDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  themeVariant="dark"
                  onChange={(_e, date) => {
                    if (Platform.OS === "android") setTimePickerVisible(false);
                    if (date) setSlotTimeDate(date);
                  }}
                />
              )}

              <Text style={styles.modalLabel}>Description (optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={slotDesc}
                onChangeText={setSlotDesc}
                placeholder="e.g. Boxing class at Gotham Gym"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.primary}
              />

              {Platform.OS === "ios" && timePickerVisible ? (
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => setTimePickerVisible(false)}
                >
                  <Text style={styles.saveBtnText}>Confirm Time</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.saveBtn, savingSlot && styles.saveBtnDisabled]}
                  onPress={handleSaveSlot}
                  disabled={savingSlot}
                >
                  {savingSlot ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.saveBtnText}>{editingSlotId ? "Save Changes" : "Add Slot"}</Text>}
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Day picker modal */}
      <Modal visible={dayPickerVisible} transparent animationType="slide" onRequestClose={() => setDayPickerVisible(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setDayPickerVisible(false)} />
        <View style={styles.pickerSheet}>
          <View style={styles.pickerBar}>
            <Text style={[styles.modalTitle, { fontSize: 15 }]}>Select Day</Text>
            <TouchableOpacity onPress={() => setDayPickerVisible(false)}>
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 280 }}>
            {DAYS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.pickerRow, slotDay === d && styles.pickerRowActive]}
                onPress={() => { setSlotDay(d); setDayPickerVisible(false); }}
              >
                <Text style={[styles.pickerRowText, slotDay === d && styles.pickerRowTextActive]}>{d}</Text>
                {slotDay === d && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ── Add Offering Modal ── */}
      <Modal
        visible={offeringModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOfferingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOfferingModalVisible(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Offering</Text>
                <TouchableOpacity onPress={() => setOfferingModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Service Name*</Text>
              <TextInput
                style={styles.modalInput}
                value={offeringName}
                onChangeText={setOfferingName}
                placeholder="e.g. Private Tennis Lesson"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.primary}
              />

              <Text style={styles.modalLabel}>Description (optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={offeringDesc}
                onChangeText={setOfferingDesc}
                placeholder="e.g. 1-on-1 session, all levels welcome"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.primary}
              />

              <Text style={styles.modalLabel}>Price (optional, $)</Text>
              <TextInput
                style={styles.modalInput}
                value={offeringPrice}
                onChangeText={setOfferingPrice}
                placeholder="e.g. 80"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.primary}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={[styles.saveBtn, savingOffering && styles.saveBtnDisabled]}
                onPress={handleAddOffering}
                disabled={savingOffering}
              >
                {savingOffering ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.saveBtnText}>Add Offering</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Edit Contact Modal ── */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setContactModalVisible(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View style={[styles.modalSheet, { maxHeight: Dimensions.get("window").height * 0.85 }]}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Contact</Text>
                <TouchableOpacity onPress={() => setContactModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <View style={styles.contactRow}>
                  <Ionicons
                    name={socialIcon(contactSocialPlatform) as any}
                    size={18}
                    color={Colors.primary}
                    style={{ marginTop: 16 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>Social DM</Text>
                    <TouchableOpacity
                      style={styles.modalPickerBtn}
                      onPress={() => setSocialPickerVisible(true)}
                    >
                      <Text style={styles.modalPickerBtnText}>
                        {SOCIAL_PLATFORMS.find((sp) => sp.key === contactSocialPlatform)?.label ?? "Select platform"}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.modalInput}
                      value={contactSocial}
                      onChangeText={setContactSocial}
                      placeholder={
                        SOCIAL_PLATFORMS.find((sp) => sp.key === contactSocialPlatform)?.placeholder
                        ?? "Select a platform above"
                      }
                      placeholderTextColor={Colors.textMuted}
                      selectionColor={Colors.primary}
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.contactToggle}>
                    <Text style={styles.contactToggleLabel}>Show</Text>
                    <Switch
                      value={showSocial}
                      onValueChange={setShowSocial}
                      trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                      thumbColor={Colors.black}
                    />
                  </View>
                </View>

                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={18} color={Colors.primary} style={{ marginTop: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>Email</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={contactEmail}
                      onChangeText={setContactEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.textMuted}
                      selectionColor={Colors.primary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.contactToggle}>
                    <Text style={styles.contactToggleLabel}>Show</Text>
                    <Switch
                      value={showEmail}
                      onValueChange={setShowEmail}
                      trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                      thumbColor={Colors.black}
                    />
                  </View>
                </View>

                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={18} color={Colors.primary} style={{ marginTop: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>Phone</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={contactPhone}
                      onChangeText={setContactPhone}
                      placeholder="+1 (212) 555-0123"
                      placeholderTextColor={Colors.textMuted}
                      selectionColor={Colors.primary}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.contactToggle}>
                    <Text style={styles.contactToggleLabel}>Show</Text>
                    <Switch
                      value={showPhone}
                      onValueChange={setShowPhone}
                      trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                      thumbColor={Colors.black}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 8 }, savingContact && styles.saveBtnDisabled]}
                  onPress={handleSaveContact}
                  disabled={savingContact}
                >
                  {savingContact ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.saveBtnText}>Save Contact</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Bio Edit Modal */}
      <Modal
        visible={bioModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setBioModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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

      {/* ── Review Picker Modal ── */}
      <Modal
        visible={reviewPickerVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setReviewPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setReviewPickerVisible(false)} />
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={[styles.modalSheet, { maxHeight: Dimensions.get("window").height * 0.8 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pin a Review</Text>
              <TouchableOpacity onPress={() => setReviewPickerVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {loadingReviews ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : availableReviews.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center", gap: 8 }}>
                <Ionicons name="star-outline" size={36} color={Colors.textMuted} />
                <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
                  No reviews available to pin
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12, textAlign: "center", paddingHorizontal: 24 }}>
                  Reviews from users at your training venues will appear here
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {availableReviews.map((rev) => (
                  <TouchableOpacity
                    key={rev.id}
                    style={styles.reviewPickerRow}
                    onPress={() => handleFeatureReview(rev.id)}
                    disabled={featuringReviewId === rev.id}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="person-circle-outline" size={36} color={Colors.textSecondary} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={styles.reviewerName}>{rev.user_name}</Text>
                        {rev.rating != null && (
                          <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{rev.rating}</Text>
                          </View>
                        )}
                      </View>
                      {rev.comment ? (
                        <Text style={styles.reviewComment} numberOfLines={2}>{rev.comment}</Text>
                      ) : null}
                    </View>
                    {featuringReviewId === rev.id ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          </View>
        </View>
      </Modal>

      {/* Social platform picker */}
      <Modal visible={socialPickerVisible} transparent animationType="slide" onRequestClose={() => setSocialPickerVisible(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setSocialPickerVisible(false)} />
        <View style={styles.pickerSheet}>
          <View style={styles.pickerBar}>
            <Text style={[styles.modalTitle, { fontSize: 15 }]}>Select Platform</Text>
            <TouchableOpacity onPress={() => setSocialPickerVisible(false)}>
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {SOCIAL_PLATFORMS.map((sp) => {
              const selected = contactSocialPlatform === sp.key;
              // Auto-fill handle if they already have this platform in social_media
              const savedLink = businessProfile?.social_media?.find(
                (s) => s.platform?.toLowerCase().includes(sp.key)
              )?.link;
              return (
                <TouchableOpacity
                  key={sp.key}
                  style={[styles.pickerRow, selected && styles.pickerRowActive]}
                  onPress={() => {
                    setContactSocialPlatform(sp.key);
                    if (savedLink) setContactSocial(extractHandle(savedLink));
                    setSocialPickerVisible(false);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Ionicons name={socialIcon(sp.key) as any} size={18} color={selected ? Colors.primary : Colors.textSecondary} />
                    <View>
                      <Text style={[styles.pickerRowText, selected && styles.pickerRowTextActive]}>{sp.label}</Text>
                      {savedLink && (
                        <Text style={{ color: Colors.primary, fontSize: 11 }}>{extractHandle(savedLink)}</Text>
                      )}
                    </View>
                  </View>
                  {selected && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
  avatarRatingBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 10,
  },
  avatarRatingText: { color: Colors.black, fontSize: 11, fontWeight: "800" },
  coachPill: {
    backgroundColor: "#248BFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coachPillText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  accountTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#248BFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  accountTypeBadgeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },

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
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
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

  // Offering card
  offeringCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  offeringHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  offeringName: { color: Colors.text, fontSize: 14, fontWeight: "700", flex: 1 },
  offeringPrice: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
  offeringDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },

  // Review card
  reviewCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reviewerName: { color: Colors.text, fontSize: 14, fontWeight: "600", flex: 1 },
  reviewComment: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  reviewPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
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

  // Posts / Class Clips grid (Section 1)
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    paddingHorizontal: 0,
    marginBottom: 14,
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    overflow: "hidden",
  },
  gridCellImage: {
    width: "100%",
    height: "100%",
  },
  gridCellPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  videoIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Section header with action button
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 20,
    marginBottom: 12,
    marginTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },

  // Add placeholder (empty section prompt for owner)
  addPlaceholder: {
    marginHorizontal: 20,
    marginBottom: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(209,255,0,0.2)",
    backgroundColor: "rgba(209,255,0,0.03)",
    alignItems: "center",
    gap: 6,
  },
  addPlaceholderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(209,255,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  addPlaceholderTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  addPlaceholderText: { color: Colors.textMuted, fontSize: 13 },

  sectionAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(209,255,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(209,255,0,0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sectionAddBtnText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  // Modal inputs and labels
  modalLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  modalInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    color: Colors.text,
    fontSize: 14,
    padding: 14,
    marginBottom: 14,
  },
  modalPickerBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalPickerBtnText: { color: Colors.text, fontSize: 14 },

  // Day picker bottom sheet
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  pickerSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
  },
  pickerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  pickerDone: { color: Colors.primary, fontSize: 16, fontWeight: "700" },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  pickerRowActive: { backgroundColor: "rgba(209,255,0,0.08)" },
  pickerRowText: { color: Colors.text, fontSize: 15 },
  pickerRowTextActive: { color: Colors.primary, fontWeight: "600" },

  // Contact modal rows
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 4,
  },
  contactToggle: { alignItems: "center", paddingTop: 16 },
  contactToggleLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },

  // Schedule slot card
  slotCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: Colors.secondaryCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: "row",
    overflow: "hidden",
  },
  slotAccent: {
    width: 4,
    backgroundColor: Colors.primary,
  },
  slotBody: {
    flex: 1,
    padding: 14,
  },
  slotTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  slotDay: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  slotTime: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  slotDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  slotVenue: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
});
