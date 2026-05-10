window.APP_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz3zKG8r_aqQbpxkZ3yy6yET50_mJVKIRMeO6wrdGpQdTHAuUVrjdYjmOmN_x5ers1dkw/exec",
  API_TOKEN: "DashboardKedatangan2026",

  APP_PASSWORD: "brk2026",
  REQUIRE_LOGIN: false,

  REFRESH_INTERVAL_MS: 60000,
  REALTIME_INTERVAL_MS: 15000,
  // Apps Script tidak mendukung WebSocket langsung. Isi URL ini jika nanti memakai backend realtime seperti Firebase/Supabase/Node WebSocket.
  WEBSOCKET_URL: "",

  DEFAULT_BRANCH: "BRK 1",
  BRANCHES: ["BRK 1", "BRK 2", "BRK 3"],

  THRESHOLDS: {
    silageLowPercent: 30,
    harianLowPercentAfterHour: 50,
    harianCheckHour: 15,
    kendaraanLowPeak: 20
  },

  TELEGRAM: {
    enabled: false
  },

  WHATSAPP: {
    enabled: false,
    phone: "",
    defaultMessage: "Dashboard Kedatangan Pakan membutuhkan perhatian."
  }
};
