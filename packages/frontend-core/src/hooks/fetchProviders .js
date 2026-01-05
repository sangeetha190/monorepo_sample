// src/hooks/useProviders.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import BASE_URL from "../API/api";
// console.log(`${BASE_URL}/providers-list`);

const fetchProviders = async () => {
  const res = await axios.get(`${BASE_URL}/providers-list`);
  return res.data.providers; // Adjust if the API format is different
};

export const useProviders = () => {
  return useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });
};
