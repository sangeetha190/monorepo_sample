// get the Bank details

import axios from "axios";
import axiosInstance from "./axiosConfig";
import BASE_URL from "./api";

// Get Bank Data
export const getBankDetails = async (token) => {
  //   console.log("checking the with Bank Details", token);
  const response = await axiosInstance.get("/player/get-bank", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// store Bank Data
export const storeBank = async (token, values) => {
  const response = await axios.post(`${BASE_URL}/player/store-bank`, values, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Edit Bank Details
export const EditBank = async (bankId, token) => {
  // console.log(bankId);

  const response = await axiosInstance.get(`/player/edit-bank/${bankId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
// update-bank
export const updateBank = async (token, values, editingBankId) => {
  const response = await axios.post(
    `${BASE_URL}/player/update-bank/${editingBankId}`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// active in-active status changing
export const changeBankStatus = async (token, bank_id, newStatus) => {
  const response = await axiosInstance.get("/player/change-bank-status", {
    params: { bank_id, status: newStatus },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// delete Bank Details
export const deleteBankDetails = async (token, bankId) => {
  const response = await axiosInstance.get("/player/delete-bank", {
    params: { bank_id: bankId, is_deleted: "0" },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// send-withdraw-request
export const sendWithdrawRequest = async ({ token, bankId, amount }) => {
  const formData = new FormData();
  formData.append("player_bank_id", bankId);
  formData.append("amount", amount);

  const response = await axios.post(
    `${BASE_URL}/player/send-withdraw-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// withdraw History
export const withdrawHistoryPage = async (token) => {
  const response = await axiosInstance.get("/player/withdraw-history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ====================================================================
// Get Bank Data namibia
export const getBankDetailsNamibia = async (token, userId) => {
  console.log(userId);

  const response = await axiosInstance.get(
    "/player/withdraw-namibia/manual-withdraw/get-player-banks",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { player_id: userId }, // <-- goes here
    }
  );
  return response.data;
};
// ====================================================================

// store Bank Data Namibia
export const storeBankNamibia = async (token, values, userId) => {
  const response = await axios.post(
    `${BASE_URL}/player/withdraw-namibia/manual-withdraw/store-player-bank`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },

      params: { player_id: userId },
    }
  );
  return response.data;
};

// active in-active status changing
export const changeBankNamibiaStatus = async (token, bank_id, newStatus) => {
  const formData = new FormData();
  formData.append("bank_id", bank_id);
  formData.append("status", newStatus);
  console.log(formData);

  const response = await axiosInstance.post(
    "/player/withdraw-namibia/manual-withdraw/change-player-bank-status",
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
// Edit Bank Details
export const EditBankNamibia = async (bankId, token) => {
  // console.log("bankId:", bankId);

  const url = `player/withdraw-namibia/manual-withdraw/edit-player-bank/${bankId}`;

  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { bank_id: bankId }, // 👈 query string ?bank_id=123
  });

  return response.data;
};
// update-bank
export const updateBankNamibia = async (token, values, editingBankId) => {
  console.log(values);

  const response = await axios.post(
    `${BASE_URL}/player/withdraw-namibia/manual-withdraw/update-player-bank/${editingBankId}`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { bank_id: editingBankId },
    }
  );
  return response.data;
};
// delete Bank Details
export const deleteBankNamibiaDetails = async (token, bankId) => {
  const formData = new FormData();
  formData.append("bank_id", bankId);
  formData.append("is_deleted", "0");
  const response = await axiosInstance.post(
    "/player/withdraw-namibia/manual-withdraw/delete-player-bank",
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// send-withdraw-request Namibia
export const sendWithdrawRequestNamibia = async ({
  token,
  bankId,
  amount,
  userid,
}) => {
  const formData = new FormData();
  formData.append("player_bank_id", bankId);
  formData.append("amount", amount);
  formData.append("player_id", userid);

  const response = await axios.post(
    `${BASE_URL}/player/withdraw-namibia/manual-withdraw/send-withdraw-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// withdraw History Namibia
export const withdrawHistoryPageNamibia = async (token) => {
  const response = await axiosInstance.get(
    "/player/withdraw-namibia/manual-withdraw/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
//=========================================
// Get Bank Data India Manual
export const getBankDetailsIndia = async (token, userId) => {
  console.log(userId);

  const response = await axiosInstance.get(
    "/player/withdraw-india/manual-withdraw/get-player-bank",
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { player_id: userId }, // <-- goes here
    }
  );
  return response.data;
};

// store Bank Data storeBankIndia
export const storeBankIndia = async (token, values, userId) => {
  const response = await axios.post(
    `${BASE_URL}/player/withdraw-india/manual-withdraw/store-player-bank`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },

      // params: { player_id: userId },
    }
  );
  return response.data;
};

// send-withdraw-request India
export const sendWithdrawRequestIndia = async ({
  token,
  bankId,
  amount,
  // userid,
}) => {
  const formData = new FormData();
  formData.append("player_bank_id", bankId);
  formData.append("amount", amount);
  // formData.append("player_id", userid);

  const response = await axios.post(
    `${BASE_URL}/player/withdraw-india/manual-withdraw/send-withdraw-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// WITHDRAW WALLET
export const storeWallet = async (token, values, methodId) => {
  console.log(methodId);

  const response = await axios.post(
    `${BASE_URL}/player/withdraw/wallet/player-wallet/store`,
    {
      ...values, // Spread the existing form data (name, phone_number)
      payment_method_id: methodId, // Add the hardcoded ID here
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get Bank Data
export const getWalletDetails = async (token) => {
  //   console.log("checking the with Bank Details", token);
  const response = await axiosInstance.get(
    "/player/withdraw/wallet/player-wallet/list",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// active in-active status changing
// export const changeWalletStatus = async (token, wallet_id, newStatus) => {
//   const response = await axiosInstance.post(
//     "/player/withdraw/wallet/player-wallet/status",
//     {
//       // Data goes here directly as the second argument
//       player_wallet_id: wallet_id,
//       status: 1,
//     },
//     {
//       // Headers go here as the third argument
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return response.data;
// };

// active in-active status changing
export const changeWalletStatus = async (token, bank_id, newStatus) => {
  const formData = new FormData();
  formData.append("player_wallet_id", bank_id);
  formData.append("status", newStatus);
  console.log(formData);

  const response = await axiosInstance.post(
    "/player/withdraw/wallet/player-wallet/status",
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Edit Wallet Details
export const EditwalletBank = async (walletId, token) => {
  // Ensure the walletId is not undefined or null before proceeding
  if (!walletId) {
    throw new Error("Wallet ID is required for editing.");
  }

  // Use template literals to dynamically inject the walletId into the URL
  const response = await axiosInstance.get(
    `/player/withdraw/wallet/player-wallet/edit/${walletId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// update-bank
// export const updateWallet = async (token, values, editingBankId) => {
//   console.log(token);

//   const response = await axios.post(
//     `${BASE_URL}/player/withdraw/wallet/player-wallet/update`,
//     values,

//     {
//       // Data goes here directly as the second argument
//       player_wallet_id: editingBankId,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// update-bank
export const updateWallet = async (
  token,
  values,
  editingBankId,
  walletTypeId
) => {
  console.log(values);

  const response = await axios.post(
    `${BASE_URL}/player/withdraw/wallet/player-wallet/update`,
    values,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: { player_wallet_id: editingBankId, wallet_type_id: walletTypeId },
    }
  );
  return response.data;
};

// delete Bank Details
export const deleteWalletDetails = async (token, bankId) => {
  const formData = new FormData();
  formData.append("player_wallet_id", bankId);
  formData.append("is_deleted", "0");
  const response = await axiosInstance.post(
    "/player/withdraw/wallet/player-wallet/delete",
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const sendWithdrawRequestWallet = async ({
  token,
  bankId,
  amount,
  userid,
}) => {
  const formData = new FormData();
  formData.append("player_wallet_id", bankId);
  formData.append("amount", amount);
  formData.append("player_id", userid);

  const response = await axios.post(
    `${BASE_URL}/player/withdraw/wallet/send-withdraw-request`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
