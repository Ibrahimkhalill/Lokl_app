import { api } from "../lib/api";

export const messageService = {
  getInbox() {
    return api.get("/messages/all/");
  },
  getDmThread(userId: number) {
    return api.get(`/messages/${userId}/`);
  },
  sendDm(recipientId: number, body: string) {
    return api.post("/messages/", { recipient_id: recipientId, body });
  },
  getGroupMessages(groupId: number) {
    return api.get(`/groups/${groupId}/messages/`);
  },
  sendGroupMessage(groupId: number, content: string) {
    return api.post(`/groups/${groupId}/messages/`, { content });
  },
  getEventChat(eventId: number) {
    return api.get(`/events/${eventId}/chat/`);
  },
  sendEventMessage(eventId: number, body: string) {
    return api.post(`/events/${eventId}/chat/`, { body });
  },
};
