import axios from "axios";


import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthContext from "@repo/frontend-core/auth/AuthContext"; // or from index export
import { getAuthType, loginUser } from "@repo/frontend-core/api/authAPI";

import routes from "../../routes/routes";
import { APP_NAME } from "@repo/frontend-core/constants"; // if you export it
export const http = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "https://example.com",
  timeout: 30000
});

export function setAuthToken(token) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}

