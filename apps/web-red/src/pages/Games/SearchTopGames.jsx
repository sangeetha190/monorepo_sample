// import Sidebar from "./Header/Sidebar";
import Sidebar from "../Home/Components/Header/Sidebar";

import React, {useState, useEffect, useRef, useContext} from "react";
// import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import BASE_URL from "../../API/api";
import BASE_URL from "@core/api/api";
// import StickyHeader from "./Header/Header";
import StickyHeader from "../Home/Components/Header/Header";
// import Footer from "./footer/Footer";
import Footer from "../Home/Components/Footer/Footer";
import {toast, ToastContainer} from "react-toastify";
import {useNavigate, useLocation} from "react-router-dom";
import {motion} from "framer-motion";

// import axiosInstance from "../../API/axiosConfig";
import axiosInstance from "@core/api/axiosConfig";

// import {verifyToken} from "../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import Skeleton, {SkeletonTheme} from "react-loading-skeleton";
// import useAllGames from "../../hooks/useAllGames";
import useAllGames from "@core/hooks/useAllGames";
// import useFilteredGames from "../../hooks/useFilteredGames";
import useFilteredGames from "@core/hooks/useFilteredGames";
// import {getIsMobileParam} from "../../hooks/homePageApi";
import {getIsMobileParam} from "@core/hooks/homePageApi";

// import routes from "../routes/route";

const SearchTopGames = () => {
    // const [types, setTypes] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("all");
    const [showFullScreenGame, setShowFullScreenGame] = useState(false);
    const [selectedGameUrl, setSelectedGameUrl] = useState(null);
    const [isLaunchingGame, setIsLaunchingGame] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const iframeRef = useRef(null);
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    // const [searchResults, setSearchResults] = useState([]);
    const [isSearchMode, setIsSearchMode] = useState(false);

    const [searchByNameResults, setSearchByNameResults] = useState([]);
    const [searchByProviderResults, setSearchByProviderResults] = useState([]);

    const [searchLoading, setSearchLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const [searchPage, setSearchPage] = useState(1);

    const location = useLocation();
    const navigate = useNavigate();

    const {setProfile, fetchUser, user} = useContext(AuthContext);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {
        data: allGamesData,
        isLoading: isAllGamesLoading,
        isFetching: isAllGamesFetching,
        isError: isAllGamesError,
    } = useAllGames(page, {
        enabled: !isSearchMode && selectedType === "all",
    });

    const {
        data: filteredData,
        isLoading: isFilteredLoading,
        isFetching: isFilteredFetching,
        isError: isFilteredError,
    } = useFilteredGames({
        type: selectedType,
        page,
        enabled: !isSearchMode && selectedType !== "all", // only enabled for non-all types
    });

    useEffect(() => {
        if (!isSearchMode && selectedType !== "all" && filteredData) {
            const {games: fetchedGames, totalPages} = filteredData;

            if (page === 1) {
                setGames(fetchedGames);
            } else {
                setGames((prev) => {
                    const combined = [...prev, ...fetchedGames];
                    return Array.from(new Map(combined.map((game) => [game.name.toLowerCase(), game])).values());
                });
            }

            setTotalPages(totalPages);
            setHasMore(page < totalPages);
        }
    }, [filteredData, selectedType, isSearchMode, page]);
    // useEffect(() => {
    //   if (!isSearchMode && selectedType !== "all") {
    //     fetchFilteredGames(selectedType, page); // only for non-all types
    //   }
    // }, [page, selectedType, isSearchMode]);

    useEffect(() => {
        if (!allGamesData || selectedType !== "all" || isSearchMode) return;

        const newGames = allGamesData.allGames || [];

        // Fix: Set games immediately on page 1 even if not previously set
        const combinedGames = page === 1 ? newGames : [...games, ...newGames];

        const uniqueGames = Array.from(new Map(combinedGames.map((game) => [game.uuid, game])).values());

        setGames(uniqueGames);

        const totalPages = allGamesData.pagination?.total_page || 1;
        setTotalPages(totalPages);
    }, [allGamesData, selectedType, isSearchMode, page]);
    // console.log({
    //   selectedType,
    //   isSearchMode,
    //   isAllGamesLoading,
    //   isAllGamesFetching,
    //   allGamesFromAPI: allGamesData?.allGames?.length,
    //   gamesLength: games.length,
    // });
    // console.log("✅ Setting games from allGamesData", {
    //   allGames: allGamesData.allGames,
    //   selectedType,
    //   isSearchMode,
    //   page,
    // });
    // useEffect(() => {
    //   fetchGames(); // This should setGames(...)
    // }, []);
    useEffect(() => {
        const handleScroll = () => {
            const bottomReached =
                window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.scrollHeight;

            if (bottomReached && !isFetching) {
                if (isSearchMode && searchPage < totalPages) {
                    setSearchPage((prev) => prev + 1);
                } else if (!isSearchMode && page < totalPages) {
                    setPage((prev) => prev + 1);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isFetching, isSearchMode, page, searchPage, totalPages]);
    useEffect(() => {
        const term = searchTerm.trim();
        if (isSearchMode && term.length >= 3 && searchPage > 1) {
            handleAutoSearch(term, searchPage);
        }
    }, [searchPage]);
    useEffect(() => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }, [currentPage]);

    useEffect(() => {
        if (isSearchMode) {
            setPage(1); // ✅ reset page to 1 during search
        }
    }, [isSearchMode]);

    useEffect(() => {
        fetchAllGames();
    }, []);

    useEffect(() => {
        const fixedSearchTerm = searchTerm.trim();

        if (fixedSearchTerm.length < 3) {
            setIsSearchMode(false);
            setSearchByNameResults([]);
            setSearchByProviderResults([]);
            setSearchPage(1);
            return;
        }

        setIsSearchMode(true);
        setSearchPage(1);
        setHasMore(true); // ✅ reset so API can trigger again

        const delay = setTimeout(() => {
            handleAutoSearch(fixedSearchTerm, 1);
        }, 400);

        return () => clearTimeout(delay);
    }, [searchTerm]);

    // const handleTypeChange = (type) => {
    //   setGames([]);
    //   setPage(1);
    //   setHasMore(true); // 🟣 Important to reset for new type
    //   setSelectedType(type);
    //   setIsSearchMode(false);
    // };

    const handleTypeChange = async (type) => {
        setGames([]);
        setPage(1);
        setHasMore(true);
        setSelectedType(type);
        setIsSearchMode(false);

        // ✅ Refresh chips using verifyToken
        try {
            const res = await verifyToken();
            if (res?.user) {
                setProfile(res.user); // 🔁 Update chips in header
            }
        } catch (err) {
            console.error("Failed to refresh chips:", err);
        }
    };
    const fetchAllGames = async (page = 1) => {
        if (isFetching || !hasMore) return;

        try {
            setIsFetching(true);
            const isMobileParam = getIsMobileParam();

            const response = await axiosInstance.get(`/all-games?is_mobile=${isMobileParam}&page=${page}`);
            // const response = await axiosInstance.get(
            //   `/all-games?is_mobile=1&page=${page}`
            // );
            let newGames = response.data.allGames || [];

            // ✅ Add manual games only on page 1
            if (page === 1) {
                // newGames = [...manualAllGames, ...newGames];
                newGames = [...newGames];
            }

            const combinedGames = [...games, ...newGames];

            // ✅ Remove duplicates by uuid
            const uniqueGames = Array.from(new Map(combinedGames.map((game) => [game.uuid, game])).values());

            setGames(uniqueGames);
            // const totalPages = response.data.pagination?.total_page || 1;
            // setHasMore(page < totalPages);

            const totalPages = response.data.pagination?.total_page || 1;
            setTotalPages(totalPages); // update this state
        } catch (error) {
            console.error("Error fetching games:", error);
            toast.error("Failed to load games.");
        } finally {
            setIsFetching(false);
            setLoading(false);
        }
    };
    // const fetchFilteredGames = async (type, page = 1) => {
    //   try {
    //     setLoading(true);

    //     let mergedGames = [];

    //     let totalPagesFetched = 1;

    //     if (type === "all") {
    //       const res = await axios.get(
    //         `${BASE_URL}/all-games?is_mobile=1&page=${page}`
    //       );
    //       mergedGames = [...(res.data.allGames || [])];

    //       if (page === 1) {
    //         // mergedGames = [...manualAllGames, ...mergedGames];
    //         mergedGames = [...mergedGames];
    //       }

    //       totalPagesFetched = res.data.pagination?.total_page || 1;
    //     } else {
    //       const [res2] = await Promise.all([
    //         // axios.get(
    //         //   `${BASE_URL}/all-games?is_mobile=1&global=${type}&page=${page}`
    //         // ),
    //         axios.get(
    //           `${BASE_URL}/all-games?is_mobile=1&customType=${type}&page=${page}`
    //         ),
    //       ]);

    //       mergedGames = [
    //         // ...(res1.data.allGames || []),
    //         ...(res2.data.allGames || []),
    //       ];

    //       if (page === 1) {
    //         if (type === "card")
    //           // mergedGames = [...manualCardGames, ...mergedGames];
    //           mergedGames = [...mergedGames];
    //         if (type === "hot") mergedGames = [...mergedGames];
    //         // mergedGames = [...manualHotGames, ...mergedGames];
    //         if (type === "crash") mergedGames = [...mergedGames];
    //         // mergedGames = [...manualCrashGames, ...mergedGames];
    //         if (type === "table")
    //           // mergedGames = [...manualTableGames, ...mergedGames];
    //           mergedGames = [...mergedGames];
    //         if (type === "dice")
    //           // mergedGames = [...manualDiceGames, ...mergedGames];
    //           mergedGames = [...mergedGames];
    //         if (type === "blackjack")
    //           // mergedGames = [...manualBlackJackGames, ...mergedGames];
    //           mergedGames = [...mergedGames];
    //       }

    //       // 🟣 Use max from both responses to ensure pagination is handled properly
    //       totalPagesFetched = Math.max(
    //         // res1.data.pagination?.total_page || 1,
    //         res2.data.pagination?.total_page || 1
    //       );

    //       console.log("totalPagesFetched", totalPagesFetched);
    //     }

    //     setTotalPages(totalPagesFetched);
    //     setHasMore(page < totalPagesFetched); // ✅ FIX: Stop loading when last page is reached

    //     const uniqueGames = Array.from(
    //       new Map(
    //         mergedGames.map((game) => [game.name.toLowerCase(), game])
    //       ).values()
    //     );

    //     if (page === 1) {
    //       setGames(uniqueGames);
    //     } else {
    //       setGames((prevGames) => {
    //         const combined = [...prevGames, ...uniqueGames];
    //         return Array.from(
    //           new Map(
    //             combined.map((game) => [game.name.toLowerCase(), game])
    //           ).values()
    //         );
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error fetching games:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // const handleGameClick = async (game) => {
    //   if (!game.provider || !game.name || !game.uuid) {
    //     toast.error("Missing game info.");
    //     return;
    //   }

    //   const token = localStorage.getItem("token");

    //   try {
    //     setIsLaunchingGame(true);
    //     const isMobileParam = getIsMobileParam();

    //     const response = await axios.get(
    //       `${BASE_URL}/player/${game.provider}/launch/${encodeURIComponent(
    //         game.name
    //       )}/${game.uuid}`,

    //       {
    //         params: {
    //           // return_url: `${window.location.origin}/all-games?is_mobile=${isMobileParam}`,
    //           return_url: `${window.location.origin}/top-games`,
    //         },
    //         headers: { Authorization: `Bearer ${token}` },
    //       }
    //     );

    //     const gameUrl = response.data?.game?.gameUrl || response.data?.game_url;
    //     if (gameUrl) {
    //       // Store current location so user can return later
    //       sessionStorage.setItem("prevPage", location.pathname + location.search);

    //       // Push a new state so back button will return here
    //       window.history.pushState(
    //         { isGameOpen: true },
    //         "",
    //         window.location.href
    //       );

    //       setSelectedGameUrl(gameUrl);
    //       setShowFullScreenGame(true);
    //     } else {
    //       toast.error("Failed to get game URL.");
    //     }
    //   } catch (error) {
    //     setIsLaunchingGame(false);
    //     const errMsg = error.response?.data?.message;
    //     if (errMsg === "Unauthenticated." || error.response?.status === 401) {
    //       toast.error("Please login to jump into the Game World! 🎮🚀");
    //       localStorage.removeItem("token");
    //       setTimeout(() => navigate("/login"), 3000);
    //       return;
    //     }
    //     console.error("Error launching game:", error);
    //     // toast.error("Game launch failed. Try again later.");
    //     // 👇 Add onClose here:
    //     toast.error("Game launch failed. Try again later.", {
    //       toastId: "game-launch-failed",
    //       autoClose: 3000, // optional
    //       closeOnClick: true, // optional
    //       pauseOnHover: true, // optional
    //       onClose: () => {
    //         // runs if user clicks X OR after autoClose timeout
    //         navigate(location.pathname, { replace: true, state: {} });
    //       },
    //     });
    //   }
    // };
    useEffect(() => {
        const handlePopState = () => {
            if (showFullScreenGame) {
                setShowFullScreenGame(false);
                setSelectedGameUrl(null);
                setIsLaunchingGame(false); // ✅ Hide loader when going back

                // Navigate back to saved page (optional)
                const prevPage = sessionStorage.getItem("prevPage");
                if (prevPage) {
                    navigate(prevPage);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [showFullScreenGame, navigate]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fixedSearchTerm = searchTerm.trim();

        if (!fixedSearchTerm) return;

        const pageNo = 1; // ✅ Add this line

        try {
            setIsSearchMode(true);
            setSearchPage(1); // ✅ Reset searchPage so infinite scroll works correctly
            const isMobileParam = getIsMobileParam();

            const [res1, res2, res3] = await Promise.all([
                axios.get(`${BASE_URL}/all-games?is_mobile=${isMobileParam}&search=${fixedSearchTerm}&page=${pageNo}`),
                axios.get(
                    `${BASE_URL}/all-games?is_mobile=${isMobileParam}&provider=${fixedSearchTerm}&page=${pageNo}`
                ),
                axios.get(`${BASE_URL}/all-games?is_mobile=${isMobileParam}&type=${fixedSearchTerm}&page=${pageNo}`),
            ]);

            const mergedSearchResults = [...(res1.data.allGames || []), ...(res3.data.allGames || [])];

            const uniqueGames = Array.from(new Map(mergedSearchResults.map((game) => [game.uuid, game])).values());

            setSearchByNameResults(uniqueGames);
            setSearchByProviderResults(res2.data.allGames || []);
        } catch (error) {
            console.error("Error fetching game data:", error);
        }
    };

    // const handleAutoSearch = async (fixedSearchTerm, pageNo = 1) => {
    //   if (isFetching || !hasMore) return;

    //   try {
    //     setSearchLoading(true);
    //     setIsFetching(true);

    //     const [res1] = await Promise.all([
    //       axios.get(
    //         `${BASE_URL}/all-games?is_mobile=1&global=${fixedSearchTerm}&page=${pageNo}`
    //       ),
    //       // axios.get(
    //       //   `${BASE_URL}/all-games?is_mobile=1&provider=${fixedSearchTerm}&page=${pageNo}`
    //       // ),
    //       // axios.get(
    //       //   `${BASE_URL}/all-games?is_mobile=1&type=${fixedSearchTerm}&page=${pageNo}`
    //       // ),
    //     ]);

    //     let mergedSearchResults = [
    //       ...(res1.data.allGames || []),
    //       // ...(res3.data.allGames || []),
    //     ];

    //     const manualGamesMap = {
    //       card: manualCardGames,
    //       hot: manualHotGames,
    //       crash: manualCrashGames,
    //     };

    //     const lowerTerm = fixedSearchTerm.toLowerCase();
    //     if (manualGamesMap[lowerTerm] && pageNo === 1) {
    //       mergedSearchResults = [
    //         ...manualGamesMap[lowerTerm],
    //         ...mergedSearchResults,
    //       ];
    //     }

    //     const totalPages = Math.max(
    //       res1.data.pagination?.total_page || 1
    //       // res2.data.pagination?.total_page || 1,
    //       // res3.data.pagination?.total_page || 1
    //     );

    //     const newSearchGames = Array.from(
    //       new Map(mergedSearchResults.map((game) => [game.uuid, game])).values()
    //     );

    //     // ✅ FIX HERE: If pageNo === 1, reset. If not, append to existing results.
    //     if (pageNo === 1) {
    //       setSearchByNameResults(newSearchGames);
    //     } else {
    //       setSearchByNameResults((prev) => {
    //         const combined = [...prev, ...newSearchGames];
    //         return Array.from(new Map(combined.map((g) => [g.uuid, g])).values());
    //       });
    //     }

    //     // 📦 Provider results are not paginated, so only update on page 1
    //     // if (pageNo === 1) {
    //     //   setSearchByProviderResults(res2.data.allGames || []);
    //     // }

    //     setHasMore(pageNo < totalPages);
    //     setTotalPages(totalPages);
    //   } catch (error) {
    //     console.error("Search error:", error);
    //   } finally {
    //     setSearchLoading(false);
    //     setIsFetching(false);
    //   }
    // };

    // const testing = () => {
    //   console.log("hello Exit");
    // };
    // const BackButtonWithVerification = () => {
    // const navigate = useNavigate();

    const handleAutoSearch = async (fixedSearchTerm, pageNo = 1) => {
        if (isFetching || !hasMore) return;

        try {
            setSearchLoading(true);
            setIsFetching(true);
            const isMobileParam = getIsMobileParam();

            const response = await axios.get(
                `${BASE_URL}/all-games?is_mobile=${isMobileParam}&global=${fixedSearchTerm}&page=${pageNo}`
            );

            const apiGames = response.data.allGames || [];
            const totalPages = response.data.pagination?.total_page || 1;

            const newSearchGames = Array.from(new Map(apiGames.map((game) => [game.uuid, game])).values());

            if (pageNo === 1) {
                setSearchByNameResults(newSearchGames);
            } else {
                setSearchByNameResults((prev) => {
                    const combined = [...prev, ...newSearchGames];
                    return Array.from(new Map(combined.map((g) => [g.uuid, g])).values());
                });
            }

            setHasMore(pageNo < totalPages);
            setTotalPages(totalPages);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearchLoading(false);
            setIsFetching(false);
        }
    };

    // Assume isLoadingFilter is a boolean state, similar to isLoadingTypes
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);

    // You'd set isLoadingFilter to false once your filter data (if dynamic) or initial setup is complete.
    // For static filters, you might set it to false after a brief timeout or on component mount if desired,
    // or just omit the loading state if they're always immediately available.
    useEffect(() => {
        // Simulate data fetching or component readiness
        const timer = setTimeout(() => {
            setIsLoadingFilter(false);
        }, 1000); // Simulate a 1-second load time
        return () => clearTimeout(timer);
    }, []);

    // Add this state with your other state variables
    // const [showModal, setShowModal] = useState(false);

    // ... other code ...
    // 1) Verify token
    const currentToken = user?.token;
    // Define the handler functions
    // const handleConfirm = async () => {
    //   setShowModal(false);
    //   // Programmatically trigger the back action to close the game
    //   window.history.back();
    //   navigate("/all-games");
    //   // This will trigger your existing useEffect handlePopState logic
    //   // ✅ refresh profile so Header updates chips
    //   await fetchUser(currentToken);
    // };

    // const iframeRef = useRef(null);
    // const [iframeLoaded, setIframeLoaded] = useState(false);
    // const [iframeError, setIframeError] = useState(false);
    // const [isLaunchingGame, setIsLaunchingGame] = useState(true); // optional overlay

    // ... other state variables and handleCancel, handleConfirm ...

    // // Handle iframe load
    // const handleIframeLoad = () => {
    //   // Only set loaded state if the iframe is actually the game we want
    //   // You might want to check for the selectedGameUrl here too for robust logic.
    //   setIframeLoaded(true);
    //   // setIsLaunchingGame(false); // hide "Launching game..." overlay

    //   const el = iframeRef.current;
    //   if (!el) return;

    //   // ... (rest of handleIframeLoad logic, including cross-origin error handling) ...
    // };

    // const handleCancel = () => {
    //   setShowModal(false);
    // };

    /** ---------- Game launch + return flow ---------- */
    const RETURN_URL_KEY = "returnUrl";

    const navigateToSavedReturnUrl = React.useCallback(() => {
        const target = sessionStorage.getItem(RETURN_URL_KEY) || "/";
        const origin = window.location.origin;
        const toPath = target.startsWith(origin) ? target.slice(origin.length) : target;

        const here = window.location.pathname + window.location.search;
        const url = new URL(target, origin);
        const there = url.pathname + url.search;
        if (here === there) return;

        navigate(toPath, {replace: true});
    }, [navigate]);

    const buildReturnUrl = (location) => {
        const base = import.meta?.env?.BASE_URL || process.env.PUBLIC_URL || "";
        const baseTrim = base.replace(/\/$/, "");
        const path = `${baseTrim}${location.pathname}${location.search || ""}`;
        return new URL(path, window.location.origin).toString();
    };

    const [showModal, setShowModal] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    const handleConfirm = async () => {
        setShowModal(false);
        setIsLaunchingGame(false);
        setShowFullScreenGame(false);
        setSelectedGameUrl("");
        await fetchUser(user?.token);
        navigateToSavedReturnUrl();
    };

    const handleCancel = () => setShowModal(false);

    const handleIframeLoad = () => {
        setIframeLoaded(true);
        setIsLaunchingGame(false);

        const el = iframeRef.current;
        if (!el) return;

        try {
            const href = el.contentWindow.location.href;
            if (href.startsWith(window.location.origin)) {
                setShowFullScreenGame(false);
                setSelectedGameUrl("");
                setIframeError(false);
                setIframeLoaded(false);
                navigateToSavedReturnUrl();
            }
        } catch {
            // cross-origin; ignore
        }
    };

    useEffect(() => {
        const onPop = () => {
            setShowFullScreenGame(false);
            setSelectedGameUrl("");
            setIsLaunchingGame(false);
            navigateToSavedReturnUrl();
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [navigateToSavedReturnUrl]);

    const handleGameClick = async (game) => {
        if (!game?.provider || !game?.name || !game?.uuid) {
            toast.error("Missing game info.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to jump into the Game World! 🎮🚀");
            navigate("/login");
            return;
        }

        try {
            setIsLaunchingGame(true);
            const returnUrl = buildReturnUrl(location);
            sessionStorage.setItem(RETURN_URL_KEY, returnUrl);

            const response = await axios.get(
                `${BASE_URL}/player/${game.provider}/launch/${encodeURIComponent(game.name)}/${game.uuid}`,
                {
                    params: {
                        return_url: returnUrl,
                        ...(game.has_lobby !== undefined && {has_lobby: game.has_lobby}),
                        ...(game.has_tables !== undefined && {
                            has_tables: game.has_tables,
                        }),
                    },
                    headers: {Authorization: `Bearer ${token}`},
                }
            );

            const gameUrl = response?.data?.game?.gameUrl || response?.data?.game_url;
            if (gameUrl) {
                window.history.pushState({isGameOpen: true}, "", window.location.href);
                setSelectedGameUrl(gameUrl);
                setShowFullScreenGame(true);
            } else {
                setIsLaunchingGame(false);
                toast.error("Failed to get game URL.");
            }
        } catch (error) {
            setIsLaunchingGame(false);
            const errMsg = error.response?.data?.message;
            if (errMsg === "Unauthenticated." || error.response?.status === 401) {
                toast.error("Please login to jump into the Game World! 🎮🚀");
                localStorage.removeItem("token");
                setTimeout(() => navigate("/login"), 3000);
                return;
            }
            // console.error("Error launching game:", error);
            toast.error("Game launch failed. Try again later.");
        }
    };

    return (
        <>
            {isLaunchingGame && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    <div className="spinner-border text-light me-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    Launching game, please wait...
                </div>
            )}

            <ToastContainer position="top-right" autoClose={5000} theme="dark" closeButton={<MyClose />} />
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}

            <div className="container-fluid page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}
                <div className="main-panel overflow-hidden">
                    <div className="content-wrapper new">
                        <div className="max-1250 mx-auto ">
                            <div>
                                {showFullScreenGame && selectedGameUrl && (
                                    <div
                                        className="iframe-container"
                                        style={{
                                            position: "fixed",
                                            top: 0,
                                            left: 0,
                                            width: "100vw",
                                            height: "100vh",
                                            backgroundColor: "#000",
                                            zIndex: 9999,
                                            height: "100dvh",
                                        }}
                                    >
                                        {/* Navbar only appears if iframe loaded successfully */}
                                        {iframeLoaded && !iframeError && (
                                            <nav
                                                className="navbar  py-1 navbar-dark bg-black sticky-top shadow-sm d-flex align-items-center position-relative top-0 w-100"
                                                style={{height: "5%"}}
                                            >
                                                <div className="container-fluid d-flex align-items-center">
                                                    <button
                                                        className="btn  btn-index w-100 deposit-btn text-white py-2"
                                                        style={{background: "#292524"}}
                                                        onClick={() => setShowModal(true)}
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                            </nav>
                                        )}

                                        {/* Iframe or Error Message */}
                                        <div
                                            className="flex d-flex justify-content-center align-items-center "
                                            style={{height: "95%"}}
                                        >
                                            {!iframeError ? (
                                                <iframe
                                                    ref={iframeRef}
                                                    src={selectedGameUrl}
                                                    title="Game"
                                                    allowFullScreen
                                                    // onLoad={() => setIframeLoaded(true)}
                                                    onError={() => setIframeError(true)}
                                                    onLoad={handleIframeLoad}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        border: "none",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        fontSize: "1.5rem",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Game not visible
                                                </div>
                                            )}
                                        </div>

                                        {/* Modal */}
                                        {showModal && (
                                            <div
                                                className="modal-backdrop d-flex justify-content-center align-items-center"
                                                style={{
                                                    backgroundColor: "rgba(0,0,0,0.8)",
                                                    position: "fixed",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    zIndex: 99999,
                                                }}
                                            >
                                                <div
                                                    className="modal-dialog modal-dialog-centered m-2"
                                                    style={{maxWidth: "400px", color: "white"}}
                                                >
                                                    <div
                                                        className="modal-content text-center p-4"
                                                        style={{
                                                            borderRadius: "1rem",
                                                            background: "linear-gradient(145deg, #0f0f0f, #1a1a1a)",
                                                            border: "1px solid #ff0055",
                                                            boxShadow: "0 0 20px #ff0055ae",
                                                        }}
                                                    >
                                                        <div className="modal-header border-0 justify-content-end">
                                                            <button
                                                                type="button"
                                                                className="btn-close btn-close-white"
                                                                onClick={handleCancel}
                                                            />
                                                        </div>

                                                        <div className="modal-body">
                                                            <h5 className="modal-title fs-2 text-warning mb-3">
                                                                Go Back?
                                                            </h5>
                                                            <p className="fs-5 text-light">
                                                                Are you sure you want to leave this game?
                                                            </p>
                                                        </div>

                                                        <div className="modal-footer border-0 justify-content-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-index w-100 deposit-btn text-white py-2"
                                                                onClick={handleConfirm}
                                                            >
                                                                OK
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-index w-100 deposit-btn text-white py-2"
                                                                onClick={handleCancel}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* ) : ( */}
                                <>
                                    {/* 🔍 Search Bar */}
                                    <div className="search_container_box mx-2">
                                        <form className="form my-2" onSubmit={handleSubmit}>
                                            <button type="submit">
                                                <i className="ri-search-2-line fs-18" />
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Search games..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onInput={(e) => setSearchTerm(e.target.value)} // ✅ extra support for mobile
                                                className="my-3 input text-white"
                                            />
                                            {isSearchMode && (
                                                <button
                                                    type="button"
                                                    className="reset"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setSearchByNameResults([]); // ✅ Clear actual search result state
                                                        setSearchByProviderResults([]); // ✅ Clear provider results
                                                        setSearchPage(1); // ✅ Reset pagination
                                                        setIsSearchMode(false);
                                                        setHasMore(true); // ✅ Enable future searching
                                                    }}
                                                >
                                                    ❌
                                                </button>
                                            )}
                                        </form>
                                    </div>

                                    {/* 🔘 Filters */}
                                    {!isSearchMode && (
                                        <div
                                            ref={scrollRef}
                                            className="scroll-hide overflow-x-auto mt-2"
                                            style={{
                                                cursor: isDragging ? "grabbing" : "grab",
                                                overflowX: "auto",
                                            }}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleMouseUp}
                                            onMouseUp={handleMouseUp}
                                        >
                                            <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                                                <ul className="nav my-2 bonus_filter d-flex flex-nowrap bg-transparent">
                                                    {isLoadingFilter ? (
                                                        // Skeleton loading state for filter buttons
                                                        <>
                                                            {Array.from({length: 7}).map(
                                                                (
                                                                    _,
                                                                    index // Assuming 7 buttons in your list
                                                                ) => (
                                                                    <li
                                                                        className="nav-item"
                                                                        key={`filter-skeleton-${index}`}
                                                                    >
                                                                        <Skeleton
                                                                            width={120} // Approximate width of your buttons
                                                                            height={40} // Approximate height of your buttons
                                                                            style={{margin: "5px"}}
                                                                        />
                                                                    </li>
                                                                )
                                                            )}
                                                        </>
                                                    ) : (
                                                        // Actual filter buttons when loaded
                                                        <>
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "all" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("all");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "all" ? "blue" : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/all.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "20px"}}
                                                                    />{" "}
                                                                    All Games
                                                                </button>
                                                            </li>
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`d-flex align-items-center nav-link bg-transparent me-2 ${
                                                                        selectedType === "hot" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("hot");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "hot" ? "blue" : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/hot.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Hot Games
                                                                </button>
                                                            </li>
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "card" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("card");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "card" ? "blue" : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/black.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Live Casino
                                                                </button>
                                                            </li>
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "crash" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("crash");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "crash" ? "blue" : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/crash.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Crash Games
                                                                </button>
                                                            </li>
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "table" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("table");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "table" ? "blue" : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/table.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Table Games
                                                                </button>
                                                            </li>
                                                            {/* roulette */}
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "roulette" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("roulette");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "roulette"
                                                                                ? "blue"
                                                                                : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/roul.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Roulette
                                                                </button>
                                                            </li>
                                                            {/* baccarat */}
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "baccarat" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("baccarat");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "baccarat"
                                                                                ? "blue"
                                                                                : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/bac.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Baccarat
                                                                </button>
                                                            </li>
                                                            {/* blackjack */}
                                                            <li className="nav-item">
                                                                <button
                                                                    className={`nav-link bg-transparent ${
                                                                        selectedType === "blackjack" ? "active" : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        handleTypeChange("blackjack");
                                                                    }}
                                                                    style={{
                                                                        margin: "5px",
                                                                        padding: "10px",
                                                                        background:
                                                                            selectedType === "blackjack"
                                                                                ? "blue"
                                                                                : "gray",
                                                                        color: "white",
                                                                        border: "none",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <img
                                                                        src="/assets/img/icons/black.png"
                                                                        alt=""
                                                                        srcSet=""
                                                                        className="me-1"
                                                                        style={{width: "22px"}}
                                                                    />{" "}
                                                                    Blackjack
                                                                </button>
                                                            </li>
                                                        </>
                                                    )}
                                                </ul>
                                            </SkeletonTheme>
                                            <style jsx>{`
                                                .scroll-hide::-webkit-scrollbar {
                                                    display: none;
                                                }
                                                .scroll-hide {
                                                    -ms-overflow-style: none;
                                                    scrollbar-width: none;
                                                    white-space: nowrap;
                                                }
                                            `}</style>
                                        </div>
                                    )}

                                    {/* 🕹️ Game List */}
                                    {isSearchMode ? (
                                        <>
                                            {searchLoading && searchPage === 1 ? (
                                                <p className="text-white text-center mt-5">🎮 Loading games...</p>
                                            ) : (
                                                <>
                                                    {searchByNameResults.length > 0 ||
                                                    searchByProviderResults.length > 0 ? (
                                                        <>
                                                            {/* 🔍 Search by Game Name Section */}
                                                            {searchByNameResults.length > 0 && (
                                                                <>
                                                                    <h5 className="text-white mt-4">
                                                                        Search by Game Name
                                                                    </h5>
                                                                    <div className="row px-3">
                                                                        {searchByNameResults.map((game, index) => (
                                                                            <motion.div
                                                                                className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6  px-1"
                                                                                key={game.uuid}
                                                                                initial={{opacity: 0, scale: 0.8}}
                                                                                animate={{opacity: 1, scale: 1}}
                                                                                transition={{
                                                                                    duration: 0.3,
                                                                                    delay: index * 0.002,
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                                                                                    onClick={() =>
                                                                                        handleGameClick(game)
                                                                                    }
                                                                                >
                                                                                    <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                                                                        <img
                                                                                            src={
                                                                                                game.image ||
                                                                                                "/assets/img/placeholder.png"
                                                                                            }
                                                                                            className="game-card-img"
                                                                                            alt={game.name}
                                                                                        />
                                                                                        {/* <div className="d-flex flex-column text-white text-center py-2 px-1">
                                        <span className="fs-12 fw-bold text-truncate">
                                          {game.name}
                                        </span>
                                      </div> */}
                                                                                    </div>
                                                                                    <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                                                                        <i className="fa-solid fa-play"></i>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* ✅ Provider section shown ONLY on first search page */}
                                                            {searchPage === 1 && searchByProviderResults.length > 0 && (
                                                                <>
                                                                    <h5 className="text-white mt-6">
                                                                        Search by Provider
                                                                    </h5>
                                                                    <div className="row">
                                                                        {searchByProviderResults.map((game, index) => (
                                                                            <motion.div
                                                                                className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6  px-1"
                                                                                key={game.uuid}
                                                                                initial={{
                                                                                    opacity: 0,
                                                                                    scale: 0.8,
                                                                                }}
                                                                                animate={{opacity: 1, scale: 1}}
                                                                                transition={{
                                                                                    duration: 0.3,
                                                                                    delay: index * 0.002,
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                                                                                    onClick={() =>
                                                                                        handleGameClick(game)
                                                                                    }
                                                                                >
                                                                                    <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                                                                        <img
                                                                                            src={
                                                                                                game.image ||
                                                                                                "/assets/img/placeholder.png"
                                                                                            }
                                                                                            className="game-card-img"
                                                                                            alt={game.name}
                                                                                        />
                                                                                        {/* <div className="d-flex flex-column text-white text-center py-2 px-1">
                                          <span className="fs-12 fw-bold text-truncate">
                                            {game.name}
                                          </span>
                                        </div> */}
                                                                                    </div>
                                                                                    <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                                                                        <i className="fa-solid fa-play"></i>
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : searchLoading && searchPage === 1 ? (
                                                        <p className="text-white text-center mt-5">
                                                            🎮 Loading games...
                                                        </p>
                                                    ) : (
                                                        <p className="text-center text-gray-400 mt-4">
                                                            No results found.
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* {isAllGamesLoading ? (
                          <p>Loading...</p>
                        ) : games.length > 0 ? (
                          <>
                            <div className="row">
                              {games.map((game, index) => (
                                <div key={index}>{game.name}</div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p>No games found</p>
                        )} */}
                                            <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                                                <h5>Filtered Games</h5>
                                                <div className="px-2">
                                                    {loading && page === 1 ? (
                                                        // Skeleton loader for the first page
                                                        <div className="row px-8leftright">
                                                            {Array.from({length: 6}).map((_, index) => (
                                                                <div
                                                                    className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                                                                    key={index}
                                                                >
                                                                    <div className="game-card-wrapper rounded-2 new-cardclr mt-2">
                                                                        <Skeleton height={112} borderRadius={10} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="row px-8leftright">
                                                                {games.map((game, index) => (
                                                                    <motion.div
                                                                        className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                                                                        key={game.uuid || game.name + index}
                                                                        initial={{opacity: 0, scale: 0.8}}
                                                                        animate={{opacity: 1, scale: 1}}
                                                                        transition={{
                                                                            duration: 0.3,
                                                                            delay: index * 0.002,
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                                                                            onClick={() => handleGameClick(game)}
                                                                        >
                                                                            <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                                                                <img
                                                                                    src={
                                                                                        game.image ||
                                                                                        "/assets/img/placeholder.png"
                                                                                    }
                                                                                    className="w-100 m-0"
                                                                                    alt={game.name}
                                                                                />
                                                                            </div>
                                                                            <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                                                                <i className="fa-solid fa-play"></i>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </div>

                                                            {/* Show loading while fetching more */}
                                                            {isFetching && (
                                                                <p className="text-white text-center mt-3">
                                                                    Loading more games...
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </SkeletonTheme>

                                            {/* {!loading && totalPages > 1 && (
                  <PaginatedData
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                )} */}
                                        </>
                                    )}
                                </>
                            </div>

                            {/* {games.map((game, index) => (
                <motion.div
                  className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                  key={game.uuid || game.name + index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.002,
                  }}
                >
                  <div
                    className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                    onClick={() => handleGameClick(game)}
                  >
                    <div className="game-card position-relative p-0 m-0 overflow-hidden">
                      <img
                        src={game.image || "/assets/img/placeholder.png"}
                        className="w-100 m-0"
                        alt={game.name}
                      />
                    </div>
                    <div className="btn-play position-absolute top-50 start-50 translate-middle">
                      <i className="fa-solid fa-play"></i>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isAllGamesLoading || isAllGamesFetching ? (
                // <LoadingSkeletonCard />
                <h2>ddd</h2>
              ) : games.length === 0 ? (
                <p>No games found.</p>
              ) : (
                <h4>test</h4>
              )} */}
                            <div style={{marginTop: "100px"}}></div>
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchTopGames;
const MyClose = ({closeToast}) => (
    <button onClick={closeToast} className="toaster_close_btn">
        ×
    </button>
);
