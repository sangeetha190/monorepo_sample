import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

// ✅ core package imports (adjust paths if your folders are different)
import axiosInstance from "../../api/axiosConfig";
// import BASE_URL from "../../api/baseUrl"; // <-- if your file name differs, change this
import { verifyToken } from "../../api/authAPI";
import AuthContext from "../../auth/AuthContext";

import useAllGames from "../../hooks/useAllGames";
import useFilteredGames from "../../hooks/useFilteredGames";
import { getIsMobileParam } from "../../hooks/homePageApi";
import BASE_URL from "../../api/baseUrl";

const AllGamesView = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState("all");

  const [showFullScreenGame, setShowFullScreenGame] = useState(false);
  const [selectedGameUrl, setSelectedGameUrl] = useState(null);
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [searchByNameResults, setSearchByNameResults] = useState([]);
  const [searchByProviderResults, setSearchByProviderResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const iframeRef = useRef(null);
  const scrollRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { setProfile, fetchUser, user } = useContext(AuthContext);

  // ✅ query hooks (already in core)
//   const { data: allGamesData } = useAllGames(page, {
//     enabled: !isSearchMode && selectedType === "all",
//   });

//   const { data: filteredData } = useFilteredGames({
//     type: selectedType,
//     page,
//     enabled: !isSearchMode && selectedType !== "all",
//   });


const {
  data: allGamesData,
  isLoading: isAllGamesLoading,
  isFetching: isAllGamesFetching,
} = useAllGames(page, { enabled: !isSearchMode && selectedType === "all" });

const {
  data: filteredData,
  isLoading: isFilteredLoading,
  isFetching: isFilteredFetching,
} = useFilteredGames({
  type: selectedType,
  page,
  enabled: !isSearchMode && selectedType !== "all",
});

const isPageLoading =
  (selectedType === "all" ? isAllGamesLoading || isAllGamesFetching : isFilteredLoading || isFilteredFetching)
  && page === 1;
  // ✅ apply filtered results
  useEffect(() => {
    if (!isSearchMode && selectedType !== "all" && filteredData) {
      const { games: fetchedGames, totalPages } = filteredData;

      console.log(fetchedGames);
      
      if (page === 1) setGames(fetchedGames);

      
      else {
        setGames((prev) => {
          const combined = [...prev, ...fetchedGames];
          return Array.from(
            new Map(combined.map((g) => [g.name.toLowerCase(), g])).values()
          );
        });
      }

      setTotalPages(totalPages);
      setHasMore(page < totalPages);
    }
  }, [filteredData, selectedType, isSearchMode, page]);

  // ✅ apply all games results
  useEffect(() => {
    if (!allGamesData || selectedType !== "all" || isSearchMode) return;

    const newGames = allGamesData.allGames || [];
    const combined = page === 1 ? newGames : [...games, ...newGames];

    const uniqueGames = Array.from(
      new Map(combined.map((g) => [g.uuid, g])).values()
    );

    setGames(uniqueGames);

    const tp = allGamesData.pagination?.total_page || 1;
    setTotalPages(tp);
  }, [allGamesData, selectedType, isSearchMode, page]);

  // ✅ infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached =
        window.innerHeight + document.documentElement.scrollTop + 300 >=
        document.documentElement.scrollHeight;

      if (!bottomReached || isFetching) return;

      if (isSearchMode && searchPage < totalPages) setSearchPage((p) => p + 1);
      else if (!isSearchMode && page < totalPages) setPage((p) => p + 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, isSearchMode, page, searchPage, totalPages]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (isSearchMode && term.length >= 3 && searchPage > 1) {
      handleAutoSearch(term, searchPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPage]);

  // ✅ search term watcher
  useEffect(() => {
    const t = searchTerm.trim();

    if (t.length < 3) {
      setIsSearchMode(false);
      setSearchByNameResults([]);
      setSearchByProviderResults([]);
      setSearchPage(1);
      return;
    }

    setIsSearchMode(true);
    setSearchPage(1);
    setHasMore(true);

    const delay = setTimeout(() => handleAutoSearch(t, 1), 400);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // ✅ (optional) used by your old code
  const fetchAllGames = async (pageNo = 1) => {
    if (isFetching || !hasMore) return;

    try {
      setIsFetching(true);
      const isMobileParam = getIsMobileParam();

      const response = await axiosInstance.get(
        `/all-games?is_mobile=${isMobileParam}&page=${pageNo}`
      );

      const newGames = response.data.allGames || [];
      const combined = pageNo === 1 ? newGames : [...games, ...newGames];

      const uniqueGames = Array.from(
        new Map(combined.map((g) => [g.uuid, g])).values()
      );

      setGames(uniqueGames);

      const tp = response.data.pagination?.total_page || 1;
      setTotalPages(tp);
      setHasMore(pageNo < tp);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load games.");
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  // ✅ type change
  const handleTypeChange = async (type) => {
    setGames([]);
    setPage(1);
    setHasMore(true);
    setSelectedType(type);
    setIsSearchMode(false);

    // refresh header chips (user balance etc.)
    try {
      const res = await verifyToken();
      if (res?.user) setProfile(res.user);
    } catch (e) {
      console.error("Failed to refresh chips:", e);
    }
  };

  // ✅ submit search (same as your code)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fixedSearchTerm = searchTerm.trim();
    if (!fixedSearchTerm) return;

    const pageNo = 1;
    try {
      setIsSearchMode(true);
      setSearchPage(1);
      const isMobileParam = getIsMobileParam();

      const [res1, res2, res3] = await Promise.all([
        axios.get(
          `${BASE_URL}/all-games?is_mobile=${isMobileParam}&search=${fixedSearchTerm}&page=${pageNo}`
        ),
        axios.get(
          `${BASE_URL}/all-games?is_mobile=${isMobileParam}&provider=${fixedSearchTerm}&page=${pageNo}`
        ),
        axios.get(
          `${BASE_URL}/all-games?is_mobile=${isMobileParam}&type=${fixedSearchTerm}&page=${pageNo}`
        ),
      ]);

      const merged = [...(res1.data.allGames || []), ...(res3.data.allGames || [])];
      const unique = Array.from(new Map(merged.map((g) => [g.uuid, g])).values());

      setSearchByNameResults(unique);
      setSearchByProviderResults(res2.data.allGames || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ auto search (global)
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
      const tp = response.data.pagination?.total_page || 1;

      const newGames = Array.from(
        new Map(apiGames.map((g) => [g.uuid, g])).values()
      );

      if (pageNo === 1) setSearchByNameResults(newGames);
      else {
        setSearchByNameResults((prev) => {
          const combined = [...prev, ...newGames];
          return Array.from(new Map(combined.map((g) => [g.uuid, g])).values());
        });
      }

      setHasMore(pageNo < tp);
      setTotalPages(tp);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
      setIsFetching(false);
    }
  };

  // ✅ filter scroll drag
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

  const handleMouseUp = () => setIsDragging(false);

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

    navigate(toPath, { replace: true });
  }, [navigate]);

  const buildReturnUrl = (loc) => {
  return new URL(`${loc.pathname}${loc.search || ""}`, window.location.origin).toString();
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
  const provider = game?.provider || game?.provider_name || game?.vendor;
  const uuid = game?.uuid || game?.game_uuid || game?.id;
  const name = game?.name || game?.game_name;

  if (!provider || !uuid || !name) {
    toast.error("Missing game info.");
    return;
  }

  const token =
    user?.token ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!token) {
    toast.error("Please login to jump into the Game World! 🎮🚀");
    navigate("/login");
    return;
  }

  try {
    setIsLaunchingGame(true);

    const returnUrl = buildReturnUrl(location);
    sessionStorage.setItem(RETURN_URL_KEY, returnUrl);

    const response = await axiosInstance.get(
      `/player/${encodeURIComponent(provider)}/launch/${encodeURIComponent(name)}/${uuid}`,
      {
        params: { return_url: returnUrl },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = response?.data;
    const gameUrl = data?.game?.gameUrl || data?.gameUrl || data?.game_url;

    if (!gameUrl) {
      toast.error("Failed to get game URL.");
      setIsLaunchingGame(false);
      return;
    }

    setSelectedGameUrl(gameUrl);
    setShowFullScreenGame(true);
  } catch (error) {
    setIsLaunchingGame(false);
    toast.error(error?.response?.data?.message || error?.message || "Game launch failed.");
  }
};



  // ✅ filter skeleton (keep same)
  const [isLoadingFilter, setIsLoadingFilter] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingFilter(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loader overlay */}
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

      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="dark"
        closeButton={<MyClose />}
      />

      {/* ✅ ONLY the page content here (no Header/Sidebar/Footer in core) */}
      <div className="max-1250 mx-auto">
        {showFullScreenGame && selectedGameUrl && (
          <div
            className="iframe-container"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              backgroundColor: "#000",
              zIndex: 9999,
              height: "100dvh",
            }}
          >
            {iframeLoaded && !iframeError && (
              <nav
                className="navbar py-1 navbar-dark bg-black sticky-top shadow-sm d-flex align-items-center position-relative top-0 w-100"
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
              className="flex d-flex justify-content-center align-items-center"
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
                <div style={{ color: "red", fontSize: "1.5rem", textAlign: "center" }}>
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
                <div className="modal-dialog modal-dialog-centered m-2" style={{ maxWidth: 400, color: "white" }}>
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
                      <button type="button" className="btn-close btn-close-white" onClick={handleCancel} />
                    </div>

                    <div className="modal-body">
                      <h5 className="modal-title fs-2 text-warning mb-3">Go Back?</h5>
                      <p className="fs-5 text-light">Are you sure you want to leave this game?</p>
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

        {/* Search */}
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

        {/* Filters */}
        {!isSearchMode && (
          <div
            ref={scrollRef}
            className="scroll-hide overflow-x-auto mt-2"
            style={{ cursor: isDragging ? "grabbing" : "grab", overflowX: "auto" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
          >
            <SkeletonTheme baseColor="#313131" highlightColor="#525252">
              <ul className="nav my-2 bonus_filter d-flex flex-nowrap bg-transparent">
                {isLoadingFilter ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <li className="nav-item" key={`filter-skeleton-${i}`}>
                      <Skeleton width={120} height={40} style={{ margin: 5 }} />
                    </li>
                  ))
                ) : (
                  <>
                    {[
                      { key: "all", label: "All Games", icon: "/assets/img/icons/all.png" },
                      { key: "hot", label: "Hot Games", icon: "/assets/img/icons/hot.png" },
                      { key: "card", label: "Live Casino", icon: "/assets/img/icons/black.png" },
                      { key: "crash", label: "Crash Games", icon: "/assets/img/icons/crash.png" },
                      { key: "table", label: "Table Games", icon: "/assets/img/icons/table.png" },
                      { key: "roulette", label: "Roulette", icon: "/assets/img/icons/roul.png" },
                      { key: "baccarat", label: "Baccarat", icon: "/assets/img/icons/bac.png" },
                      { key: "blackjack", label: "Blackjack", icon: "/assets/img/icons/black.png" },
                    ].map((t) => (
                      <li className="nav-item" key={t.key}>
                        <button
                          className={`nav-link bg-transparent ${selectedType === t.key ? "active" : ""}`}
                          onClick={() => handleTypeChange(t.key)}
                          style={{
                            margin: 5,
                            padding: 10,
                            background: selectedType === t.key ? "blue" : "gray",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <img src={t.icon} alt="" className="me-1" style={{ width: 22 }} /> {t.label}
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </SkeletonTheme>

            <style>
            {`
              .scroll-hide::-webkit-scrollbar {
                display: none;
              }
              .scroll-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
                white-space: nowrap;
              }
            `}
            </style>
          </div>
        )}

        {/* Games list */}
        {isSearchMode ? (
          <>
            {searchLoading && searchPage === 1 ? (
              <p className="text-white text-center mt-5">🎮 Loading games...</p>
            ) : (
              <>
                {searchByNameResults.length > 0 || searchByProviderResults.length > 0 ? (
                  <>
                    {searchByNameResults.length > 0 && (
                      <>
                        <h5 className="text-white mt-4">Search by Game Name</h5>
                        <div className="row px-3">
                          {searchByNameResults.map((game, index) => (
                            <motion.div
                              className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1"
                              key={game.uuid}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.002 }}
                            >
                              <div
                                className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                                onClick={() => handleGameClick(game)}
                              >
                                <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                  <img
                                    src={game.image || "/assets/img/placeholder.png"}
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

                    {searchPage === 1 && searchByProviderResults.length > 0 && (
                      <>
                        <h5 className="text-white mt-6">Search by Provider</h5>
                        <div className="row">
                          {searchByProviderResults.map((game, index) => (
                            <motion.div
                              className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1"
                              key={game.uuid}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.002 }}
                            >
                              <div
                                className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                                onClick={() => handleGameClick(game)}
                              >
                                <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                  <img
                                    src={game.image || "/assets/img/placeholder.png"}
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
                  </>
                ) : (
                  <p className="text-center text-gray-400 mt-4">No results found.</p>
                )}
              </>
            )}
          </>
        ) : (
          <SkeletonTheme baseColor="#313131" highlightColor="#525252">
            <h5>Filtered Games</h5>

            <div className="px-2">
              {isPageLoading ? (
                <div className="row px-8leftright">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3" key={i}>
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
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.002 }}
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
                            <i className="fa-solid fa-play" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {isFetching && <p className="text-white text-center mt-3">Loading more games...</p>}
                </>
              )}
            </div>
          </SkeletonTheme>
        )}
      </div>
    </>
  );
};

export default AllGamesView;

const MyClose = ({ closeToast }) => (
  <button onClick={closeToast} className="toaster_close_btn">
    ×
  </button>
);
