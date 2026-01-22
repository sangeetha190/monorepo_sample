// src/API/depositAPI.js

import axios from "axios";
import BASE_URL from "./api";
import axiosInstance from "./axiosConfig";
/** ---------------- Common helper ---------------- */
const ensureOk = (res, fallback = "Request failed") => {
  // Normalize APIs that return { status: "success" | "error", msg, ... }
  if (res?.data?.status && res.data.status !== "success") {
    throw new Error(res.data?.msg || fallback);
  }
  return res.data;
};

// src/API/depositAPI.js

// get the deposit payment method
export const getDepositMethods = async (token) => {
  const response = await axiosInstance.get("/player/get-deposit-method", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// get the Admin payment details
// export const getPaymentDetails = async (token, methodId) => {
//   const response = await axiosInstance.get("/player/get-payment-detail", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     params: {
//       payment_method_id: methodId,
//     },
//   });
//   return response.data;
// };

// get the Admin payment details
export const getPaymentDetails = async (token, methodId) => {
  const res = await axiosInstance.get("/player/get-payment-detail", {
    headers: { Authorization: `Bearer ${token}` },
    params: { payment_method_id: methodId },
  });

  if (res.data?.status === "error") {
    throw new Error(res.data.msg || "Payment details not found");
  }
  return res.data;
};

// Send the Deposit Request
export const sendDepositRequest = async ({
  token,
  amount,
  utr_number,
  payment_screenshot,
  paymentSelectedMethod,
}) => {
  // console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  formData.append("payment_detail_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);

  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }

  const response = await axios.post(
    `${BASE_URL}/player/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// deposit History
export const depositHistory = async (token) => {
  const response = await axiosInstance.get("/player/deposit-history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/** ---------------- Portal Settings + Random Suggestions ---------------- */

/**
 * Fetch portal settings to get min/max deposit (or withdraw)
 * @param {"deposit"|"withdraw"} type
 */
export const getPortalSettings = async (type = "deposit", token) => {
  const res = await axiosInstance.get("/player/portal-setting", {
    params: { type: type },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  // Expected: { status: "success", settings: { min_deposit, max_deposit } }
  const data = ensureOk(res, "Failed to fetch portal settings");
  return data?.settings || {};
};

// Namibia function
export const getDepositMethodsNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/manual-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Send the Deposit Request
export const sendDepositRequestNamibia = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  player_id,
  payment_screenshot,
}) => {
  // console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  formData.append("player_id", player_id);
  formData.append("manual_deposit_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }

  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/manual-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Namibia Ewallet Function

export const getDepositMethodsNamibiaEwallet = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/ewallet-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// deposit-namibia/ewallet-deposit/send-deposit-request
// Send the Deposit Request namibia
export const sendDepositRequestNamibiaEwallet = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  player_id,
  payment_screenshot,
}) => {
  // console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  formData.append("player_id", player_id);
  formData.append("manual_ewallet_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }

  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/ewallet-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// India function
export const getDepositMethodsIndia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-india/manual-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { payment_method_id: "1" },
    }
  );
  return response.data;
};
// Deposit History
export const depositHistoryNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/manual-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Send the Deposit Request
export const sendDepositRequestIndia = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  player_id,
  image,
}) => {
  // console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  formData.append("player_id", player_id);
  formData.append("payment_detail_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  formData.append("image", image);

  const response = await axios.post(
    `${BASE_URL}/player/deposit-india/manual-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
// Deposit History Ewallet namibia
export const depositHistoryEwalletNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/ewallet-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// Kazang

// Send the Deposit Request
export const DepositKazangVoucher = async ({ token, pin }) => {
  const formData = new FormData();
  formData.append("pin", pin);
  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/kazang-deposit/check-voucher-status`,
    formData,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log(response, "apin ");

  return response.data;
};

export const redeemKazangVoucher = async ({ token, player_id, pin }) => {
  const { data } = await axiosInstance.post(
    "/player/deposit-namibia/kazang-deposit/redeem_voucher",
    { player_id, pin },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

// deposit History
export const depositKazangHistory = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/kazang-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Easy Wallet getDepositMethodsNamibiaEasywallet

export const getDepositMethodsNamibiaEasywallet = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/easy-wallet-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const sendDepositRequestNamibiaEasywallet = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  // player_id,
  payment_screenshot,
}) => {
  console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  // formData.append("player_id", player_id);
  formData.append("manual_easy_wallet_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }
  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/easy-wallet-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const depositHistoryEasyNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/easy-wallet-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// blue wallet method
export const getDepositMethodsNamibiaBluewallet = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/blue-wallet-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const sendDepositRequestNamibiaBlueWallet = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  // player_id,
  payment_screenshot,
}) => {
  console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  // formData.append("player_id", player_id);
  formData.append("manual_blue_wallet_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }
  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/blue-wallet-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const depositHistoryBlueNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/blue-wallet-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// nedBank wallet method
export const getDepositMethodsNamibiaNedBankwallet = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/nedbank-wallet-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const sendDepositRequestNamibiaNedBankWallet = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  // player_id,
  payment_screenshot,
}) => {
  console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  // formData.append("player_id", player_id);
  formData.append("manual_nedbank_wallet_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }
  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/nedbank-wallet-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const depositHistoryNedBankNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/nedbank-wallet-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// AccessMoney wallet method
export const getDepositMethodsNamibiaAccessMoneywallet = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/access-money-wallet-deposit/get-payment-details",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const sendDepositRequestNamibiaAccessMoneyWallet = async ({
  token,
  amount,
  utr_number,
  paymentSelectedMethod,
  // player_id,
  payment_screenshot,
}) => {
  console.log("paymentSelectedMethod", paymentSelectedMethod);

  const formData = new FormData();
  // formData.append("player_id", player_id);
  formData.append("manual_access_wallet_id", paymentSelectedMethod);
  formData.append("amount", amount);
  formData.append("utr", utr_number);
  if (payment_screenshot) {
    formData.append("image", payment_screenshot);
  }
  const response = await axios.post(
    `${BASE_URL}/player/deposit-namibia/access-money-wallet-deposit/send-deposit-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const depositHistoryAccessMoneyNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/deposit-namibia/access-money-wallet-deposit/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// =============================================================
// All deposit History starts
// export const AlldepositHistory = async (token) => {
//   const response = await axiosInstance.get("/player/deposit-namibia/history", {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   return response.data;
// };
export const AlldepositHistory = async (token, page = 1, per_page = 10) => {
  const response = await axiosInstance.get("/player/deposit-namibia/history", {
    params: { page, per_page },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // { status, msg, depositHistory: {...} }
};

// api.ts

export const fetchDepositHistory = async ({ page, perPage, token }) => {
  const res = await axiosInstance.get("/player/deposit-namibia/history", {
    params: { page, per_page: perPage },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res && res.data ? res.data.depositHistory : undefined;
};

export const fetchDepositDetails = async ({ id, type, token }) => {
  const res = await axiosInstance.get(
    "/player/deposit-namibia/history/details",
    {
      params: { id, type },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  // API shape: { status, msg, depositDetail: {...} }
  return res?.data?.depositDetail ?? res?.data; // ← normalize
};

export const fetchWithdrawHistory = async ({ page, perPage, token }) => {
  const res = await axiosInstance.get("/player/withdraw/wallet/history", {
    params: { page, per_page: perPage },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res && res.data ? res.data.withdrawHistory : undefined;
};

export const fetchWithdrawDetails = async ({ id, type, token }) => {
  const res = await axiosInstance.get(
    "/player/withdraw/wallet/history/details",
    {
      params: { id, type },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  // API shape: { status, msg, depositDetail: {...} }
  return res?.data?.depositDetail ?? res?.data; // ← normalize
};