import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getIsMobileParam } from "./homePageApi";
import BASE_URL from "../api/baseUrl";

export const fetchSearchGames = async ({ term, page = 1, limit = 30 }) => {
  const fixedSearchTerm = (term || "").trim();
  if (!fixedSearchTerm) {
    return { items: [], byProvider: [], totalPages: 1 };
  }

  const isMobileParam = getIsMobileParam();

  const [resGlobal, resType] = await Promise.all([
    axios.get(
      `${BASE_URL}/all-games?is_mobile=${isMobileParam}&global=${fixedSearchTerm}&page=${page}&limit=${limit}`
    ),
    axios.get(
      `${BASE_URL}/all-games?is_mobile=${isMobileParam}&type=${fixedSearchTerm}&page=${page}&limit=${limit}`
    ),
  ]);

  // Merge global + type (dedupe by uuid)
  const merged = [
    ...(resGlobal?.data?.allGames || []),
    ...(resType?.data?.allGames || []),
  ];
  const items = Array.from(new Map(merged.map((g) => [g.uuid, g])).values());

  const totalPages = Math.max(
    resGlobal?.data?.pagination?.total_page || 1,
    // resProvider?.data?.pagination?.total_page || 1,
    resType?.data?.pagination?.total_page || 1
  );

  return {
    items,
    // byProvider: resProvider?.data?.allGames || [],
    totalPages,
  };
};

/** Optional hook version */
const useSearchGames = (term, page = 1, enabled = false) => {
  const fixed = (term || "").trim();
  return useQuery({
    queryKey: ["searchGames", { term: fixed, page, limit: 30 }],
    queryFn: () => fetchSearchGames({ term: fixed, page, limit: 30 }),
    enabled: enabled && fixed.length >= 3,
    // keep previous page’s data while the next page loads
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export default useSearchGames;

// const getFilteredGames = async (type) => {
//   const response = await axios.get(`${BASE_URL}/all-games?is_mobile=1`, {
//     params: { type },
//   });
//   return response.data.allGames;
// };

// export const useFilteredGames = (type, options = {}) => {
//   return useQuery({
//     queryKey: ["filteredGames", type],
//     queryFn: () => getFilteredGames(type),
//     enabled: !!type,
//     onError: () => {
//       toast.error("Something went wrong while filtering games.");
//     },
//     staleTime: 1000 * 60,
//     ...options,
//   });
// };

// hooks/filteredGames.js

// const getFilteredGames = async (type, page = 1, limit = 30) => {
//   const { data } = await axios.get(`${BASE_URL}/all-games`, {
//     params: { is_mobile: 1, type, page, limit },
//   });
//   const items = Array.isArray(data?.allGames) ? data.allGames : [];
//   const totalPages =
//     data?.pagination?.total_page || data?.pagination?.total_pages || 1;
//   return { items, totalPages };
// };

// export const useFilteredGames = (type, page = 1, limit = 30) =>
//   useQuery({
//     queryKey: ["filteredGames", type, page, limit],
//     queryFn: () => getFilteredGames(type, page, limit),
//     enabled: !!type, // don't run when type is null
//     // placeholderData: keepPreviousData,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 30 * 60 * 1000,
//     refetchOnWindowFocus: false,
//     retry: 1,
//   });
