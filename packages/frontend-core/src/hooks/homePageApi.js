import axiosInstance from "../api/axiosConfig";

// export const fetchDiceGames = async () => {
//   const response = await axiosInstance.get(
//     `/all-games?is_mobile=1&limit=10&type=dice`
//   );
//   const data = response.data;
//   return Array.isArray(data.allGames) ? data.allGames : [];
// };

export const fetchDiceGames = async () => {
  const isMobileParam = getIsMobileParam(); // 1 or 0

  const response = await axiosInstance.get(
    `/all-games?is_mobile=${isMobileParam}&limit=10&customType=hot`
  );

  const data = response.data;
  return Array.isArray(data.allGames) ? data.allGames : [];
};

export const fetchSmartSoftGames = async () => {
  const isMobileParam = getIsMobileParam(); // 1 or 0
  const response = await axiosInstance.get(
    `/all-games?is_mobile=${isMobileParam}&limit=10&customType=slots`
  );
  const data = response.data;
  return Array.isArray(data.allGames) ? data.allGames : [];
};

export const fetchProviderList = async () => {
  const response = await axiosInstance.get(`/providers-list`);
  const data = response.data;

  if (Array.isArray(data.providers)) {
    return data.providers.slice(0, 10); // only first 10
  }
  return [];
};

export function getIsMobileParam(breakpoint = 768) {
  if (typeof window === "undefined") return 0; // SSR safety
  return window.innerWidth <= breakpoint ? 1 : 0;
}

//   const isMobileParam = getIsMobileParam();

// const response = await axiosInstance.get(
//   `/all-games?is_mobile=${isMobileParam}&page=${page}`
// );
