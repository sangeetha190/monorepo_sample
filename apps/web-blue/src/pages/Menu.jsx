import React, {useContext, useState} from "react";
import routes from "../routes/routes";
import {Link, NavLink, useNavigate} from "react-router-dom";
import StickyHeader from "../pages/Home/Components/Header/Header";
import Footer from "../pages/Home/Components/Footer/Footer";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";

const Menu = () => {
    const {user, logout} = useContext(AuthContext);
    const [show, setShow] = useState(false);
    const navigate = useNavigate(); // useNavigate hook for redirection
    const handleLogout = async () => {
        await logout(navigate);
    };
    return (
        <div>
            <StickyHeader />
            <div className="container">
                <div className="offcanvas-header d-flex justify-content-between py-2">
                    <h5 className="offcanvas-title fs-24 mx-2" id=" menuOffcanvaLabel">
                        Menu
                    </h5>
                    {/* <button
            type="button"
            className="btn off_canvas_close_btn me-1 bg-white rounded"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            <i className="ri-close-large-line text-white fs-17" />
          </button> */}
                </div>

                <div className="offcanvas-body">
                    <NavLink to={routes.home} className={({isActive}) => (isActive ? "active-menu" : "")}>
                        <div className="d-flex align-items-center menu_list_item justify-content-between">
                            <div>
                                <img src="assets/img/SIDEMENU/home.png" alt="menu" width={24} />
                                <span className="mx-3 text-white">Home</span>
                            </div>
                        </div>
                    </NavLink>
                    <NavLink to={routes.games.topGames}>
                        <div className="d-flex align-items-center menu_list_item justify-content-between">
                            <div className="">
                                <img src="assets/img/SIDEMENU/club.png" alt="menu" srcSet="" width={24} />
                                <span className="mx-3 text-white">All Games</span>
                            </div>
                        </div>
                    </NavLink>

                    <NavLink to={routes.games.providers}>
                        <div className="d-flex align-items-center menu_list_item justify-content-between">
                            <div className="">
                                <img src="assets/img/SIDEMENU/club.png" alt="menu" srcSet="" width={24} />
                                <span className="mx-3 text-white">Providers</span>
                            </div>
                        </div>
                    </NavLink>
                    {/*--accordion--*/}

                    {/* <div className="accordion accordion_sec" id="accordionExample">
            <div className="accordion-item game_title_accordion_item"> */}
                    {/* <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed game_title_btn"
                  type="button"
                  // data-bs-toggle="collapse"
                  // data-bs-target="#collapseOne"
                  // aria-expanded="true"
                  // aria-controls="collapseOne"
                >
                  <img
                    src="assets/img/SIDEMENU/chart-mixed-up-circle-dollar.png"
                    alt="circle_dollar"
                    srcSet=""
                    width={24}
                  />
                  <span className="mx-3 text-white">Trending Game</span>
                </button>
              </h2> */}
                    {/* <div
                id="collapseOne"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionExample"
              > */}
                    {/* <NavLink to={routes.games.spribe}>
                  <div className="accordion-body game_items_accordion">
                    <div className="d-flex align-items-center game_items_accordion_list">
                      <div className="">
                        <img
                          src="assets/img/two-arrows.png"
                          alt="two_arrows"
                          srcSet=""
                          width={22}
                        />
                      </div>
                      <span className="mx-3 text-white">Spribe</span>
                    </div>
                  </div>
                </NavLink> */}

                    {/* <NavLink to={routes.games.turbo}>
                  <div className="accordion-body game_items_accordion">
                    <div className="d-flex align-items-center game_items_accordion_list">
                      <div className="">
                        <img
                          src="assets/img/two-arrows.png"
                          alt=""
                          srcSet=""
                          width={22}
                        />
                      </div>
                      <span className="mx-3 text-white">Turbo Games</span>
                    </div>
                  </div>
                </NavLink> */}

                    {/* <NavLink to={routes.games.all}>
                  <div className="accordion-body game_items_accordion">
                    <div className="d-flex align-items-center game_items_accordion_list">
                      <div className="">
                        <img
                          src="assets/img/two-arrows.png"
                          alt="two-arrows"
                          srcSet=""
                          width={22}
                        />
                      </div>
                      <span className="mx-3 text-white">Slotegrator</span>
                    </div>
                  </div>
                </NavLink> */}
                    {/* </div> */}
                    {/* </div>
          </div> */}
                    {/*--accordion end--*/}
                    <div className="menu">
                        {/* Main */}
                        <Link to={routes.pages.howToPlay}>
                            <div className="d-flex align-items-center menu_list_item justify-content-between">
                                <div>
                                    <img src="assets/img/SIDEMENU/mode-portrait.png" alt="mode" srcSet="" width={24} />
                                    {/* Icon for "Main" */}
                                    <span className="mx-3 text-white">How to Play</span>
                                </div>
                                {/* 
<div class="icon-box">
<i class="ri-arrow-right-s-line text-white"></i>
</div>
*/}
                            </div>
                        </Link>

                        {/* how to deposit */}
                        <Link to={routes.transactions.kazang_how_to_deposit}>
                            <div className="d-flex align-items-center menu_list_item justify-content-between">
                                <div>
                                    <img src="assets/img/SIDEMENU/deposit.png" alt="deposit" srcSet="" width={24} />
                                    {/* Icon for "Main" */}
                                    <span className="mx-3 text-white">How to Deposit</span>
                                </div>
                                {/* 
<div class="icon-box">
<i class="ri-arrow-right-s-line text-white"></i>
</div>
*/}
                            </div>
                        </Link>

                        {/* LIVE */}
                        <Link to={routes.pages.terms}>
                            <div className="d-flex align-items-center menu_list_item justify-content-between">
                                <div>
                                    <img src="assets/img/SIDEMENU/deposit.png" alt="deposit" srcSet="" width={24} />
                                    {/* Icon for "LIVE" */}
                                    <span className="mx-3 text-white">Terms &amp; Conditions</span>
                                </div>
                                {/* <div class="icon-box">
<i class="ri-arrow-right-s-line text-white"></i>
</div> */}
                            </div>
                        </Link>
                        {/* LIVE */}
                        {/* <Link to={routes.games.bonus}>
              <div className="d-flex align-items-center menu_list_item justify-content-between">
                <div>
                  <img
                    src="assets/img/icons/gift.png"
                    alt="gift"
                    srcSet=""
                    width={24}
                  />
                  <span className="mx-3 text-white">Bonus</span>
                </div>
              </div>
            </Link> */}
                        {/* Sports */}
                        <Link to={routes.pages.privacyPolicy}>
                            <div className="d-flex align-items-center menu_list_item justify-content-between">
                                <div>
                                    <img
                                        src="assets/img/SIDEMENU/money-from-bracket.png"
                                        alt="bracket"
                                        srcSet=""
                                        width={24}
                                    />
                                    {/* Existing "Sports" Icon */}
                                    <span className="mx-3 text-white">Privacy Policy</span>
                                </div>
                                {/* <div class="icon-box">
<i class="ri-arrow-right-s-line text-white"></i>
</div> */}
                            </div>
                        </Link>
                        {/* Cricket */}
                        {/* <div className="d-flex align-items-center menu_list_item justify-content-between">
              <div>
                <img
                  src="assets/img/SIDEMENU/settings.png"
                  alt="Setting"
                  srcSet=""
                  width={24}
                />
                Icon for "Cricket"
                <span className="mx-3 text-white">Settings</span>
              </div>
            </div> */}

                        {user && (
                            <div className="d-flex align-items-center menu_list_item justify-content-between">
                                <div onClick={handleLogout} style={{cursor: "pointer"}}>
                                    <img
                                        src="assets/img/SIDEMENU/address-card.png"
                                        alt="address_card"
                                        srcSet=""
                                        width={24}
                                    />
                                    <span className="mx-3 text-white">Logout</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Menu;
