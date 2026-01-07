import React, { useEffect, useState, useRef, useContext } from "react";
import {
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import BASE_URL from "@core/api/baseUrl";
import { toast, ToastContainer } from "react-toastify";

// import Footer from "./footer/Footer";

import Sidebar from "../Home/Components/Header/Sidebar";
import StickyHeader from "../Home/Components/Header/Header";
import { motion } from "framer-motion";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import { getIsMobileParam } from "@core/hooks/homePageApi";
import { fetchSearchGames } from "@core/hooks/filteredGames";
import AuthContext from "@core/auth/AuthContext";

import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";


const FilteredGamesPage = () => {
  const [games, setGames] = useState([]);
  const [filterType, setFilterType] = useState(null);

  const [selectedGameUrl, setSelectedGameUrl] = useState(null);
  const [showFullScreenGame, setShowFullScreenGame] = useState(false);
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);
  const iframeRef = useRef(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // ---- SEARCH STATE ----
  const [searchByNameResults, setSearchByNameResults] = useState([]);
  const [searchByProviderResults, setSearchByProviderResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  // ---- FILTERED (PAGINATION) STATE ----
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const { fetchUser, user } = useContext(AuthContext);

  /** ---------- FILTERED (non-search) ---------- */
  const getFilteredGames = async (customType, pageNum = 1, limit = 30) => {
    const isMobile = getIsMobileParam(); // 1 or 0
    const { data } = await axios.get(`${BASE_URL}/all-games`, {
      params: { is_mobile: String(isMobile), customType, page: pageNum, limit },
    });
    const items = Array.isArray(data?.allGames) ? data.allGames : [];
    const tp =
      data?.pagination?.total_page || data?.pagination?.total_pages || 1;
    return { items, totalPages: tp };
  };

  /** ---------- SEARCH (server pagination) ---------- */
  const fixed = searchTerm.trim();
  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    queryKey: ["searchGames", { term: fixed, page: searchPage, limit: 30 }],
    queryFn: () =>
      fetchSearchGames({ term: fixed, page: searchPage, limit: 30 }),
    enabled: isSearchMode && fixed.length >= 3,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Merge paginated search results into local state (dedupe by uuid)
  useEffect(() => {
    if (!isSearchMode || !searchData) return;

    const { items = [], byProvider = [], totalPages: tp = 1 } = searchData;

    if (searchPage === 1) {
      setSearchByNameResults(items);
      setSearchByProviderResults(byProvider);
    } else {
      setSearchByNameResults((prev) => {
        const combined = [...prev, ...items];
        return Array.from(new Map(combined.map((g) => [g.uuid, g])).values());
      });
    }

    setTotalPages(tp);
    setHasMore(searchPage < tp);
  }, [searchData, isSearchMode, searchPage]);

  /** ---------- URL bootstrap ---------- */
  useEffect(() => {
    const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
    const urlProvider = searchParams.get("provider") || "";
    const urlType = searchParams.get("type") || "";

    if (urlType) {
      setFilterType(urlType);
      setIsSearchMode(false);
      setPage(1);
      setGames([]);
    } else if (urlSearch || urlProvider) {
      const term = urlSearch || urlProvider;
      setSearchTerm(term);
      setIsSearchMode(true);
      setSearchPage(1);
      setHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- Filtered list query (single instance) ---------- */
  const {
    data: filteredData,
    isLoading: isRQLoading,
    isFetching: isRQFetching,
  } = useQuery({
    queryKey: ["filteredGames", { type: filterType || "all", page, limit: 30 }],
    queryFn: () => getFilteredGames(filterType, page, 30),
    enabled: !isSearchMode,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Accumulate pages of filtered list
  useEffect(() => {
    if (!filteredData || isSearchMode) return;

    setTotalPages(filteredData.totalPages);
    setHasMore(page < filteredData.totalPages);

    setGames((prev) => {
      if (page === 1) return filteredData.items;
      const combined = [...prev, ...filteredData.items];
      return Array.from(new Map(combined.map((g) => [g.uuid, g])).values());
    });
  }, [filteredData, page, isSearchMode]);

  const loading = isRQLoading && page === 1;

  /** ---------- Search box handlers ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    const fixedSearchTerm = searchTerm.trim();
    if (!fixedSearchTerm) return;
    setIsSearchMode(true);
  };

  useEffect(() => {
    const s = searchTerm.trim();
    if (s.length < 3) {
      setIsSearchMode(false);
      setSearchByNameResults([]);
      setSearchByProviderResults([]);
      setSearchPage(1);
      return;
    }
    setIsSearchMode(true);
    setSearchPage(1);
    setHasMore(true);
  }, [searchTerm]);

  /** ---------- Infinite scroll (single guarded trigger) ---------- */
  useEffect(() => {
    const onScroll = () => {
      const bottomReached =
        window.innerHeight + document.documentElement.scrollTop + 300 >=
        document.documentElement.scrollHeight;

      if (!bottomReached) return;

      const loadingNow = isSearchMode ? isSearchFetching : isRQFetching;
      if (loadingNow) return;

      if (isSearchMode) {
        if (searchPage < totalPages) setSearchPage((p) => p + 1);
      } else {
        if (page < totalPages) setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [
    isSearchMode,
    searchPage,
    page,
    totalPages,
    isSearchFetching,
    isRQFetching,
  ]);

  /** ---------- React to ?type= change ---------- */
  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setFilterType(type);
      setPage(1);
      setHasMore(true);
      setGames([]);
    }
  }, [searchParams]);

  /** ---------- Game launch + return flow ---------- */
  const RETURN_URL_KEY = "returnUrl";

  const navigateToSavedReturnUrl = React.useCallback(() => {
    const target = sessionStorage.getItem(RETURN_URL_KEY) || "/";
    const origin = window.location.origin;
    const toPath = target.startsWith(origin)
      ? target.slice(origin.length)
      : target;

    const here = window.location.pathname + window.location.search;
    const url = new URL(target, origin);
    const there = url.pathname + url.search;
    if (here === there) return;

    navigate(toPath, { replace: true });
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
        `${BASE_URL}/player/${game.provider}/launch/${encodeURIComponent(
          game.name
        )}/${game.uuid}`,
        {
          params: {
            return_url: returnUrl,
            ...(game.has_lobby !== undefined && { has_lobby: game.has_lobby }),
            ...(game.has_tables !== undefined && {
              has_tables: game.has_tables,
            }),
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const gameUrl = response?.data?.game?.gameUrl || response?.data?.game_url;
      if (gameUrl) {
        window.history.pushState(
          { isGameOpen: true },
          "",
          window.location.href
        );
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

  /** ---------- Render ---------- */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      <ToastContainer position="top-right" autoClose={5000} theme="dark" />

      <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="container-fluid page-body-wrapper">
        <Sidebar />

        <div className="main-panel">
          <div className="content-wrapper new">
            <div className="max-1250 mx-auto">
              {/* Search Bar */}
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
                    onInput={(e) => setSearchTerm(e.target.value)}
                    className="my-3 input text-white"
                  />

                  {isSearchMode && (
                    <button
                      type="button"
                      className="reset"
                      onClick={() => {
                        setSearchTerm("");
                        setSearchByNameResults([]);
                        setSearchByProviderResults([]);
                        setSearchPage(1);
                        setIsSearchMode(false);
                        setHasMore(true);
                      }}
                    >
                      ❌
                    </button>
                  )}
                </form>
              </div>

              {/* Lists */}
              {isSearchMode ? (
                <div className="px-2">
                  {searchLoading && searchPage === 1 ? (
                    <p className="text-white text-center mt-5">
                      🎮 Loading games...
                    </p>
                  ) : searchByNameResults.length > 0 ||
                    searchByProviderResults.length > 0 ? (
                    <>
                      {searchByNameResults.length > 0 && (
                        <>
                          <h5 className="text-white mt-4">
                            Search by Game Name
                          </h5>
                          <div className="row px-8leftright">
                            {searchByNameResults.map((game, index) => (
                              <motion.div
                                className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                                key={game.uuid}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.002,
                                }}
                                onClick={() => handleGameClick(game)}
                              >
                                <div className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group">
                                  <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                    <img
                                      src={
                                        game.image || "/assets/img/play_now.png"
                                      }
                                      className="game-card-img"
                                      alt={game.name}
                                    />
                                  </div>
                                  <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                    <i className="fa-solid fa-play" />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}

                      {searchPage === 1 &&
                        searchByProviderResults.length > 0 && (
                          <>
                            <h5 className="text-white mt-6">
                              Search by Provider
                            </h5>
                            <div className="row">
                              {searchByProviderResults.map((game, index) => (
                                <motion.div
                                  className="col-md-4 col-sm-4 col-6 px-1"
                                  key={game.uuid}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: index * 0.002,
                                  }}
                                  onClick={() => handleGameClick(game)}
                                >
                                  <div className="game-card-wrapper rounded-2 new-cardclr mt-2">
                                    <div className="game-card p-0 m-0 p-1">
                                      <img
                                        src={
                                          game.image ||
                                          "/assets/img/play_now.png"
                                        }
                                        className="game-card-img"
                                        alt={game.name}
                                      />
                                      <div className="d-flex flex-column text-white text-center py-2 px-1">
                                        <span className="fs-12 fw-bold text-truncate">
                                          {game.name}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="game-play-button d-flex flex-column">
                                      <div className="btn-play">
                                        <i className="fa-solid fa-play" />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </>
                        )}
                    </>
                  ) : fixed.length >= 3 && !searchLoading ? (
                    <p className="text-center text-gray-400 mt-4">
                      No results found.
                    </p>
                  ) : null}
                </div>
              ) : (
                <SkeletonTheme baseColor="#313131" highlightColor="#525252">
                  <div className="game-list px-2 container">
                    <h5 className="text-white text-capitalize my-2">
                      {filterType
                        ? filterType === "card"
                          ? "Live Casino"
                          : `${filterType} Games`
                        : "Games"}
                    </h5>

                    <div className="row px-8leftright">
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <div
                            className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                            key={index}
                          >
                            <div className="game-card-wrapper rounded-2 new-cardclr mt-2">
                              <Skeleton height={140} borderRadius={10} />
                              <div className="mt-2 px-1">
                                <Skeleton height={12} width="80%" />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : games.length > 0 ? (
                        games
                          .filter((g) => g.image)
                          .map((game) => (
                            <div
                              className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                              key={game.uuid}
                              onClick={() => handleGameClick(game)}
                            >
                              <div className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group">
                                <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                  <img
                                    src={game.image}
                                    className="game-card-img"
                                    alt={game.name}
                                  />
                                </div>
                                <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                  <i className="fa-solid fa-play" />
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="d-flex flex-column align-items-center mt-5">
                          <img
                            src="assets/img/notification/img_2.png"
                            alt="unauth"
                            className="w-25"
                          />
                          <p className="text-white text-center">
                            No games available.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </SkeletonTheme>
              )}
            </div>

            {/* Fullscreen iframe overlay */}
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
                {iframeLoaded && !iframeError && (
                  <nav
                    className="navbar py-1 navbar-dark bg-black sticky-top shadow-sm d-flex align-items-center position-relative top-0 justify-content-end"
                    style={{ height: "5%" }}
                  >
                    <div className="container-fluid d-flex align-items-center">
                      <button
                        className="btn btn-index w-100 deposit-btn text-white py-2"
                        style={{ background: "#292524" }}
                        onClick={() => setShowModal(true)}
                      >
                        Back
                      </button>
                    </div>
                  </nav>
                )}

                <div
                  className="flex-grow-1 d-flex justify-content-center align-items-center"
                  style={{ height: "95%" }}
                >
                  {!iframeError ? (
                    <iframe
                      ref={iframeRef}
                      src={selectedGameUrl}
                      title="Game"
                      allowFullScreen
                      onError={() => setIframeError(true)}
                      onLoad={handleIframeLoad}
                      style={{ width: "100%", height: "100%", border: "none" }}
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
                      style={{ maxWidth: "400px", color: "white" }}
                    >
                      <div
                        className="modal-content text-center p-4"
                        style={{
                          borderRadius: "1rem",
                          background:
                            "linear-gradient(145deg, #0f0f0f, #1a1a1a)",
                          border: "1px solid #ff0055",
                          boxShadow: "0 0 20px #ff0055ae",
                        }}
                      >
                        <div className="modal-header border-0 justify-content-end">
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={() => setShowModal(false)}
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
                            onClick={() => setShowModal(false)}
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
            <div style={{ marginTop: "100px" }} />
            {/* <Footer /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilteredGamesPage;
