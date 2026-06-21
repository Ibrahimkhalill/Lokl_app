import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import LocationsIcon from "../../assets/icons/locations.svg";
import WebsiteIcon from "../../assets/icons/website.svg";
import { businessService } from "../../services/businessService";
import { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { pickCoverImage, pickAvatarImage } from "../../lib/mediaPicker";

import { BusinessHeader } from "./components/BusinessHeader";
import { PostsGrid } from "./components/PostsGrid";
import { BioSection } from "./components/BioSection";
import ScheduleSection from "./components/ScheduleSection";
import OfferingsSection from "./components/OfferingsSection";
import { ContactSection } from "./components/ContactSection";
import { TrainingLocations } from "./components/TrainingLocations";
import { FeaturedReviews } from "./components/FeaturedReviews";
import { EventsList } from "./components/EventsList";
import { sharedStyles } from "./components/sharedStyles";
import { BusinessProfile, ClassClip, EventItem } from "./components/types";

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
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clips, setClips] = useState<ClassClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
          // non-critical
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

      const businessProfileId = bpData?.id;
      if (businessProfileId) {
        try {
          const clipsRes = await businessService.getBusinessClips(businessProfileId);
          const clipsPayload = clipsRes.data?.data ?? clipsRes.data;
          setClips(Array.isArray(clipsPayload) ? clipsPayload : []);
        } catch {
          // non-critical
        }
      }
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOwner, businessId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

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
      await businessService.updateProfileMedia(buildMediaForm("cover_photo", picked.uri));
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
      await businessService.updateProfileMedia(buildMediaForm("profile_photo", picked.uri));
    } catch (err) {
      setLocalAvatarUri(null);
      Alert.alert("Upload Failed", getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
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

  const displayBio = businessProfile?.bio || user?.bio || "";
  const displayAddress = businessProfile?.address || "";
  const displayWebsite = businessProfile?.website || "";
  const displaySocials = businessProfile?.social_media || [];

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
        <BusinessHeader
          profile={businessProfile}
          eventsCount={events.length}
          isOwner={isOwner}
          tab={tab}
          onTabChange={setTab}
          localCoverUri={localCoverUri}
          localAvatarUri={localAvatarUri}
          uploadingCover={uploadingCover}
          uploadingAvatar={uploadingAvatar}
          onPickCover={handlePickCover}
          onPickAvatar={handlePickAvatar}
          userAvatar={user?.profile_picture ?? null}
          onSettingsPress={() => router.push("/settings/setting")}
          onBackPress={() => router.back()}
          onCreateEvent={() => router.push("/business/create-event")}
        />

        {tab === "about" ? (
          <>
            <PostsGrid
              clips={clips}
              isOwner={isOwner}
              onCreatePost={() =>
                router.push(`/business/create-clip?businessId=${businessProfile?.id}` as never)
              }
              businessProfileId={businessProfile?.id}
              onUpdate={fetchData}
            />

            <FeaturedReviews
              reviews={businessProfile?.featured_reviews ?? []}
              isOwner={isOwner}
              businessProfileId={businessProfile?.id!}
              onUpdate={fetchData}
            />

            <BioSection
              bio={displayBio}
              isOwner={isOwner}
              onUpdate={fetchData}
            />

            {!!displayAddress && (
              <View style={sharedStyles.infoCard}>
                <View style={sharedStyles.infoIconWrap}>
                  <LocationsIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={sharedStyles.infoContent}>
                  <Text style={sharedStyles.infoLabel}>Location</Text>
                  <Text style={sharedStyles.infoValue}>{displayAddress}</Text>
                </View>
              </View>
            )}

            {!!displayWebsite && (
              <TouchableOpacity
                style={sharedStyles.infoCard}
                activeOpacity={0.7}
                onPress={() =>
                  Linking.openURL(
                    displayWebsite.startsWith("http")
                      ? displayWebsite
                      : `https://${displayWebsite}`
                  )
                }
              >
                <View style={sharedStyles.infoIconWrap}>
                  <WebsiteIcon width={18} height={18} color={Colors.primary} />
                </View>
                <View style={sharedStyles.infoContent}>
                  <Text style={sharedStyles.infoLabel}>Website</Text>
                  <Text style={sharedStyles.infoValue}>{displayWebsite}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}

            {displaySocials.length > 0 && (
              <>
                <Text style={sharedStyles.sectionHeader}>Social Media</Text>
                {displaySocials.map((s, i) => {
                  const p = s.platform?.toLowerCase() ?? "";
                  const iconName =
                    p.includes("instagram") ? "logo-instagram" :
                    p.includes("facebook")  ? "logo-facebook"  :
                    p.includes("twitter") || p.includes("x") ? "logo-twitter" :
                    p.includes("youtube")   ? "logo-youtube"   :
                    p.includes("tiktok")    ? "logo-tiktok"    :
                    p.includes("linkedin")  ? "logo-linkedin"  :
                    "globe-outline";
                  const label = s.platform
                    ? s.platform.charAt(0).toUpperCase() + s.platform.slice(1)
                    : "Social";
                  return (
                    <TouchableOpacity
                      key={i}
                      style={sharedStyles.infoCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        s.link &&
                        Linking.openURL(
                          s.link.startsWith("http") ? s.link : `https://${s.link}`
                        )
                      }
                    >
                      <View style={sharedStyles.infoIconWrap}>
                        <Ionicons name={iconName as any} size={20} color={Colors.primary} />
                      </View>
                      <View style={sharedStyles.infoContent}>
                        <Text style={sharedStyles.infoLabel}>{label}</Text>
                        <Text style={sharedStyles.infoValue}>{s.link}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            <ScheduleSection
              slots={businessProfile?.schedule_slots ?? []}
              isOwner={isOwner}
              businessProfileId={businessProfile?.id!}
              onUpdate={fetchData}
            />

            <OfferingsSection
              offerings={businessProfile?.offerings ?? []}
              isOwner={isOwner}
              businessProfileId={businessProfile?.id!}
              onUpdate={fetchData}
            />

            <ContactSection
              contactInfo={businessProfile?.contact_info}
              isOwner={isOwner}
              businessProfileId={businessProfile?.id!}
              socialMedia={displaySocials}
              userEmail={user?.email ?? undefined}
              userPhone={businessProfile?.phone_number}
              onUpdate={fetchData}
            />

            <TrainingLocations
              locations={businessProfile?.training_locations ?? []}
              isOwner={isOwner}
              businessProfileId={businessProfile?.id!}
              onUpdate={fetchData}
            />
          </>
        ) : (
          <View style={styles.eventsTab}>
            <EventsList
              events={events}
              isOwner={isOwner}
              onEventDeleted={(id) =>
                setEvents((prev) => prev.filter((e) => e.id !== id))
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 120 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  eventsTab: { paddingTop: 4 },
});
