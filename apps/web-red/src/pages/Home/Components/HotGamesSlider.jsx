import React, { useContext, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, FreeMode } from "swiper/modules";
import StickyHeader from "./Header/Header";
import BottomFooter from "./footer/BottomFooter";
import Footer from "./footer/Footer";
// import OffCanvas from "../offcanvapages/Offcanva";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import routes from "../routes/route";
import BottomProvider from "./footer/BottomProvider";
import BASE_URL from "../../API/api";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import AuthContext from "../../Auth/AuthContext";
import FullPageLoader from "./FullPageLoader";
import axiosInstance from "../../API/axiosConfig";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  fetchDiceGames,
  fetchProviderList,
  fetchSmartSoftGames,
} from "../../hooks/homePageApi";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "./Header/Sidebar";
import {CURRENCY_SYMBOL } from "../../constants";

function Home() {
  const { isLoading } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedGameUrl, setSelectedGameUrl] = useState(null);
  const [showFullScreenGame, setShowFullScreenGame] = useState(false);
  const [isLaunchingGame, setIsLaunchingGame] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const iframeRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const hasShownRef = useRef(false);
  const { fetchUser, user } = useContext(AuthContext);
  const {
    data: diceGames = [],
    isLoadingDiceGame,
  } = useQuery({
    queryKey: ["diceGames"],
    queryFn: fetchDiceGames,
    staleTime: 5 * 60 * 1000,
  });

  // SmartSoft games query
  const {
    data: smartSoftGames = [],
    isLoading: isLoadingSmartSoftGames,
    isError: isErrorSmartSoft,
    error: errorSmartSoft,
  } = useQuery({
    queryKey: ["smartSoftGames"],
    queryFn: fetchSmartSoftGames,
    staleTime: 5 * 60 * 1000,
  });

  // Provider List API
  const {
    data: providerList = [],
    isLoading: isLoadingProviders,
    isError: isErrorProviders,
    error: errorProviders,
  } = useQuery({
    queryKey: ["providerList"],
    queryFn: fetchProviderList,
    staleTime: 5 * 60 * 1000, // optional 5 minutes cache
  });

  useEffect(() => {
    const showFromStorage = () => {
      const flash = sessionStorage.getItem("giftFlash");
      if (!flash) return;
      try {
        setResult(JSON.parse(flash));
      } catch {
        setResult({ type: "error", message: flash });
      }
      setShowModal(true);
      sessionStorage.removeItem("giftFlash"); // consume
    };

    showFromStorage(); // show if it was already set before mount
    window.addEventListener("giftFlash", showFromStorage);
    return () => window.removeEventListener("giftFlash", showFromStorage);
  }, []);
  useEffect(() => {
    const showFromStorage = () => {
      if (hasShownRef.current) return;
      const flash = sessionStorage.getItem("giftFlash");
      if (!flash) return;

      hasShownRef.current = true;
      try {
        setResult(JSON.parse(flash));
      } catch {
        setResult({ type: "error", message: flash });
      }
      setShowModal(true);
      sessionStorage.removeItem("giftFlash");
    };

    showFromStorage();
    window.addEventListener("giftFlash", showFromStorage);
    return () => window.removeEventListener("giftFlash", showFromStorage);
  }, []);

  useEffect(() => {
    if (location.state?.showLoginSuccess) {
      toast.success("Login successful! 🎉", {
        toastId: "login-success",
        autoClose: 3000,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
          // runs if user clicks X OR after timeout
          navigate(location.pathname, { replace: true, state: {} });
        },
      });
    }
  }, [location, navigate]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingTypes(false);
    }, 1000); // Simulate a 1-second load time

    return () => clearTimeout(timer);
  }, []);

  // Simulate loading of the banner
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingBanner(false);
    }, 1000); // Simulate an 800ms load time

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  // Simulate a loading delay for the marquee content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingMarquee(false);
    }, 1000); // Simulate a 1.2-second load time

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  // Simulate data fetching with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingGames(false); // Set loading to false after the delay
    }, 1500); // Increased delay slightly for better visual effect (adjust as needed)

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []); // Effect runs once on component mount

  const routes = {
    games: {
      all: "/all-games",
    },
  };

  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Define your game type data.
  // This array ensures the skeleton and actual content match in structure and count.
  const gameTypes = [
    { name: "Casino", type: "card", imgSrc: "assets/img/css.png" },
    { name: "Roulette", type: "roulette", imgSrc: "assets/img/casino11.png" },
    { name: "Crash", type: "crash", imgSrc: "assets/img/crash.png" },
    { name: "Lottery", type: "lottery", imgSrc: "assets/img/lottery.png" },
    { name: "Instant", type: "instant", imgSrc: "assets/img/sports.png" },
    { name: "Slots", type: "slots", imgSrc: "assets/img/horse.png" },
    { name: "Dice", type: "dice", imgSrc: "assets/img/up.png" },
  ];

  // banner section

  // You'll need to define this component or integrate it into your existing one

  const [isLoadingBanner, setIsLoadingBanner] = useState(true);

  const [isLoadingMarquee, setIsLoadingMarquee] = useState(true); // New loading state

  // Define your static game data for the marquee.
  // In a real app, this would likely come from an API call.
  const marqueeGames = [
    { type: "roulette", imgSrc: "assets/img/turbo/1.png" },
    { type: "slots", imgSrc: "assets/img/turbo/2.png" },
    { type: "card", imgSrc: "assets/img/turbo/3.png" },
    { type: "dice", imgSrc: "assets/img/turbo/4.png" },
    { type: "shooting", imgSrc: "assets/img/turbo/5.png" },
    { type: "home", imgSrc: "assets/img/turbo/6.png" },
    // Last one navigating to home
  ];

  // State to manage loading status for this section
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  // sds
  // Your static game data (replace with API fetch in a real application)
  const allGamesData = [
    { type: "roulette", imgSrc: "assets/img/turbo/1.png" },
    { type: "slots", imgSrc: "assets/img/turbo/2.png" },
    { type: "card", imgSrc: "assets/img/turbo/3.png" },
    { type: "dice", imgSrc: "assets/img/turbo/4.png" },
    { type: "shooting", imgSrc: "assets/img/turbo/5.png" },
    { type: "general", imgSrc: "assets/img/turbo/6.png", linkTo: routes.home },
    { type: "bingo", imgSrc: "assets/img/turbo/7.png" },
    { type: "fish/shooting", imgSrc: "assets/img/turbo/8.png" },
    { type: "table", imgSrc: "assets/img/turbo/9.png" },
  ];

  // inside component
  const [isSearching, setIsSearching] = useState(false);
  // const navigate = useNavigate();
  const handleImageClick = async (term) => {
    try {
      setIsSearching(true);
      const res = await axiosInstance.get("/all-games", {
        params: { is_mobile: 1, search: term, page: 1 }, // Lucky 6 → term = "Lucky 6"
      });
      const results = res?.data?.allGames || [];

      // use results (navigate + pass state, or open modal, etc.)
      navigate(`/filtered-games?search=${encodeURIComponent(term)}`, {
        state: { results },
      });
    } catch (e) {
      // console.error("Search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const RETURN_URL_KEY = "returnUrl";

  const navigateToSavedReturnUrl = React.useCallback(() => {
    const target = sessionStorage.getItem(RETURN_URL_KEY) || "/";

    // Strip origin so React Router can handle it
    const origin = window.location.origin;
    const toPath = target.startsWith(origin)
      ? target.slice(origin.length)
      : target;

    // If we’re already at that path+query, just close overlay; don’t navigate again
    const here = window.location.pathname + window.location.search;
    const url = new URL(target, origin);
    const there = url.pathname + url.search;
    if (here === there) return;

    navigate(toPath, { replace: true }); // soft navigate (no full reload)
  }, [navigate]);

  // back btn setup starts
  const buildReturnUrl = (location) => {
    const base = import.meta?.env?.BASE_URL || process.env.PUBLIC_URL || "";
    const baseTrim = base.replace(/\/$/, "");
    const path = `${baseTrim}${location.pathname}${location.search || ""}`;
    return new URL(path, window.location.origin).toString();
  };

  // back btn / overlay state (OUTSIDE the function)
  // const [showModal, setShowModal] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  // const iframeRef = useRef(null);

  const handleConfirm = async () => {
    setShowModal(false);
    setIsLaunchingGame(false);
    setShowFullScreenGame(false);
    setSelectedGameUrl("");
    await fetchUser(user?.token);
    // go back to saved returnUrl
    const target = sessionStorage.getItem(RETURN_URL_KEY) || "/";
    // window.location.replace(target);
    navigateToSavedReturnUrl();
  };

  const handleCancel = () => setShowModal(false);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIsLaunchingGame(false);

    const el = iframeRef.current;
    if (!el) return;

    try {
      // if same-origin (provider redirected to our app)
      const href = el.contentWindow.location.href;
      if (href.startsWith(window.location.origin)) {
        setShowFullScreenGame(false);
        setSelectedGameUrl("");
        setIframeError(false);
        setIframeLoaded(false);
        const target = sessionStorage.getItem(RETURN_URL_KEY) || href;
        // window.location.replace(target);
        navigateToSavedReturnUrl();
      }
    } catch {
      // still cross-origin; ignore
    }
  };

  // ---- keep popstate too (optional but nice) ----
  useEffect(() => {
    const onPop = () => {
      setShowFullScreenGame(false);
      setSelectedGameUrl("");
      setIsLaunchingGame(false);
      // const target = sessionStorage.getItem(RETURN_URL_KEY) || "/";
      // window.location.replace(target);
      navigateToSavedReturnUrl();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ====== GAME LAUNCH (ENTIRE function body stays together) ======
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

      const gameUrl = response.data?.game?.gameUrl || response.data?.game_url;
      if (gameUrl) {

        sessionStorage.setItem("prevPage", location.pathname + location.search);

      
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
      toast.error("Game launch failed. Try again later.");
    }
  };
  // back btn setup Ends

  const Aviator = {
  provider: "Spribe",  
  name: "Aviator",
  uuid: "841d0a6789c74dd4abab65133287af9b",  
  has_lobby: 0,
  has_tables: 0,          
};
 
const LUCKY6_GAME = {
  provider: "ExcellentReel",  
  name: "Lucky 6",
  uuid: "a9b5c9d280c00ff831afd105e735d01af7257e25",  
  has_lobby: 0,
  has_tables: 0,          
};
  return (
    <>
      {/* header  */}
      <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {/* header end */}

      <div className="container-fluid page-body-wrapper">
        {/* Sidebar Nav Starts */}
        <Sidebar />
        {/* Sidebar Nav Ends */}
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="max-1250 mx-auto">
              <div>
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
                    <div
                      className="spinner-border text-light me-3"
                      role="status"
                    >
                      <span className="visually-hidden">Loading</span>
                    </div>
                    <p>Launching game, please wait...</p>
                  </div>
                )}

                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  theme="dark"
                  closeButton={<MyClose />}
                />

                {isLoading ? (
                  <FullPageLoader message="" />
                ) : (
                  <>
                    <section className="container vh-100  py-2">
                      {/* home start */}
                      {/*----banner-slider----*/}
                      <SkeletonTheme
                        baseColor="#313131"
                        highlightColor="#525252"
                      >
                        {/*----banner-slider----*/}
                        <div className="position-relative my-2">
                          {" "}
                          {/* Added my-3 for spacing, adjust as needed */}
                          {isLoadingBanner ? (
                            // Skeleton for the banner slider
                            <Skeleton
                              height={180}
                              className="w-100 rounded-2"
                            /> // Adjust height to match your banner
                          ) : (
                            <Swiper
                              className="mySwiper"
                              modules={[Navigation, Pagination, Autoplay]}
                              spaceBetween={30}
                              slidesPerView={1}
                              pagination={{ clickable: true }}
                              autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                              }} // Added disableOnInteraction for better UX
                              breakpoints={{
                                768: {
                                  slidesPerView: 2, // Tablet view
                                },
                                1024: {
                                  slidesPerView: 3, // Laptop/Desktop view
                                },
                              }}
                            >
                              <SwiperSlide onClick={() => handleGameClick(Aviator)}>
                                <img
                                  src="assets/img/slider/8.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 6"
                                />
                              </SwiperSlide>

                               <SwiperSlide onClick={() => handleGameClick(LUCKY6_GAME)}>
                                <img
                                  src="assets/img/slider/lucky 6.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 5"
                                />
                              </SwiperSlide>
                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=card`)
                                }
                              >
                                <img
                                  src="assets/img/slider/first6.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 6"
                                />
                              </SwiperSlide>
                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=slots`)
                                }
                              >
                                <img
                                  src="assets/img/slider/first2.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 2"
                                />
                              </SwiperSlide>

                              {/* bingo */}

                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=bingo`)
                                }
                              >
                                <img
                                  src="assets/img/slider/bingo banner.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 2"
                                />
                              </SwiperSlide>

                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=roulette`)
                                }
                              >
                                <img
                                  src="assets/img/slider/first1.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 1" // Improved alt text
                                />
                              </SwiperSlide>

                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=blackjack`)
                                }
                              >
                                <img
                                  src="assets/img/slider/10.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 6"
                                />
                              </SwiperSlide>

                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=lucky`)
                                }
                              >
                                <img
                                  src="assets/img/slider/first7.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 3"
                                />
                              </SwiperSlide>
                              {/* <SwiperSlide onClick={() =>
                                    navigate(`/filtered-games?type=card`)
                                  }
 >
                                <img
                                  src="assets/img/slider/first4.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 4" xfd
                                />
                              </SwiperSlide> */}

                              <SwiperSlide
                                onClick={() =>
                                  navigate(`/filtered-games?search=card`)
                                }
                              >
                                <img
                                  src="assets/img/slider/9.png"
                                  className="w-100 rounded-2"
                                  alt="Gaming Banner Slide 6"
                                />
                              </SwiperSlide>
                            </Swiper>
                          )}
                        </div>
                        {/*-------banner-end----*/}
                      </SkeletonTheme>
                      {/*-------banner-end----*/}
                      {/* home end */}

                      {/* HOT GAMES */}
                      {/* HOT GAMES */}
                      <SkeletonTheme
                        baseColor="#313131"
                        highlightColor="#525252"
                      >
                        {/* HOT GAMES */}
                        <div>
                          {/* Section Title */}
                          <div className="top-matches-title d-flex align-items-center justify-content-between my-2">
                            <div className="d-flex align-items-center">
                              {isLoadingTypes ? (
                                <>
                                  <Skeleton circle height={27} width={27} />
                                  <Skeleton
                                    height={20}
                                    width={100}
                                    className="ms-2"
                                  />
                                </>
                              ) : (
                                <>
                                  <img
                                    src="https://cdn-icons-png.flaticon.com/512/12800/12800987.png"
                                    width="27"
                                    alt="Games Type Icon"
                                  />
                                  <h5 className="m-0 ms-2 d-flex align-items-center">
                                    Hot Games
                                  </h5>
                                </>
                              )}
                            </div>

                            <div
                              onClick={() =>
                                navigate(`/filtered-games?type=hot`)
                              }
                            >
                              {/* <Link to="/all-games"> */}
                              <span className="text-white fs-13 fw-500 right_heading">
                                All <i className="ri-arrow-right-s-line" />
                              </span>
                              {/* </Link> */}
                            </div>
                          </div>

                          {/* Swiper Section */}
                          <Swiper
                            className="mySwiper"
                            modules={[Autoplay, FreeMode]}
                            spaceBetween={5}
                            loop={true}
                            autoplay={{ delay: 0, disableOnInteraction: false }}
                            speed={3000}
                            slidesPerView={2}
                            freeMode={true}
                            breakpoints={{
                              768: {
                                slidesPerView: 5, // Tablet view
                              },
                              1024: {
                                slidesPerView: 6, // Laptop/Desktop view
                              },
                            }}
                          >
                            {isLoadingDiceGame ? ( // ✅ use the new loading state
                              Array.from({ length: 4 }).map((_, index) => (
                                <SwiperSlide key={index}>
                                  <div className="game-card-wrapper rounded-2 new-cardclr p-1">
                                    <Skeleton height={100} borderRadius={10} />
                                    <div className="mt-2 px-1">
                                      <Skeleton height={12} width={`100%`} />
                                    </div>
                                  </div>
                                </SwiperSlide>
                              ))
                            ) : diceGames.length > 0 ? (
                              diceGames.map((game, index) => (
                                <SwiperSlide key={game.uuid || index}>
                                  <div
                                    className="game-card-wrapper rounded-2 new-cardclr"
                                    onClick={() => handleGameClick(game)}
                                  >
                                    <div className="game-card p-0 m-0 p-1 ">
                                      <img
                                        src={
                                          game.image
                                            ? game.image
                                            : "assets/img/play_now.png"
                                        }
                                        className="game-card-img position-relative"
                                        alt={game.name}
                                      />
                                      <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                        <i className="fa-solid fa-play"></i>
                                      </div>
                                    </div>
                                  </div>
                                </SwiperSlide>
                              ))
                            ) : (
                              <div className="d-flex flex-column align-items-center mt-5">
                                <img
                                  src="assets/img/notification/img_2.png"
                                  alt="unauth"
                                  className="w-25"
                                />
                                <p className="text-white text-center">
                                  No dice games available
                                </p>
                              </div>
                            )}
                          </Swiper>

                          {/* Fullscreen Game Iframe */}
                          {showFullScreenGame && selectedGameUrl && (
                            <div className="bg-danger h-100">
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
                                    className="navbar py-1 navbar-dark bg-black sticky-top shadow-sm d-flex align-items-center"
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

                                {/* Iframe or Error Message */}
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
                                      style={{
                                        maxWidth: "400px",
                                        color: "white",
                                      }}
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
                                            onClick={handleCancel}
                                          />
                                        </div>

                                        <div className="modal-body">
                                          <h5 className="modal-title fs-2 text-warning mb-3">
                                            Go Back?
                                          </h5>
                                          <p className="fs-5 text-light">
                                            Are you sure you want to leave this
                                            game?
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
                            </div>
                          )}
                        </div>
                      </SkeletonTheme>
                      {/* hot games */}

                      {/* hot games */}

                      {/* Games Types */}

                      <div className="game-types-section  tabd-none">
                        {/* Games Type Header */}
                        <div className="top-matches-title d-flex align-items-center justify-content-between my-2 ">
                          <div className="d-flex">
                            {/* Skeleton for icon */}
                            {isLoadingTypes ? (
                              <Skeleton
                                circle
                                height={27}
                                width={27}
                                baseColor="#313131" // Darker grey for the base
                                highlightColor="#525252"
                              />
                            ) : (
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/12800/12800987.png"
                                width="27"
                                alt="Games Type Icon"
                              />
                            )}
                            {/* Skeleton for title */}
                            {isLoadingTypes ? (
                              <Skeleton
                                height={20}
                                width={100}
                                className="ms-2"
                                baseColor="#313131" // Darker grey for the base
                                highlightColor="#525252"
                              />
                            ) : (
                              <h5 className="m-0 ms-2">Games Type</h5>
                            )}
                          </div>
                          {/* <div>
                            <Link to={routes.games.all}>
                              <span className="text-white fs-13 fw-500 right_heading">
                                All <i className="ri-arrow-right-s-line" />
                              </span>
                            </Link>
                          </div> */}
                        </div>

                        {/* SkeletonTheme for consistent skeleton colors */}
                        <SkeletonTheme
                          baseColor="#313131"
                          highlightColor="#525252"
                        >
                          {isLoadingTypes ? (
                            // Skeleton loading state for game type cards
                            <>
                              <div className="d-flex gap-2">
                                {Array.from({ length: 2 }).map(
                                  (
                                    _,
                                    index // 2 cards in the first row
                                  ) => (
                                    <div
                                      key={`skeleton-1-${index}`}
                                      className="card bg-cardtrans p-1"
                                      style={{ flex: "1 1 auto" }}
                                    >
                                      <div className="flex-column d-flex">
                                        <Skeleton
                                          height={15}
                                          width="60%"
                                          className="mb-1"
                                        />{" "}
                                        {/* Text skeleton */}
                                        <Skeleton
                                          height={50}
                                          width="100%"
                                        />{" "}
                                        {/* Image skeleton */}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="mt-2">
                                <div className="d-flex gap-2">
                                  {Array.from({ length: 3 }).map(
                                    (
                                      _,
                                      index // 3 cards in the second row
                                    ) => (
                                      <div
                                        key={`skeleton-2-${index}`}
                                        className="card bg-cardtrans p-1"
                                        style={{ flex: "1 1 auto" }}
                                      >
                                        <div className="flex-column d-flex">
                                          <Skeleton
                                            height={15}
                                            width="60%"
                                            className="mb-1"
                                          />
                                          <Skeleton height={50} width="100%" />
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                {Array.from({ length: 2 }).map(
                                  (
                                    _,
                                    index // 2 cards in the third row
                                  ) => (
                                    <div
                                      key={`skeleton-3-${index}`}
                                      className="card bg-cardtrans p-1"
                                      style={{ flex: "1 1 auto" }}
                                    >
                                      <div className="flex-column d-flex">
                                        <Skeleton
                                          height={15}
                                          width="60%"
                                          className="mb-1"
                                        />
                                        <Skeleton height={50} width="100%" />
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          ) : (
                            // Actual game type cards when loaded
                            <>
                              <div className="d-flex gap-2">
                                {gameTypes.slice(0, 2).map(
                                  (
                                    game // First row: Casino, Roulette
                                  ) => (
                                    <div
                                      key={game.type} // Using game.type as key since it's unique
                                      className="card bg-cardtrans p-1"
                                      onClick={() =>
                                        navigate(
                                          `/filtered-games?type=${game.type}`
                                        )
                                      }
                                      role="button"
                                      tabIndex="0"
                                      onKeyPress={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          // Added spacebar for accessibility
                                          navigate(
                                            `/filtered-games?search=${game.type}`
                                          );
                                        }
                                      }}
                                    >
                                      <div className="flex-column d-flex">
                                        <span className="text-white fw-500 fs-13">
                                          {game.name}
                                        </span>
                                        <img
                                          src={game.imgSrc}
                                          alt={game.name}
                                        />
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>

                              <div className="mt-2">
                                <div className="d-flex gap-2">
                                  {gameTypes.slice(2, 5).map(
                                    (
                                      game // Second row: Crash, Lottery, Instant
                                    ) => (
                                      <div
                                        key={game.type}
                                        className="card bg-cardtrans p-1"
                                        onClick={() =>
                                          navigate(
                                            `/filtered-games?search=${game.type}`
                                          )
                                        }
                                        role="button"
                                        tabIndex="0"
                                        onKeyPress={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            navigate(
                                              `/filtered-games?search=${game.type}`
                                            );
                                          }
                                        }}
                                      >
                                        <div className="flex-column d-flex">
                                          <span className="text-white fw-500 fs-13">
                                            {game.name}
                                          </span>
                                          <img
                                            src={game.imgSrc}
                                            alt={game.name}
                                          />
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="d-flex gap-2 mt-2">
                                {gameTypes.slice(5, 7).map(
                                  (
                                    game // Third row: Slots, Dice
                                  ) => (
                                    <div
                                      key={game.type}
                                      className="card bg-cardtrans p-1"
                                      onClick={() =>
                                        navigate(
                                          `/filtered-games?search=${game.type}`
                                        )
                                      }
                                      role="button"
                                      tabIndex="0"
                                      onKeyPress={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === " "
                                        ) {
                                          navigate(
                                            `/filtered-games?search=${game.type}`
                                          );
                                        }
                                      }}
                                    >
                                      <div className="flex-column d-flex">
                                        <span className="text-white fw-500 fs-13">
                                          {game.name}
                                        </span>
                                        <img
                                          src={game.imgSrc}
                                          alt={game.name}
                                        />
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          )}
                        </SkeletonTheme>
                      </div>

                      {/* Games Types */}

                      <>
                        {/* Games Types */}
                        <div className="mobile-none">
                          <div className="top-matches-title d-flex align-items-center justify-content-between   my-3">
                            <div className="d-flex">
                              <img
                                src="https://cdn-icons-png.flaticon.com/512/12800/12800987.png"
                                width="27"
                                alt="Games Type Icon"
                              />
                              <h5 className="m-0 ms-2">Games Type</h5>
                            </div>
                            {/* <div>
                              <a href="./Allgames.html">
                                <span className="text-white fs-13 fw-500 right_heading">
                                  All <i className="ri-arrow-right-s-line" />
                                </span>
                              </a>
                            </div> */}
                          </div>
                          <div className="d-flex gap-2">
                            <div className="col-4 ">
                              <div
                                className="card bg-cardtrans p-1"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(to left, rgb(255 70 42 / 30%), transparent 75%) !important",
                                }}
                              >
                                <div
                                  className="flex-column d-flex"
                                  onClick={() =>
                                    navigate(`/filtered-games?type=card`)
                                  }
                                >
                                  <span className="text-white fw-500 fs-13  py-2 px-1">
                                    Casino
                                  </span>
                                  <img
                                    src="assets/img/casino.png"
                                    alt=""
                                    srcSet=""
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-4 ">
                              <div
                                className="card bg-cardtrans p-1"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(to left, rgb(35 105 157 / 44%), transparent 75%) !important",
                                }}
                              >
                                <div
                                  className="flex-column d-flex"
                                  onClick={() =>
                                    navigate(`/filtered-games?search=instant`)
                                  }
                                >
                                  <span className="text-white fw-500 fs-13  py-2 px-1">
                                    Instant
                                  </span>
                                  <img
                                    src="assets/img/sports.png"
                                    alt=""
                                    srcSet=""
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-4 ">
                              <div className="d-flex  flex-wrap  gap-2">
                                <div className="w-45 ">
                                  <div
                                    className="card bg-cardtrans p-1"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to left, rgb(181 114 28 / 30%), transparent 60%) !important",
                                    }}
                                  >
                                    <div
                                      className="flex-column d-flex"
                                      onClick={() =>
                                        navigate(
                                          `/filtered-games?search=lottery`
                                        )
                                      }
                                    >
                                      <span className="text-white fw-500 fs-13 py-2 px-1">
                                        Lottery
                                      </span>
                                      <img
                                        src="assets/img/lottery.png
                  "
                                        alt=""
                                        srcSet=""
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="w-45 ">
                                  <div
                                    className="card bg-cardtrans p-1"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to left, rgb(123 64 14 / 49%), transparent 75%) !important",
                                    }}
                                  >
                                    <div
                                      className="flex-column d-flex"
                                      onClick={() =>
                                        navigate(`/filtered-games?search=slots`)
                                      }
                                    >
                                      <span className="text-white fw-500 fs-13  py-2 px-1">
                                        Slot
                                      </span>
                                      <img
                                        src="assets/img/horse.png"
                                        alt=""
                                        srcSet=""
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="w-45 pt-2">
                                  <div
                                    className="card bg-cardtrans p-1"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to left, rgb(190 191 183 / 27%), transparent 75%) !important",
                                    }}
                                    onClick={() =>
                                      navigate(`/filtered-games?search=dice`)
                                    }
                                  >
                                    <div className="flex-column d-flex">
                                      <span className="text-white fw-500 fs-13  py-2 px-1">
                                        Dice
                                      </span>
                                      <img
                                        src="assets/img/up.png"
                                        alt=""
                                        srcSet=""
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="w-45 pt-2">
                                  <div
                                    className="card bg-cardtrans p-1"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to left, rgb(123 64 14 / 49%), transparent 75%) !important",
                                    }}
                                    onClick={() =>
                                      navigate(`/filtered-games?search=bingo`)
                                    }
                                  >
                                    <div className="flex-column d-flex">
                                      <span className="text-white fw-500 fs-13  py-2 px-1">
                                        Bingo
                                      </span>
                                      <img
                                        src="assets/img/bingo.png
            "
                                        alt=""
                                        srcSet=""
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>

                      {/* games types end */}
                      {/* games types end */}

                      {/* game list starts */}
                      {/* <div className="game-grid">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div key={game.uuid} className="game-card">
                <img src={game.image} alt={game.name} />
                <p className="text-white">{game.name}</p>
              </div>
            ))
          ) : (
            <>
              <div className="d-flex flex-column align-items-center mt-5">
                <img
                  src="assets/img/notification/img_2.png"
                  alt="unauth"
                  className="w-75"
                />
                <p className="text-white text-center">No games available.</p>
              </div>
            </>
          )}
        </div> */}
                      {/* game list Ends */}

                      {/* {{base_url}}/jiboomba/all-games?type=dice */}
                      {/* all games part */}
                      <div>
                        {/* All Games Section Header */}
                        <div className="top-matches-title d-flex align-items-center justify-content-between my-3">
                          <div className="d-flex">
                            {isLoadingGames ? (
                              // Skeleton for the dot icon
                              <Skeleton
                                circle
                                height={20}
                                width={20}
                                className="dot"
                                baseColor="#313131" // Darker grey for the base
                                highlightColor="#525252"
                              />
                            ) : (
                              <span className="dot" />
                            )}
                            {isLoadingGames ? (
                              // Skeleton for the title text
                              <Skeleton
                                height={20}
                                width={120}
                                className="ms-2"
                                baseColor="#313131" // Darker grey for the base
                                highlightColor="#525252"
                              />
                            ) : (
                              <h5 className="m-0 ms-2">All Games</h5>
                            )}
                          </div>
                          <div>
                            {/* The "All" link typically remains visible even during loading */}
                            <Link to={routes.games.all}>
                              <span className="text-white fs-13 fw-500 right_heading">
                                All <i className="ri-arrow-right-s-line" />
                              </span>
                            </Link>
                          </div>
                        </div>

                        {/* Apply SkeletonTheme for consistent styling of all skeletons in this section */}
                        <SkeletonTheme
                          baseColor="#313131"
                          highlightColor="#525252"
                        >
                          {isLoadingGames ? (
                            // --- Skeleton loading state for the Swiper carousel ---
                            <swiper-container
                              className="mySwiper"
                              space-between="5"
                              // We can disable autoplay for skeletons, or keep it for the animation feel
                              loop="true" // Loop might not be necessary for skeletons if you're only showing a few
                              autoplay='{"delay": 0, "disableOnInteraction": false}' // Keep for visual consistency
                              speed="2500"
                              slides-per-view="2.5"
                              centered-slides="false"
                              free-mode="true"
                            >
                              {/* Render 4 skeleton slides to adequately fill the view */}
                              {Array.from({ length: 4 }).map((_, index) => (
                                <SwiperSlide key={index}>
                                  <div className="game-card-wrapper rounded-2 new-cardclr p-1">
                                    <Skeleton
                                      height={130}
                                      borderRadius={10}
                                      baseColor="#313131"
                                      highlightColor="#525252"
                                    />
                                    <div className="mt-2 px-1">
                                      <Skeleton
                                        height={12}
                                        width={`100%`}
                                        baseColor="#313131"
                                        highlightColor="#525252"
                                      />
                                    </div>
                                  </div>
                                </SwiperSlide>
                              ))}
                            </swiper-container>
                          ) : (
                            // --- Actual game content once loaded ---
                            <swiper-container
                              className="mySwiper"
                              space-between="5"
                              autoplay='{"delay": 0, "disableOnInteraction": false}'
                              slides-per-view="2.5"
                              centered-slides="false"
                              free-mode="true"
                              loop={true}
                              speed={3000}
                              slidesPerView={2}
                              freeMode={true}
                              breakpoints={{
                                768: {
                                  slidesPerView: 6, // Tablet view
                                },
                                1024: {
                                  slidesPerView: 7, // Laptop/Desktop view
                                },
                              }}
                            >
                              {/* Map over your actual game data to render the slides */}
                              {allGamesData.map((game, index) => (
                                <swiper-slide key={index}>
                                  {game.linkTo ? (
                                    // Use Link component if a direct route is specified
                                    <Link
                                      to={game.linkTo}
                                      className="game-card-wrapper"
                                    >
                                      <div className="game-card">
                                        <img
                                          src={game.imgSrc}
                                          className="game-card-img"
                                          alt={`Game ${game.type}`}
                                        />
                                      </div>
                                      <div className="game-play-button d-flex flex-column">
                                        <div className="btn-play">
                                          <i className="fa-solid fa-play"></i>
                                        </div>
                                      </div>
                                    </Link>
                                  ) : (
                                    // Use onClick with navigate for dynamic filtered routes
                                    <div
                                      className="game-card-wrapper"
                                      onClick={() =>
                                        navigate(
                                          `/filtered-games?type=${game.type}`
                                        )
                                      }
                                    >
                                      <div className="game-card">
                                        <img
                                          src={game.imgSrc}
                                          className="game-card-img"
                                          alt={`Game ${game.type}`}
                                        />
                                      </div>
                                      <div className="game-play-button">
                                        <div className="btn-play">
                                          <i className="fa-solid fa-play"></i>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </swiper-slide>
                              ))}
                            </swiper-container>
                          )}
                        </SkeletonTheme>
                      </div>
                      {/* all games */}

                      {/* Marquee runing */}

                      {/* Marquee end */}

                      {/* Dice of games all filer */}

                      {/* Slot Gaming */}
                      <SkeletonTheme
                        baseColor="#313131"
                        highlightColor="#525252"
                      >
                        {/* SLOT GAMES */}
                        <div>
                          <div className="top-matches-title d-flex align-items-center justify-content-between my-3">
                            <div className="d-flex">
                              <span className="dot" />
                              <h5 className="m-0 ms-2 d-flex align-items-center">
                                Slot Games
                              </h5>
                            </div>
                            <div
                              onClick={() =>
                                navigate(`/filtered-games?type=slots`)
                              }
                            >
                              {/* <Link to={routes.games.all}> */}
                              <span className="text-white fs-13 fw-500 right_heading">
                                All <i className="ri-arrow-right-s-line" />
                              </span>
                              {/* </Link> */}
                            </div>
                          </div>

                          {/* Swiper for Slot Games */}
                          <Swiper
                            className="mySwiper"
                            modules={[Autoplay, FreeMode]}
                            spaceBetween={5}
                            loop={true}
                            autoplay={{ delay: 0, disableOnInteraction: false }}
                            speed={3000}
                            slidesPerView={2}
                            freeMode={true}
                            breakpoints={{
                              768: {
                                slidesPerView: 5, // Tablet view
                              },
                              1024: {
                                slidesPerView: 7, // Laptop/Desktop view
                              },
                            }}
                          >
                            {isLoadingSmartSoftGames ? (
                              // Skeleton loader
                              Array.from({ length: 4 }).map((_, index) => (
                                <SwiperSlide key={index}>
                                  <div className="game-card-wrapper rounded-2 new-cardclr p-1">
                                    <Skeleton height={130} borderRadius={10} />
                                    <div className="mt-2 px-1">
                                      <Skeleton height={12} width="100%" />
                                    </div>
                                  </div>
                                </SwiperSlide>
                              ))
                            ) : isErrorSmartSoft ? (
                              // Error message
                              <div className="d-flex flex-column align-items-center mt-5 w-100">
                                <p className="text-white text-center">
                                  Error loading slot games:{" "}
                                  {errorSmartSoft.message}
                                </p>
                              </div>
                            ) : smartSoftGames.length > 0 ? (
                              // Game cards
                              smartSoftGames.map((game, index) => (
                                <SwiperSlide key={game.uuid || index}>
                                  <div className="game-card-wrapper rounded-2 new-cardclr">
                                    <div className="game-card p-0 m-0 p-1">
                                      <img
                                        src={
                                          game.image
                                            ? game.image
                                            : "assets/img/play_now.png"
                                        }
                                        className="game-card-img"
                                        alt={game.name}
                                      />
                                      <div className="btn-play position-absolute top-50 start-50 translate-middle">
                                        <i className="fa-solid fa-play"></i>
                                      </div>
                                      {/* <div className="d-flex flex-column text-white text-center py-2 px-1">
                              <span className="fs-12 fw-bold text-truncate">
                                {game.name}
                              </span>
                              <span className="fs-10">Duel</span>
                            </div> */}
                                    </div>
                                    <div className="game-play-button d-flex flex-column">
                                      <div
                                        className="btn-play"
                                        onClick={() => handleGameClick(game)}
                                      >
                                        <i className="fa-solid fa-play"></i>
                                      </div>
                                    </div>
                                  </div>
                                </SwiperSlide>
                              ))
                            ) : (
                              // No games message
                              <div className="d-flex flex-column align-items-center mt-5 w-100">
                                <img
                                  src="assets/img/notification/img_2.png"
                                  alt="unauth"
                                  className="w-25"
                                />
                                <p className="text-white text-center">
                                  No slot games available
                                </p>
                              </div>
                            )}
                          </Swiper>
                        </div>
                      </SkeletonTheme>

                      {/* slot game end */}

                      {/* Provider running list starts*/}
                      <SkeletonTheme
                        baseColor="#313131"
                        highlightColor="#525252"
                      >
                        <div>
                          {/* Provider running list Header */}
                          <div className="top-matches-title d-flex align-items-center justify-content-between my-3">
                            <div className="d-flex">
                              {isLoading ? (
                                <>
                                  <Skeleton circle height={22} width={22} />
                                  <Skeleton
                                    height={20}
                                    width={100}
                                    className="ms-2"
                                  />
                                </>
                              ) : (
                                <>
                                  <img
                                    src="assets/img/coin.png"
                                    width="22px"
                                    alt="flaticon"
                                  />
                                  <h5 className="m-0 ms-2">Provider</h5>
                                </>
                              )}
                            </div>
                            <div>
                              <Link to="/providers">
                                <span className="text-white fs-13 fw-500 right_heading">
                                  All <i className="ri-arrow-right-s-line" />
                                </span>
                              </Link>
                            </div>
                          </div>

                          {/* Provider Swiper */}
                          {isLoadingProviders ? (
                            <swiper-container
                              class="mySwiper new_class4"
                              space-between="5"
                              loop="false"
                              autoplay='{"delay": 0, "disableOnInteraction": false}'
                              speed="3500"
                              slides-per-view="auto"
                              centered-slides="false"
                              free-mode="true"
                            >
                              {Array.from({ length: 6 }).map((_, index) => (
                                <swiper-slide
                                  key={index}
                                  style={{ width: "auto" }}
                                >
                                  <div
                                    className="game-card-wrapper"
                                    style={{
                                      minWidth: "70px",
                                      height: "70px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      padding: "5px",
                                    }}
                                  >
                                    <div
                                      className="game-card d-flex justify-content-center align-items-center"
                                      style={{ width: "100%", height: "100%" }}
                                    >
                                      <Skeleton circle width={50} height={50} />
                                    </div>
                                  </div>
                                </swiper-slide>
                              ))}
                            </swiper-container>
                          ) : isErrorProviders ? (
                            <p className="text-center text-white my-4">
                              Error loading providers: {errorProviders.message}
                            </p>
                          ) : providerList.length > 0 ? (
                            <swiper-container
                              class="mySwiper new_class4"
                              space-between="5"
                              loop="false"
                              autoplay='{"delay": 0, "disableOnInteraction": false}'
                              speed="3500"
                              slides-per-view="auto"
                              centered-slides="false"
                              free-mode="true"
                            >
                              {providerList.map((provider, index) => (
                                <swiper-slide
                                  key={index}
                                  style={{ width: "auto" }}
                                >
                                  <div className="game-card-wrapper">
                                    <div
                                      className="game-card d-flex justify-content-center align-items-center"
                                      onClick={() =>
                                        navigate(
                                          `/filtered-provider-games?provider=${provider.provider}`
                                        )
                                      }
                                    >
                                      <img
                                        src={
                                          provider.images?.logo ||
                                          provider.images?.name ||
                                          provider.images?.logo_name||
                                          "assets/img/game.png"
                                        }
                                        alt={provider.provider}
                                        className="w-50"
                                      />
                                    </div>
                                  </div>
                                </swiper-slide>
                              ))}
                            </swiper-container>
                          ) : (
                            <p className="text-center text-white my-4">
                              No providers available
                            </p>
                          )}
                        </div>
                      </SkeletonTheme>

                      {/* providers end */}

                      {/* Turbo games  */}
                      {/* <div>
              <div className="top-matches-title d-flex align-items-center justify-content-between   my-3">
                <div className="d-flex">
                  <img src="assets/img/coin.png" width="22px" />{" "}
                  <h5 className="m-0 ms-2">Turbo Games</h5>
                </div>
                <div>
                  <Link to={routes.games.turbo}>
                    <span className="text-white fs-13 fw-500 right_heading">
                      All <i className="ri-arrow-right-s-line" />
                    </span>
                  </Link>
                </div>
              </div>
              <swiper-container
                class="mySwiper"
                spaceBetween={5}
                loop={true}
                autoplay={{ delay: 0, disableOnInteraction: false }}
                speed={3500}
                slidesPerView={2.8}
                centeredSlides={false}
                freeMode={true}
              >
                {turboGamesList.length > 0 ? (
                  turboGamesList.map((turbogames, index) => (
                    <swiper-slide key={index}>
                      <div className="game-card-wrapper rounded-2 new-cardclr">
                        <div className="game-card p-0 m-0 p-1">
                          <img
                            src={turbogames.imagePath}
                            className="game-card-img"
                            alt={turbogames.value}
                          />
                          <div
                            className="d-flex flex-column text-white text-center py-1 px-1"
                            style={{ textAlign: "center" }}
                          >
                            <span className="fs-12 fw-bold text-truncate">
                              {turbogames.key}
                            </span>
                            <span className="fs-10">Duel</span>{" "}
                          </div>
                        </div>
                        <div className="game-play-button d-flex flex-column">
                          <div
                            className="btn-play"
                            onClick={() => handleGameClickTurbo(turbogames)}
                          >
                            <i className="fa-solid fa-play"></i>
                          </div>
                        </div>
                      </div>
                    </swiper-slide>
                  ))
                ) : (
                  <p className="text-center text-white">
                    No providers available
                  </p>
                )}
              </swiper-container>
            </div> */}
                      {/* Turbo end */}

                      {/* Spribe games  */}
                      {/* <div>
              <div className="top-matches-title d-flex align-items-center justify-content-between   my-3">
                <div className="d-flex">
                  <img src="assets/img/coin.png" width="22px" />{" "}
                  <h5 className="m-0 ms-2"> Spribe Games</h5>
                </div>
                <div>
                  <Link to={routes.games.spribe}>
                    <span className="text-white fs-13 fw-500 right_heading">
                      All <i className="ri-arrow-right-s-line" />
                    </span>
                  </Link>
                </div>
              </div>
              <swiper-container
                class="mySwiper"
                spaceBetween={5}
                loop={true}
                autoplay={{ delay: 0, disableOnInteraction: false }}
                speed={3500}
                slidesPerView={2.5}
                centeredSlides={false}
                freeMode={true}
              >
                {spribeGamesList.length > 0 ? (
                  spribeGamesList.map((spribgames, index) => (
                    <swiper-slide key={index}>
                      <div className="game-card-wrapper rounded-2 new-cardclr">
                        <div className="game-card p-0 m-0 p-1">
                          <img
                            src={spribgames.image}
                            className="game-card-img"
                            alt={spribgames.name}
                          />
                          <div
                            className="d-flex flex-column text-white text-center py-1 px-1"
                            style={{ textAlign: "center" }}
                          >
                            <span className="fs-12 fw-bold text-truncate">
                              {spribgames.key}
                            </span>
                            <span className="fs-10">{spribgames.name}</span>{" "}
                          </div>
                        </div>
                        <div className="game-play-button d-flex flex-column">
                          <div
                            className="btn-play"
                            onClick={() =>
                              handleGameClickSpribe(spribgames.slug_name)
                            }
                          >
                            <i className="fa-solid fa-play"></i>
                          </div>
                        </div>
                      </div>
                    </swiper-slide>
                  ))
                ) : (
                  <p className="text-center text-white">
                    No providers available
                  </p>
                )}
              </swiper-container>
            </div> */}
                      {/* Turbo end */}

                      {/* Marquee end */}

                      {/*---bonus------*/}
                      <div>
                        <div className="">
                          <div className="top-matches-title d-flex align-items-center gap-2  my-3 justify-content-between">
                            <div className="d-flex align-items-center">
                              <img
                                src="assets/img/coin.png"
                                alt="coin"
                                srcSet=""
                                width=""
                              />{" "}
                              <h5 className="m-0 ms-2">Bonus </h5>
                            </div>
                            {/* <Link to="/bonus">
                              <div>
                                <span className="text-white fs-13 fw-500 right_heading">
                                  All <i className="ri-arrow-right-s-line" />
                                </span>
                              </div>
                            </Link> */}
                          </div>

                          <div className="row px-0">
                            <div className="col-lg-6 mb-3">
                              <div className="bouns_sec">
                                <div className="card bonus_card">
                                  <div className="card-body p-0">
                                    <div className="bonus_card_sec">
                                      {/* Top section with text and image */}
                                      <div className="bonus_sec_top p-4 py-2">
                                        <div className="bonus_sec_content">
                                          <span>Casino</span>
                                          <span className="text-shadow">
                                            <p>100% Crash Power Bonus</p>
                                          </span>
                                        </div>
                                      </div>
                                      {/* Bottom section with timer and buttons */}
                                      <div className="bonusBlock_other__bottom p-2">
                                        <div className="timer_block_container d-flex align-items-center">
                                          {/* Action buttons */}
                                          <div className="bonus_bottom_btn red_clr w-100">
                                            <button className="btn btn-red w-100">
                                              Get bonus
                                            </button>
                                            <button className="btn btn-outline-light w-100">
                                              Details
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-6">
                              <div className="bouns_sec ">
                                <div className="card bonus_card">
                                  <div className="card-body p-0">
                                    <div className="bonus_card_sec">
                                      {/* Top section with text and image */}
                                      <div className="bonus_sec_top p-4 py-2">
                                        <div className="bonus_sec_content">
                                          <span>Casino</span>
                                          <span className="text-shadow">
                                            <p>75% Crash Power Bonus</p>
                                          </span>
                                        </div>
                                      </div>
                                      {/* Bottom section with timer and buttons */}
                                      <div className="bonusBlock_other__bottom p-2">
                                        <div className="timer_block_container d-flex align-items-center">
                                          {/* Action buttons */}
                                          <div className="bonus_bottom_btn red_clr w-100">
                                            <button className="btn btn-red w-100">
                                              Get bonus
                                            </button>
                                            <button className="btn btn-outline-light w-100">
                                              Details
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/*----bonus-end---*/}

                      {!showFullScreenGame && <BottomFooter />}
                      {!showFullScreenGame && <BottomProvider />}

                      {/* <BottomFooter /> */}
                    </section>

                    {/* Footer Start */}

                    <Footer />
                    {/* {!showFullScreenGame && <Footer />} */}
                    {/* Footer Start */}

                    {showModal && (
                      <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                      >
                        <div className="modal-dialog modal-dialog-centered modal-sm justify-content-center voucher_pop_up">
                          <div
                            className="modal-content"
                            style={{ width: "240px" }}
                          >
                            <div className="modal-body d-flex flex-column align-items-center">
                              {/* =================================================================== */}
                              {/* <!-- Overlay --> */}
                              <div class="modal-overlay">
                                {/* <!-- Voucher Card --> */}
                                <div class="voucher-card">
                                  <img
                                    src="https://static.vecteezy.com/system/resources/thumbnails/045/822/274/small/discount-voucher-with-golden-coins-icon-3d-render-concept-of-3d-discount-coupon-icon-illustration-png.png"
                                    alt="Voucher Icon"
                                  />

                                  <div class="voucher-info mt-0">
                                    {result?.type === "error" ? (
                                      <div className="fw-700 fs-13  mb-1 text-danger">
                                        {/* {result?.message} */}
                                        <div class="voucher-title">
                                          🎁 Already Claimed Bonus!
                                        </div>
                                        <div class="voucher-message">
                                          Enjoy your games and win big! 🎮💰
                                        </div>
                                        {/* <p>Bonus Added Successfully!</p> */}
                                      </div>
                                    ) : (
                                      <>
                                        <div className="fw-700 fs-13 mb-1 text-white">
                                          {/* {result?.message} */}
                                          <div class="voucher-title green_light">
                                            🎉 Congratulations!
                                          </div>
                                          <div class="voucher-message">
                                            🎁 Bonus Added Successfully!
                                          </div>
                                          <p className="fw-400 fs-14 mb-1 text-white">
                                            Your free bonus has been credited —
                                            start playing and win big with
                                            Betwin Namibia! 💎💰
                                          </p>
                                        </div>
                                      </>
                                    )}

                                    <div className="text-center"></div>

                                    {typeof result?.amount !== "undefined" && (
                                      <div
                                        className="fw-bold text-success mb-3"
                                        style={{ fontSize: 22 }}
                                      >
                                        {CURRENCY_SYMBOL}
                                        {new Intl.NumberFormat("en-IN").format(
                                          result.amount
                                        )}
                                      </div>
                                    )}

                                    <Link to={routes.home}>
                                      <span
                                        className="btn text-white green-bg"
                                        onClick={() => setShowModal(false)}
                                      >
                                        Thank You
                                      </span>
                                    </Link>

                                    <div class="footer-note">
                                      For Choosing Betwin Nambia
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* ================================================================================================== */}
                              <img
                                src="https://static.vecteezy.com/system/resources/thumbnails/045/822/274/small/discount-voucher-with-golden-coins-icon-3d-render-concept-of-3d-discount-coupon-icon-illustration-png.png"
                                alt="rupee"
                                className="mb-2 w-75"
                              />

                              {result?.type === "error" ? (
                                <div className="fw-700 fs-13 text-center mb-1 text-danger">
                                  {result?.message}
                                  <p>Bonus Already Claimed!</p>
                                </div>
                              ) : (
                                <>
                                  <div className="fw-400 fs-10 text-center mb-1 text-white">
                                    {/* {result?.message} */}
                                    <p>Bonus Added Successfully!</p>
                                  </div>
                                </>
                              )}

                              {typeof result?.amount !== "undefined" && (
                                <div
                                  className="fw-bold text-success mb-3"
                                  style={{ fontSize: 22 }}
                                >
                                  {CURRENCY_SYMBOL}
                                  {new Intl.NumberFormat("en-IN").format(
                                    result.amount
                                  )}
                                </div>
                              )}

                              <Link to={routes.home}>
                                <span
                                  className="btn text-white green-bg"
                                  onClick={() => setShowModal(false)}
                                >
                                  Thank You
                                </span>
                              </Link>

                              <span className="text-white fs-10 fw-700 mt-3">
                                For Choosing Betwin Nambia
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

const MyClose = ({ closeToast }) => (
  <button onClick={closeToast} className="toaster_close_btn">
    ×
  </button>
);
