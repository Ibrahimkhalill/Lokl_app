import React from "react";
import { useAuth } from "../../context/AuthContext";
import BusinessProfileScreen from "../business/profile"; // তোমার business profile component
import ProfileScreen from "../user/profile";

export default function Profile() {
  const { user } = useAuth();

  if (user?.role === "Business") {
    console.log("Rendering BusinessProfileScreen for user:", user);
    return <BusinessProfileScreen />;
  }
  else {

    return <ProfileScreen />;
  }
}

