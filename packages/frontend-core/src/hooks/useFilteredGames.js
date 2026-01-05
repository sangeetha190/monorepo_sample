import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "../API/api";
import { getIsMobileParam } from "./homePageApi";

const fetchFilteredGames = async ({ type, page }) => {
  let mergedGames = [];
  let totalPagesFetched = 1;
  const isMobileParam = getIsMobileParam();

  if (type === "all") {
    const res = await axios.get(
      `${BASE_URL}/all-games?is_mobile=1&page=${page}`
    );
    mergedGames = [...(res.data.allGames || [])];
    totalPagesFetched = res.data.pagination?.total_page || 1;
  } else {
    const res = await axios.get(
      `${BASE_URL}/all-games?is_mobile=${isMobileParam}&customType=${type}&page=${page}`
    );
    mergedGames = [...(res.data.allGames || [])];

    if (page === 1) {
      // manually merge static games if needed here
      mergedGames = [...mergedGames];
    }

    totalPagesFetched = res.data.pagination?.total_page || 1;
  }

  const uniqueGames = Array.from(
    new Map(mergedGames.map((game) => [game.name.toLowerCase(), game])).values()
  );

  return {
    games: uniqueGames,
    totalPages: totalPagesFetched,
  };
};

const useFilteredGames = ({ type, page, enabled }) => {
  return useQuery({
    queryKey: ["filteredGames", type, page],
    queryFn: () => fetchFilteredGames({ type, page }),
    enabled,
    keepPreviousData: true,
    staleTime: 1000 * 60, // 1 min
  });
};

export default useFilteredGames;
