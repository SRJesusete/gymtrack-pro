import { api } from "./api";
import { guest } from "./guestStore";

// Unified session data layer: API when authenticated, localStorage when guest.
export async function listSessions(isAuth) {
  if (isAuth) return (await api.get("/sessions")).data;
  return guest.listSessions();
}
export async function getSession(isAuth, id) {
  if (isAuth) return (await api.get(`/sessions/${id}`)).data;
  return guest.getSession(id);
}
export async function createFullSession(isAuth, payload) {
  if (isAuth) return (await api.post("/sessions", payload)).data;
  return guest.createFull(payload);
}
export async function quickLog(isAuth, payload) {
  if (isAuth) return (await api.post("/sessions/quick", payload)).data;
  return guest.quickLog(payload);
}
export async function updateSession(isAuth, id, payload) {
  if (isAuth) {
    await api.put(`/sessions/${id}`, payload);
    return;
  }
  guest.updateSession(id, payload);
}
export async function deleteSession(isAuth, id) {
  if (isAuth) {
    await api.delete(`/sessions/${id}`);
    return;
  }
  guest.deleteSession(id);
}
export async function listPRs(isAuth) {
  if (isAuth) return (await api.get("/personal-records")).data;
  return guest.listPRs();
}
