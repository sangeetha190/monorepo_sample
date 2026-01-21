import React, {useContext, useEffect, useRef, useState} from "react";
// import Footer from "../footer/Footer";
import Footer from "../Home/Components/Footer/Footer";
import {toast, ToastContainer} from "react-toastify";
// import StickyHeader from "./Header";
import StickyHeader from "../Home/Components/Header/Header";

import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
// import BASE_URL from "../../../API/api";
import BASE_URL from "@core/api/api";

// import {Images} from "./constants/images";
import {Images} from "@core/constants/images";
// import routes from "../../routes/route";
import routes from "../../routes/routes";
// import Sidebar from "./Sidebar";
import Sidebar from "../Home/Components/Header/Sidebar";
// import {getIsMobileParam} from "../../../hooks/homePageApi";
import {getIsMobileParam} from "@core/hooks/homePageApi";
// import AuthContext from "../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";

const FilteredProviderGamesPage = () => {
    const [games, setGames] = useState([]);
    const [filterType, setFilterType] = useState(null);
    const [selectedGameUrl, setSelectedGameUrl] = useState(null);
    const [showFullScreenGame, setShowFullScreenGame] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLaunchingGame, setIsLaunchingGame] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const iframeRef = useRef(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const {fetchUser, user} = useContext(AuthContext);

    // ✅ Fetch games when URL changes (provider param)
    useEffect(() => {
        const provider = searchParams.get("provider");
        if (provider) {
            setFilterType(provider);
            fetchFilteredGames(provider);
        }
    }, [searchParams]);

    // ✅ Fetch games using provider filter
    const fetchFilteredGames = async (provider) => {
        try {
            setLoading(true);
            const isMobileParam = getIsMobileParam();

            const response = await axios.get(`${BASE_URL}/all-games?is_mobile=${isMobileParam}`, {
                params: {provider},
            });
            setGames(response.data.allGames);
        } catch (error) {
            console.error("Error fetching filtered games:", error);
            toast.error("Something went wrong while filtering games.");
        } finally {
            setLoading(false);
        }
    };

    // // ✅ Handle game click
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
    //           return_url: `${window.location.origin}/all-games?is_mobile=${isMobileParam}`,
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
    //     toast.error("Game launch failed. Try again later.");
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

    // ✅ Auto-close iframe when removed
    useEffect(() => {
        let interval;
        if (showFullScreenGame && selectedGameUrl) {
            interval = setInterval(() => {
                const frame = iframeRef.current;
                if (!document.body.contains(frame)) {
                    setShowFullScreenGame(false);
                    setSelectedGameUrl(null);
                    if (filterType) fetchFilteredGames(filterType);
                    clearInterval(interval);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showFullScreenGame, selectedGameUrl, filterType]);

    const RETURN_URL_KEY = "returnUrl";

    const navigateToSavedReturnUrl = React.useCallback(() => {
        const target = sessionStorage.getItem(RETURN_URL_KEY) || "/";

        // Strip origin so React Router can handle it
        const origin = window.location.origin;
        const toPath = target.startsWith(origin) ? target.slice(origin.length) : target;

        // If we’re already at that path+query, just close overlay; don’t navigate again
        const here = window.location.pathname + window.location.search;
        const url = new URL(target, origin);
        const there = url.pathname + url.search;
        if (here === there) return;

        navigate(toPath, {replace: true}); // soft navigate (no full reload)
    }, [navigate]);

    // back btn setup starts
    const buildReturnUrl = (location) => {
        const base = import.meta?.env?.BASE_URL || process.env.PUBLIC_URL || "";
        const baseTrim = base.replace(/\/$/, "");
        const path = `${baseTrim}${location.pathname}${location.search || ""}`;
        return new URL(path, window.location.origin).toString();
    };

    // back btn / overlay state (OUTSIDE the function)
    const [showModal, setShowModal] = useState(false);
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

            const gameUrl = response.data?.game?.gameUrl || response.data?.game_url;
            if (gameUrl) {
                // (optional)
                sessionStorage.setItem("prevPage", location.pathname + location.search);

                // push state so Back triggers our popstate handler
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
            console.error("Error launching game:", error);
            toast.error("Game launch failed. Try again later.");
        }
    };
    // back btn setup Ends
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
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}

            <div className="container-fluid page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}
                {/* 🔍 Search Bar */}

                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="game-list px-2 container">
                                <h5 className="text-white text-capitalize my-2">
                                    {filterType ? `${filterType} Games` : "Games"}
                                </h5>

                                <div className="">
                                    <div className="row px-2">
                                        {loading ? (
                                            <p className="text-white text-center">🎮 Loading games...</p>
                                        ) : games.length > 0 ? (
                                            // .filter((game) => game.image)
                                            games.map((game) => (
                                                <div
                                                    className="col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 px-1 col-custom-3"
                                                    key={game.uuid}
                                                >
                                                    <div
                                                        className="game-card-wrapper rounded-2 new-cardclr mt-2 hover-group"
                                                        onClick={() => handleGameClick(game)}
                                                    >
                                                        <div className="game-card position-relative p-0 m-0 overflow-hidden">
                                                            <img
                                                                src={
                                                                    game.image && game.image !== ""
                                                                        ? game.image
                                                                        : "assets/img/play_now.png"
                                                                }
                                                                className="w-100 m-0"
                                                                alt={game.name}
                                                            />

                                                            {/* <h3>{game.name}</h3> */}
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
                                                </div>
                                            ))
                                        ) : (
                                            <div className="d-flex flex-column align-items-center mt-5">
                                                <img
                                                    src="assets/img/notification/img_2.png"
                                                    alt="unauth"
                                                    className="w-25"
                                                />
                                                <p className="text-white text-center">No games available.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                        className="navbar py-1 navbar-dark bg-black sticky-top shadow-sm d-flex align-items-center"
                                        style={{height: "5%"}}
                                    >
                                        <div className="container-fluid d-flex align-items-center">
                                            <button
                                                className="btn btn-index w-100 deposit-btn text-white py-2"
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
                                    className="flex-grow-1 d-flex justify-content-center align-items-center"
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
                                                    <h5 className="modal-title fs-2 text-warning mb-3">Go Back?</h5>
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
                        <div className="" style={{marginTop: "100px"}}></div>
                        <Footer />
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilteredProviderGamesPage;
