import React, {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import routes from "../../../../routes/routes";
// import routes from "../../routes/route";
import Skeleton, {SkeletonTheme} from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Footer = () => {
    const [activeItem, setActiveItem] = useState("");
    const [loading, setLoading] = useState(true); // 👈 Loading state
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const search = location.search;
        const params = new URLSearchParams(search);
        const type = params.get("type");

        if (type === "card") {
            setActiveItem("unique-spribe");
        } else if (path === routes.home) {
            setActiveItem("unique-home");
        } else if (path === routes.games.topGames || path === routes.games.filteredGames) {
            setActiveItem("unique-games");
        } else if (path === routes.games.providers) {
            setActiveItem("unique-providers");
        } else if (path === routes.pages.menu) {
            setActiveItem("unique-settings");
        } else {
            setActiveItem("");
        }

        // ⏳ Simulate load delay
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [location]);

    const footerItems = [
        {
            id: "unique-home",
            route: routes.home,
            icon: "/assets/img/footer/home.png",
            label: "Home",
        },
        {
            id: "unique-games",
            route: routes.games.topGames,
            icon: "/assets/img/footer/search_1.png",
            label: "Search",
        },
        {
            id: "unique-spribe",
            route: "/filtered-games?type=card",
            icon: "/assets/img/footer/casino_1.png",
            label: "Casino",
        },
        {
            id: "unique-providers",
            route: routes.games.providers,
            icon: "/assets/img/footer/game (1).png",
            label: "Provider",
        },
        {
            id: "unique-settings",
            route: routes.pages.menu,
            icon: "/assets/img/footer/app.png",
            label: "Menu",
        },
    ];

    return (
        <SkeletonTheme baseColor="#313131" highlightColor="#525252">
            <div className="unique-footer container  tab_menu_show" style={{bottom: 0}}>
                <ul>
                    {footerItems.map((item) => (
                        <li
                            key={item.id}
                            id={item.id}
                            className={`footer-item ${activeItem === item.id ? "active" : ""}`}
                        >
                            <Link to={item.route}>
                                <div className="d-flex flex-column align-items-center">
                                    {loading ? (
                                        <Skeleton circle width={27} height={27} />
                                    ) : (
                                        <img src={item.icon} alt={item.label} width="27px" />
                                    )}
                                    {loading ? (
                                        <Skeleton height={10} width={40} className="mt-1" />
                                    ) : (
                                        <p className={activeItem === item.id ? "menu-active" : "menu"}>{item.label}</p>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </SkeletonTheme>
    );
};

export default Footer;
