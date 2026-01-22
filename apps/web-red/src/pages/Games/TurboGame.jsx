import React, {useContext, useEffect, useRef, useState} from "react";
// import BASE_URL from "../../API/api";
import BASE_URL from "@core/api/api";
import {useNavigate} from "react-router-dom";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import {toast, ToastContainer} from "react-toastify";
// import StickyHeader from "./Header/Header";
import StickyHeader from "../Home/Components/Header/Header";
// import Footer from "./footer/Footer";
import Footer from "../Home/Components/Footer/Footer";
import {motion} from "framer-motion"; // ✅ Import motion
import axios from "axios";
// import axiosInstance from "../../API/axiosConfig";
import axiosInstance from "@core/api/axiosConfig";

const TurboGame = () => {
    // const [types, setTypes] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFullScreenGame, setShowFullScreenGame] = useState(false);
    const [selectedGameUrl, setSelectedGameUrl] = useState(null);
    const [isLaunchingGame, setIsLaunchingGame] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const iframeRef = useRef(null);
    const {user} = useContext(AuthContext);
    const token = user?.token;

    const navigate = useNavigate();

    // Fetch Providers
    useEffect(() => {
        fetchAllGames();
    }, []);

    // Search Filter
    const filteredGames = games.filter(
        (game) => game.key && game.key.toLowerCase().includes((searchTerm || "").toLowerCase())
    );
    // Fetch All Games
    const fetchAllGames = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/turbo-games`);
            // const data = await response.json();
            const data = response.data;

            // await verifyToken(token); // Verify token (optional usage)

            // console.log(data.turboGames);

            setGames(data.turboGames || []);
        } catch (error) {
            // console.error("Error fetching all games:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Game Click
    const handleGameClick = async (game) => {
        if (!game.key) {
            toast.error("Missing game info.");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            setIsLaunchingGame(true); // ✅ Show loading screen

            const response = await axios.get(`${BASE_URL}/player/turbo/${game.key}`, {
                params: {return_url: window.location.origin}, // 👈 dynamic base URL },
                headers: {Authorization: `Bearer ${token}`},
            });
            const gameUrl = response.data.gameUrl || response.data?.game_url;
            if (gameUrl) {
                setSelectedGameUrl(gameUrl);
                setShowFullScreenGame(true);
            } else {
                toast.error("Failed to get game URL.");
            }
        } catch (error) {
            setIsLaunchingGame(false);

            // Check for 401 or unauthenticated message
            const errMsg = error.response?.data?.message;

            if (errMsg === "Unauthenticated." || error.response?.status === 401) {
                toast.error("Please login to jump into the Game World! 🎮🚀", {
                    toastId: "unauthenticated",
                });

                // Clear token if any
                localStorage.removeItem("token");

                // Redirect after a short delay (e.g., 2 seconds)
                setTimeout(() => {
                    navigate("/login");
                }, 8000);
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

            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            <StickyHeader />

            <div className="container">
                {showFullScreenGame && selectedGameUrl ? (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "#000",
                            zIndex: 9999,
                        }}
                    >
                        <iframe
                            ref={iframeRef}
                            src={selectedGameUrl}
                            title="Game"
                            style={{width: "100%", height: "100%", border: "none"}}
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <>
                        {/* Search Box */}
                        <div className="search_container_box">
                            <form className="form my-2">
                                <button type="submit">
                                    <i className="ri-search-2-line fs-18" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Search games..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="my-3 input text-white"
                                />
                                <button className="reset" type="reset"></button>
                            </form>
                        </div>

                        {/* Game Types Scroll */}

                        {/* Games List */}
                        <h5>Turbo Games</h5>

                        <div className="row">
                            {loading ? (
                                <p className="text-white text-center mt-5">🎮 Loading games...</p>
                            ) : filteredGames.length > 0 ? (
                                filteredGames
                                .filter((game) => game.imagePath)
                                .map((game, index) => (
                                    <motion.div
                                        className="col-md-4 col-sm-4 col-4 px-1"
                                        key={game.imagePath}
                                        initial={{opacity: 0, scale: 0.8}}
                                        animate={{opacity: 1, scale: 1}}
                                        transition={{duration: 0.4, delay: index * 0.1}}
                                    >
                                        <div className="game-card-wrapper rounded-2 new-cardclr mt-2">
                                            <div className="game-card p-0 m-0 p-1">
                                                <img
                                                    src={game.imagePath}
                                                    className="game-card-img"
                                                    alt={game.imagePath}
                                                />
                                                <div className="d-flex flex-column text-white text-center py-2 px-1">
                                                    <span className="fs-12 fw-bold text-truncate">{game.key}</span>
                                                </div>
                                            </div>
                                            <div className="game-play-button d-flex flex-column">
                                                <div className="btn-play" onClick={() => handleGameClick(game)}>
                                                    <i className="fa-solid fa-play"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="d-flex flex-column align-items-center mt-5">
                                    <img src="assets/img/notification/img_2.png" alt="unauth" className="w-75" />
                                    <p className="text-white text-center">No games available.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* Bottom Footer */}
            {/* <BottomFooter /> */}

            <div className="" style={{marginTop: "100px"}}></div>
            <Footer />
        </>
    );
};

export default TurboGame;
