import React from "react";
import { useAuth } from "../../context/AuthContext";
import BusinessProfileScreen from "../business/profile"; // তোমার business profile component

export default function ProfileScreen() {
  const { user } = useAuth();

  if (user?.role === "Business") {
    return <BusinessProfileScreen />;
  }
  else {
    // Regular user profile component
    return <ProfileScreen />;
  }


}

