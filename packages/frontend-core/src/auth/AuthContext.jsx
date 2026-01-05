
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import axios from "axios";
// import routes from "../Components/routes/route";
// import { getAuthType } from "../API/authAPI";
import { useLocation } from "react-router-dom";
// import axiosInstance from "../API/axiosConfig";
import BASE_URL from "../api/baseUrl";

import { getAuthType } from "../api/authAPI";
import axiosInstance from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loginVerify, setLoginVerify] = useState(null);
  const [portalAllData, setPortalAllData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authType, setAuthType] = useState(null);
  const [portalSettings, setPortalSettings] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [portalStatus, setPortalStatus] = useState("loading");
  const [portalErrorMsg, setPortalErrorMsg] = useState("");
  const [telegramConfig, setTelegramConfig] = useState({ link: null });
  const location = useLocation();
  const firstLoadRef = useRef(true);
  // inside AuthProvider or the component that calls fetchPortalStatus
  const DEFAULT_CHANNELS = { whatsapp: 0, tawk: 0, telegram: 0 };
  // const [portalStatus, setPortalStatus] = useState("loading");
  const [portalChannels, setPortalChannels] = useState(DEFAULT_CHANNELS);
  // ✅ paste the effect here, inside AuthProvider
  useEffect(() => {
    const code = localStorage.getItem("pendingGiftCode");
    if (!user?.token || !code) return;

    (async () => {
      try {
        const upper = code;

        await axiosInstance.get("/gift-envelope/validate", {
          params: { id: upper },
        });

        const payload = { mobile: user?.mobile, code: upper };
        const claimRes = await axiosInstance.post(
          "/gift-envelope/claim",
          payload
        );

        sessionStorage.setItem(
          "giftFlash",
          JSON.stringify({
            type: "success",
            message: claimRes?.data?.message || "Gift claimed successfully 🎉",
            amount: claimRes?.data?.amount,
          })
        );
        window.dispatchEvent(new Event("giftFlash")); // ✅ notify success
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Gift link invalid, used, or claim failed.";
        sessionStorage.setItem(
          "giftFlash",
          JSON.stringify({ type: "error", message: msg })
        );
        window.dispatchEvent(new Event("giftFlash")); // ✅ notify error
      } finally {
        localStorage.removeItem("pendingGiftCode");
      }
    })();
  }, [user?.token, user?.mobile]);
  // --- Fetch user data ---
  const fetchUser = useCallback(async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/player/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data.type === "valid") {
        const { user, portal_settings, status } = response.data;
        console.log(response.data);

        setUser({ token, ...user });
        setLoginVerify(status);
        setPortalAllData(response.data);
        setProfile(user);
        setAvatar(user);
        setPortalSettings(portal_settings);

        // await fetchAuthType();

        // const profileRes = await axios.get(`${BASE_URL}/player/profile`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });

        // setAvatar(profileRes.data.player);
      } else if (response.data?.type === "player_inactive") {
        console.warn("Player is inactive. Logging out...");
        localStorage.removeItem("token");
        setUser(null);
        setAvatar(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Fetch auth type ---
  const fetchAuthType = async () => {
    try {
      const res = await getAuthType();
      setAuthType(res);
    } catch (error) {
      console.error("Failed to fetch auth type", error);
    }
  };

  // --- Fetch portal status ---
  const fetchPortalStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/portal-info`);

      if (res?.data?.status_code === 403) {
        setPortalStatus("forbidden");
        setPortalErrorMsg(res?.data?.msg || "Access denied.");
        return;
      }

      setPortalStatus("active");

      const map = Object.fromEntries(
        (res?.data?.channels || []).map((c) => [c.channel, Number(!!c.status)])
      );

      setPortalChannels({ whatsapp: 0, tawk: 0, telegram: 0, ...map });
    } catch (error) {
      if (error.response?.status === 403) {
        setPortalStatus("forbidden");
        setPortalErrorMsg("Portal API access forbidden.");
      } else {
        console.error("Failed to fetch portal info", error);
        setPortalStatus("active");
        setPortalChannels({ whatsapp: 0, tawk: 0, telegram: 0 });
      }
    }
  };
  // useEffect(() => {
  //   fetchPortalStatus();
  // }, []);

  // --- First load init ---
  useEffect(() => {
    const initApp = async () => {
      await fetchPortalStatus();
      await fetchCommunication();
      const token = localStorage.getItem("token");
      if (token) {
        await fetchUser(token);
      } else {
        setIsLoading(false);
      }

      // Mark first load complete
      firstLoadRef.current = false;
    };
    initApp();
  }, [fetchUser]);

  // WhatsAPP icon Starts
  const [waConfig, setWaConfig] = useState({ phone: null, text: null });
  const [tawkConfig, setTawkConfig] = useState({
    url: null,
    propertyId: null,
    widgetId: null,
  });

  function toWaPhone(raw) {
    if (!raw) return null;
    return String(raw).replace(/[^\d]/g, ""); // "+91 98..." -> "9198..."
  }
  function parseTawk(url) {
    try {
      const u = new URL(url);
      // expect .../embed.tawk.to/<propertyId>/<widgetId>
      const parts = u.pathname.split("/").filter(Boolean);
      // find last two non-empty tokens
      const widgetId = parts[parts.length - 1] || null;
      const propertyId = parts[parts.length - 2] || null;
      return { propertyId, widgetId };
    } catch {
      return { propertyId: null, widgetId: null };
    }
  }

  // inside AuthProvider
  // const fetchCommunication = async () => {
  //   try {
  //     const { data } = await axios.get(`${BASE_URL}/communication`);

  //     // Map channel enable/disable
  //     const map = Object.fromEntries(
  //       (data?.channels || []).map((c) => [c.channel, Number(!!c.status)])
  //     );
  //     setPortalChannels({ whatsapp: 0, tawk: 0, telegram: 0, ...map });

  //     // Extract per-channel configs
  //     let w = { phone: null, text: null };
  //     let t = { url: null, propertyId: null, widgetId: null };

  //     for (const c of data?.channels || []) {
  //       if (c.channel === "whatsapp" && c.status) {
  //         w = {
  //           phone: toWaPhone(c?.config?.number),
  //           text: c?.config?.welcomeMessage || "Hi! How can we help you?",
  //         };
  //       }
  //       if (c.channel === "tawk" && c.status) {
  //         const url = c?.config?.tawk_url || null;
  //         const ids = url
  //           ? parseTawk(url)
  //           : { propertyId: null, widgetId: null };
  //         t = { url, ...ids };
  //       }
  //     }

  //     setWaConfig(w);
  //     setTawkConfig(t);
  //   } catch (e) {
  //     console.error("communication fetch failed", e);
  //     // keep previous portalChannels; clear configs on error
  //     setWaConfig({ phone: null, text: null });
  //     setTawkConfig({ url: null, propertyId: null, widgetId: null });
  //   }
  // };

 const fetchCommunication = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/communication`);

    console.log(data);

    // 1) on/off
    const map = Object.fromEntries(
      (data?.channels || []).map((c) => [c.channel, Number(!!c.status)])
    );
    setPortalChannels({ whatsapp: 0, tawk: 0, telegram: 0, ...map });

    // 2) configs
    let w = { phone: null, text: null };
    let t = { url: null, propertyId: null, widgetId: null };
    let tg = { link: null };

    for (const c of data?.channels || []) {

      // ---- WHATSAPP FIX ----
      if (c.channel === "whatsapp" && c.status) {
        w = {
          phone: toWaPhone(c?.config?.phone),        // FIXED
          text: c?.config?.text || "Hi! How can we help you?", // FIXED
        };
      }

      // ---- TAWK ----
      if (c.channel === "tawk" && c.status) {
        const url = c?.config?.tawk_url || null;
        const ids = url ? parseTawk(url) : { propertyId: null, widgetId: null };
        t = { url, ...ids };
      }

      // ---- TELEGRAM ----
      if (c.channel === "telegram" && c.status) {
        tg = { link: c?.config?.link || null };
      }
    }

    setWaConfig(w);
    setTawkConfig(t);
    setTelegramConfig(tg);

  } catch (e) {
    console.error("communication fetch failed", e);

    setWaConfig({ phone: null, text: null });
    setTawkConfig({ url: null, propertyId: null, widgetId: null });
    setTelegramConfig({ link: null });
  }
};

  // --- Route change check ---
  // useEffect(() => {
  //   if (firstLoadRef.current || isLoading) return;

  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     fetchUser(token);
  //   }
  // }, [location.pathname, isLoading, fetchUser]);

  // --- Login ---
  const login = (token) => {
    localStorage.setItem("token", token);
    fetchUser(token);
  };

  // --- Logout ---
  // const logout = async (navigate) => {
  //   try {
  //     const token = user?.token;
  //     if (!token) {
  //       console.warn("No token found, user already logged out.");
  //       return;
  //     }

  //     await axios.post(
  //       `${BASE_URL}/player/logout`,
  //       {},
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error during logout:", error);
  //   } finally {
  //     localStorage.removeItem("token");
  //     setUser(null);
  //     setAvatar(null);
  //     if (navigate) navigate(routes.home);
  //   }
  // };

  const logout = async (navigate, redirectTo) => {
  try {
    const token = user?.token;
    if (!token) return;

    await axios.post(
      `${BASE_URL}/player/logout`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    localStorage.removeItem("token");
    setUser(null);
    setAvatar(null);

    // ✅ core doesn't know routes; app tells where to go
    if (navigate && redirectTo) navigate(redirectTo);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        authType,
        portalSettings,
        avatar,
        setAvatar,
        setProfile,
        login,
        logout,
        fetchAuthType,
        fetchUser,
        portalStatus,
        portalErrorMsg,
        loginVerify,
        portalAllData,
        portalChannels,
        waConfig,
        tawkConfig,
        telegramConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
