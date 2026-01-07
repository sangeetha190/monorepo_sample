// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import BASE_URL from "../API/api";

// // BASE URL — update based on your API setup=

// const fetchAllGames = async (page) => {
//   const response = await axios.get(
//     `${BASE_URL}/all-games?is_mobile=1&page=${page}`
//   );
//   return response.data;
// };

// const useAllGames = (page) => {
//   return useQuery({
//     queryKey: ["allGames", page], // unique key based on page
//     queryFn: () => fetchAllGames(page),
//     keepPreviousData: true, // important for pagination
//     staleTime: 1000 * 60 * 1, // 1 minute
//   });
// };

// export default useAllGames;

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getIsMobileParam } from "./homePageApi";
import BASE_URL from "../api/baseUrl";

const fetchAllGames = async (page) => {
  const isMobileParam = getIsMobileParam();

  const response = await axios.get(
    `${BASE_URL}/all-games?is_mobile=${isMobileParam}&page=${page}`
  );
  return response.data;
};

const useAllGames = (page, options = {}) => {
  return useQuery({
    queryKey: ["allGames", page],
    queryFn: () => fetchAllGames(page),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
    ...options, // <-- accepts enabled or other options
  });
};

export default useAllGames;
