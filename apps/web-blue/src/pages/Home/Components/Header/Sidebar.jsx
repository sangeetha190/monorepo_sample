import {useState} from "react";
import {Link, NavLink} from "react-router-dom";
import routes from "../../../../routes/routes";

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <>
            <nav className={`sidebar sidebar-offcanvas ${isSidebarOpen ? "open" : ""}`} id="sidebar">
                <ul className="nav">
                    <li className="nav-item">
                        <NavLink to={routes.home} className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}>
                            <span className="menu-title">Home</span>
                            {/* <i className="fi fi-sr-home menu-icon" /> */}
                            {/* <i class="fi fi-br-home menu-icon"></i> */}
                            <i class="fi fi-ss-house-crack menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to={routes.games.topGames}
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">All Games</span>
                            {/* <i className="fi fi-sr-dice-alt menu-icon" /> */}

                            {/* <i class="fi fi-rs-console-controller menu-icon"></i>
              <i class="fi fi-sr-console-controller"></i> */}
                            <i class="fi fi-ss-basketball menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/filtered-games?type=card"
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">Live Casino</span>
                            {/* <i className="fi fi-rr-playing-cards menu-icon" /> */}
                            <i class="fi fi-sr-club menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/filtered-games?type=crash"
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">Crash Games</span>
                            {/* <i className="fa-solid fa-explosion menu-icon"></i> */}
                            <i class="fi fi-ss-rocket-lunch menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to={routes.games.providers}
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">Providers</span>
                            {/* <i className="fi fi-rs-clipboard menu-icon" /> */}
                            <i class="fi fi-sr-dice-d10 menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to={routes.transactions.kazang_how_to_deposit}
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">How To Deposit</span>
                            {/* <i className="fi fi-rs-memo-pad menu-icon" /> */}
                            {/* <i class="fi fi-ss-deposit-alt menu-icon"></i> */}
                            <i class="fi fi-sr-expense menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to={routes.pages.terms}
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">Terms and Conditions</span>
                            {/* <i className="fi fi-rs-memo-pad menu-icon" /> */}
                            {/* <i class="fi fi-ss-journal-alt menu-icon"></i> */}
                            <i class="fi fi-ss-memo-pad menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to={routes.pages.howToPlay}
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">How to Play</span>
                            {/* <i className="fi fi-rr-interrogation menu-icon" /> */}
                            <i class="fi fi-ss-interrogation menu-icon"></i>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to={routes.pages.privacyPolicy}
                            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span className="menu-title">Privacy and policy</span>
                            {/* <i className="fi fi-rs-clipboard menu-icon" /> */}
                            {/* <i class="fi fi-sr-notebook menu-icon"></i> */}
                            {/* <i class="fi fi-sr-game-rules"></i> */}
                            <i class="fi fi-ss-memo-pad menu-icon"></i>
                        </NavLink>
                    </li>
                </ul>
                <div className="br-top-gray"></div>
                <div className="min-menunone">
                    <div className="container px-5">
                        <Link to={routes.games.all}>
                            <button
                                type="button"
                                className="btn swiper-scrollbar-drag w-100 bgbody-color text-white rounded-pill fs-15 fw-500"
                            >
                                All Games
                            </button>
                        </Link>
                    </div>
                    <div className="text-center  bottom-0 w-100 my-3 start-0">
                        <div className="icon-social">
                            <div className="d-flex justify-content-center  text-white fs-25 gap-3">
                                <Link to="#" target="new" className="text-white">
                                    <i className="ri-facebook-fill" />
                                </Link>
                                <Link to={"#"} target="new" className="text-white">
                                    <i className="ri-instagram-line" />
                                </Link>

                                <Link to={"#"} target="new" className="text-white">
                                    <i className="ri-twitter-x-line" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
