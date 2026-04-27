import React from "react";
import { Colors } from "../../../constants/colors";
import FireIcon from "../../../assets/icons/fire.svg";
import TrophyIcon from "../../../assets/icons/best.svg";
import LoackIcon from "../../../assets/icons/loack.svg";
import NeighboIcon from "../../../assets/icons/neighbo.svg";
import ExploreStreaksIcon from "../../../assets/icons/explore_streaks.svg";
import ActivityIcon from "../../../assets/icons/activity.svg";
import StarIcon from "../../../assets/icons/star.svg";
import DiscoveryIcon from "../../../assets/icons/discovery.svg";
import CameraIcon from "../../../assets/icons/camera.svg";

export type StreakRow = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconGradient: readonly [string, string];
  current: number;
  best: number;
  goal: number;
  days: number;
};

export const STREAKS: StreakRow[] = [
  {
    id: "s1",
    icon: <ActivityIcon width={24} height={24} />,
    title: "ACTIVITY STREAK",
    subtitle: "Last: 1 day ago",
    iconGradient: ["#FF00D4", "#CC00A8"] as const,
    current: 7,
    best: 14,
    goal: 14,
    days: 14,
  },
  {
    id: "s2",
    icon: <ExploreStreaksIcon width={24} height={24} />,
    title: "EXPLORE STREAK",
    subtitle: "Last: 2 hours ago",
    iconGradient: ["#00CED1", "#009EA0"] as const,
    current: 12,
    best: 12,
    goal: 30,
    days: 12,
  },
  {
    id: "s3",
    icon: <ActivityIcon width={24} height={24} />,
    title: "ACTIVITY STREAK",
    subtitle: "Last: 2 hours ago",
    iconGradient: ["#FF00D4", "#CC00A8"] as const,
    current: 12,
    best: 12,
    goal: 30,
    days: 12,
  },
  {
    id: "s4",
    icon: <StarIcon width={24} height={24} />,
    title: "LOKL STREAK",
    subtitle: "Last: 2 hours ago",
    iconGradient: ["#FFD700", "#FFA500"] as const,
    current: 6,
    best: 9,
    goal: 10,
    days: 6,
  },
  {
    id: "s6",
    icon: <NeighboIcon width={24} height={24} />,
    title: "NEIGHBO STREAK",
    subtitle: "Last: 1 week goal",
    iconGradient: ["#00FFD1", "#00FFD1"] as const,
    current: 5,
    best: 7,
    goal: 8,
    days: 5,
  },
];

export type AchievementUnlocked = {
  id: string;
  title: string;
  desc: string;
  rarity: string;
  locked: false;
  icon: React.ReactNode;
  bgColor: string;
};

export type AchievementLocked = {
  id: string;
  title: string;
  desc: string;
  rarity: string;
  locked: true;
  progress: number;
  total: number;
};

export type AchievementRow = AchievementUnlocked | AchievementLocked;

export const ACHIEVEMENTS: AchievementRow[] = [
  {
    id: "a1",
    title: "Content Creator",
    desc: "Posted your first photo or video at a venue",
    rarity: "Rare",
    locked: false,
    icon: <FireIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(21, 93, 252, 1)",
  },
  {
    id: "a2",
    title: "First Discovery",
    desc: "visited your first new venue through LOKL",
    rarity: "Common",
    locked: false,
    icon: <DiscoveryIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(74, 85, 101, 1)",
  },
  {
    id: "a3",
    title: "First Lokl",
    desc: "Left your first review with a score",
    rarity: "Common",
    locked: false,
    icon: <StarIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(74, 85, 101, 1)",
  },
  {
    id: "a4",
    title: "Content Creator",
    desc: "posted your first photo or video at a venue",
    rarity: "Common",
    locked: false,
    icon: <CameraIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(74, 85, 101, 1)",
  },
  {
    id: "a5",
    title: "Social Butterfly",
    desc: "Followed your first 5 users on LOKL",
    rarity: "Common",
    locked: true,
    progress: 3,
    total: 5,
  },
  {
    id: "a6",
    title: "Explore",
    desc: "Discovered 10 new venues across NYC",
    rarity: "Rare",
    locked: true,
    progress: 7,
    total: 10,
  },
  {
    id: "a7",
    title: "Brought Hopper",
    desc: "Visited venues in 3 different boroughs",
    rarity: "Rare",
    locked: true,
    progress: 2,
    total: 3,
  },
  {
    id: "a8",
    title: "Multi-Sport",
    desc: "Checked in at 5 different activity categories",
    rarity: "Rare",
    locked: true,
    progress: 3,
    total: 5,
  },
  {
    id: "a9",
    title: "Week Warrior",
    desc: "Maintained any streak for 4 consecutive weeks",
    rarity: "Rare",
    locked: true,
    progress: 2,
    total: 4,
  },
  {
    id: "a10",
    title: "NYC Lokl",
    desc: "Visited venues in all 5 NYC boroughs",
    rarity: "Ultra",
    locked: true,
    progress: 2,
    total: 4,
  },
  {
    id: "a11",
    title: "Century Club",
    desc: "Discovered 100 different venues",
    rarity: "Ultra",
    locked: true,
    progress: 47,
    total: 100,
  },
  {
    id: "a12",
    title: "Top Reviewer",
    desc: "Left 50 scored reviews across the city",
    rarity: "Ultra",
    locked: true,
    progress: 28,
    total: 50,
  },
];

export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  score: number;
  days: string;
  avatar: string;
};

export const LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "l1",
    rank: 1,
    name: "Sarah Johnson",
    score: 55,
    days: "89 Locations visited",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: "l2",
    rank: 2,
    name: "Mike Chen",
    score: 45,
    days: "76 days",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
  {
    id: "l3",
    rank: 3,
    name: "Emma Davis",
    score: 20,
    days: "65 days",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
  {
    id: "l4",
    rank: 4,
    name: "Mike Chen",
    score: 15,
    days: "50 days",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
];

export const RARITY_COLORS: Record<string, string> = {
  Rare: "#4A90E2",
  Common: "#666",
  Ultra: "#9B59B6",
};

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
