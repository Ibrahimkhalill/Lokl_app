import { api } from "../lib/api";

export const authService = {
  login(data: { phone?: string; email?: string; password: string }) {
    return api.post("/auth/login", data);
  },

  register(data: {
    username: string;
    full_name: string;
    phone: string;
    password: string;
    date_of_birth: string;
   
  }) {
    return api.post("/auth/register/", data);
  },

  verifyPhone(data: { user_id: number; otp: string }) {
    return api.post("/auth/verify-phone", data);
  },

  registerBusiness(data: {
    business_name: string;
    business_type: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    password: string;
    confirm_password: string;
    social_media?: { platform: string; link: string }[];
  }) {
    return api.post("/auth/register/business/", data);
  },

  forgotPassword(data: { phone: string }) {
    return api.post("/auth/forgot-password", data);
  },

  verifyResetCode(data: { user_id: number; verification_code: string }) {
    return api.post("/auth/verify-reset-code", data);
  },

  resetPassword(data: {
    user_id: number;
    secret_key: string;
    new_password: string;
    confirm_password: string;
  }) {
    return api.post("/auth/reset-password", data);
  },

  savePreferences(data: {
    sports_interests: string[];
    looking_for: string[];
  }) {
    return api.post("/auth/preferences/", data);
  },
};
