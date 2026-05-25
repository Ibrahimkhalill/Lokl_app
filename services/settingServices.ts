// services/userService.ts
import { api } from "../lib/api";

export const settingService = {

  getOwnProfile() {
    return api.get("/settings/profile/");
  },
  

  updateProfile(data: FormData) {
    return api.patch("/users/me/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword(data: { current_password: string; new_password: string }) {
    return api.post("/users/change-password/", data);
  },
  

    deleteAccount() { 
    return api.delete("/settings/delete-account/");
    }
  

};