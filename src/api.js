// ─── ACTISIS API Service ─────────────────────────────────────────────────────
// Centraliza todas las llamadas al backend REST API

const API_BASE = "/api"; // Vite proxy redirige a http://localhost:5000

// Flag para evitar múltiples reloads simultáneos
let isLoggingOut = false;

const api = {
  getToken: () => localStorage.getItem("actisis_token"),
  setToken: (t) => localStorage.setItem("actisis_token", t),
  clearToken: () => localStorage.removeItem("actisis_token"),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem("actisis_user")); }
    catch { return null; }
  },
  setUser: (u) => localStorage.setItem("actisis_user", JSON.stringify(u)),
  clearUser: () => localStorage.removeItem("actisis_user"),

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // Descarga de PDF
    if (res.headers.get("content-type")?.includes("application/pdf")) {
      return res.blob();
    }

    const data = await res.json();

    if (!res.ok) {
      // Token expirado → limpiar sesión y recargar UNA sola vez
      if (res.status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        this.clearToken();
        this.clearUser();
        // Usar setTimeout para evitar recargas en cascada
        setTimeout(() => { isLoggingOut = false; window.location.reload(); }, 100);
      }
      throw new Error(data.mensaje || data.errores?.[0]?.msg || "Error en la solicitud");
    }

    return data;
  },

  // Métodos HTTP
  get(url) { return this.request(url); },
  post(url, body) { return this.request(url, { method: "POST", body }); },
  put(url, body) { return this.request(url, { method: "PUT", body }); },
  patch(url, body) { return this.request(url, { method: "PATCH", body }); },
  del(url) { return this.request(url, { method: "DELETE" }); },

  // ─── Auth ───
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout", {}),
  me: () => api.get("/auth/me"),
  invite: (data) => api.post("/auth/invite", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),

  // ─── Activities ───
  getActivities: (params = "") => api.get(`/activities${params ? "?" + params : ""}`),
  getPublicActivities: () => api.get("/activities/public"),
  getActivity: (id) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.get(`/activities/${id}`); },
  createActivity: (data) => api.post("/activities", data),
  updateActivity: (id, data) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.put(`/activities/${id}`, data); },
  deleteActivity: (id) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.del(`/activities/${id}`); },
  approveActivity: (id, data = {}) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.patch(`/activities/${id}/approve`, data); },
  rejectActivity: (id, motivo = "") => { if (!id) return Promise.reject(new Error("ID requerido")); return api.patch(`/activities/${id}/reject`, { motivo }); },
  getActivityStats: (params = "") => api.get(`/activities/stats${params ? "?" + params : ""}`),

  // ─── Users ───
  getUsers: (params = "") => api.get(`/users${params ? "?" + params : ""}`),
  getUserById: (id) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.get(`/users/${id}`); },
  updateUser: (id, data) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.put(`/users/${id}`, data); },
  toggleUserStatus: (id) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.patch(`/users/${id}/toggle-status`); },

  // ─── Agreements ───
  getAgreements: () => api.get("/agreements"),
  getAgreementsList: () => api.get("/agreements/list"),
  createAgreement: (data) => api.post("/agreements", data),
  updateAgreement: (id, data) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.put(`/agreements/${id}`, data); },

  // ─── Speakers ───
  getSpeakers: () => api.get("/speakers"),
  getSpeakersList: () => api.get("/speakers/list"),
  createSpeaker: (data) => api.post("/speakers", data),
  updateSpeaker: (id, data) => { if (!id) return Promise.reject(new Error("ID requerido")); return api.put(`/speakers/${id}`, data); },

  // ─── Profile ───
  getProfile: () => api.get("/profile"),
  updateProfile: (data) => api.put("/profile", data),
  changePassword: (data) => api.put("/profile/password", data),

  // ─── Reports ───
  exportPDF: (params = "") => api.get(`/reports/pdf${params ? "?" + params : ""}`),
  getAuditLog: (params = "") => api.get(`/reports/audit${params ? "?" + params : ""}`),
};

export default api;
