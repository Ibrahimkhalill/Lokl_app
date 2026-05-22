export interface User {
  id: number;
  username: string | null;
  name: string;
  email: string | null;
  phone: string;
  role: "User" | "Business" | "Admin";
  status: "active" | "inactive" | "suspended";
  profile_picture: string | null;
  bio: string | null;
  date_of_birth: string | null;
  sports_interests: string[];
  looking_for: string[];
  followers_count: number;
  following_count: number;
  is_following: boolean;
  date_joined: string;
}
