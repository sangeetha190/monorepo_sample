import React, {useContext, useEffect, useMemo, useState} from "react";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import {verifyToken} from "../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
import {ToastContainer} from "react-toastify";
import PaginatedData from "../Pagination/PaginatedData";
// import {betStatement} from "../../API/betHistory";
import {betStatement} from "@core/api/betHistory";
// import StickyHeader from "./Header/Header";
import StickyHeader from "../Home/Components/Header/Header";
// import Sidebar from "./Header/Sidebar";
import Sidebar from "../Home/Components/Header/Sidebar";
// import {CURRENCY_SYMBOL} from "../../constants";
import {CURRENCY_SYMBOL} from "@core/constants";

const BetHistory = () => {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("all"); // Tabs for "All", "Credits", "Debits"
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const itemsPerPage = 10;

    // const totalPages = Math.ceil(
    //   history.filter((entry) =>
    //     selectedTab === "all" ? true : entry.status === selectedTab
    //   ).length / itemsPerPage
    // );
    const {user} = useContext(AuthContext);
    const token = user?.token;

    const fetchPlayerData = async (page = 1) => {
        setLoading(true);
        try {
            // const verify = await verifyToken();
            // if (verify.status !== "success") {
            //   throw new Error("Session expired. Please login again.");
            // }

            const response = await betStatement(token, page);

            if (response.status === "success" && Array.isArray(response.statements)) {
                setHistory(response.statements);
                setTotalPages(response.pagination?.total_page || 1);
                setCurrentPage(response.pagination?.current_page || 1);
                setError(null);
            } else {
                throw new Error(response.msg || "Failed to load data.");
            }
        } catch (err) {
            // console.error("Error fetching data:", err);
            setError(err.message);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPlayerData();
        const handleFocus = () => {
            fetchPlayerData();
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    // ✅ Filter transactions based on selected tab
    const filteredHistory = useMemo(() => {
        return history.filter((transaction) => {
            if (selectedTab === "all") return true;
            if (selectedTab === "credit") return transaction.type === "CR";
            if (selectedTab === "debit") return transaction.type === "DR";
            return false;
        });
    }, [history, selectedTab]);
    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}

            {/* <StickyHeader /> */}

            <div className="container-fluid page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}
                <div className="main-panel overflow-hidden">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                <div className="pt-3 pb-2">
                                    <div className="row px-2">
                                        {/* <div className="d-flex justify-content-between align-items-center px-0">
                <button
                  className="go_back_btn"
                  onClick={() => window.history.back()}
                >
                  <i className="ri-arrow-left-s-line text-white fs-24" />
                </button>
              </div>
              <div className="my-2">
                <div className="text-white fs-20">Bet History</div>
              </div> */}

                                        {/* header Starts */}
                                        <div className="d-flex align-items-center justify-content-between position-relative  px-2">
                                            {/* Back Button on Left */}
                                            <div className="d-flex justify-content-between align-items-center px-0">
                                                <button
                                                    className="go_back_btn bg-grey"
                                                    onClick={() => window.history.back()}
                                                >
                                                    <i className="ri-arrow-left-s-line text-white fs-20" />
                                                </button>
                                            </div>

                                            {/* Centered Title */}
                                            <h5 className="m-0 text-white fs-16"> Transaction History</h5>
                                            <div className="d-flex justify-content-between align-items-center px-0">
                                                <button className="go_back_btn bg-grey" onClick={fetchPlayerData}>
                                                    <i class="fa-solid fa-arrows-rotate text-white fs-16"></i>
                                                </button>
                                            </div>
                                        </div>
                                        {/* header Ends */}

                                        {/* ✅ Tabs Section */}
                                        <div className="overflow-auto px-3 mt-4">
                                            <div
                                                className="nav nav-pills flex-wrap"
                                                id="transaction-tabs"
                                                style={{
                                                    overflowX: "auto",
                                                    whiteSpace: "nowrap",
                                                    // background: "#192432",
                                                }}
                                            >
                                                {["all", "credit", "debit"].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        className={`nav-link latest_bet_btn ${
                                                            selectedTab === tab ? "active" : ""
                                                        }`}
                                                        style={{padding: "2px 12px"}}
                                                        onClick={() => setSelectedTab(tab)}
                                                    >
                                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ✅ Display Filtered Transactions */}
                                        <div className="tab-content px-3 mt-3 mb-3">
                                            {loading ? (
                                                <p className="text-white text-center mt-4">Loading...</p>
                                            ) : error ? (
                                                <>
                                                    <p className="text-danger text-center">{error}</p>
                                                    <div className="d-flex flex-column align-items-center">
                                                        {/* <button
                              className="btn btn-warning mt-2 w-50"
                              onClick={fetchPlayerData}
                            >
                              Retry
                            </button> */}
                                                        {/* <img
                              src="assets/img/notification/img_2.png"
                              alt="unauth"
                              className="w-75"
                            /> */}
                                                    </div>
                                                </>
                                            ) : filteredHistory.length > 0 ? (
                                                filteredHistory.map((transaction) => (
                                                    <div className="bet-card" key={transaction.id}>
                                                        <div
                                                            className="mybet-single-card"
                                                            style={{
                                                                padding: "15px 11px 6px",
                                                                marginTop: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex justify-content-between">
                                                                <div className="d-flex justify-content-center align-items-center">
                                                                    <div className="bg-secondary py-2 px-3 rounded-2">
                                                                        {transaction.type === "DR" ? (
                                                                            <i
                                                                                class="fa-solid fa-arrow-up"
                                                                                style={{transform: "rotate(45deg)"}}
                                                                            ></i>
                                                                        ) : (
                                                                            <i
                                                                                class="fa-solid fa-arrow-down"
                                                                                style={{transform: "rotate(45deg)"}}
                                                                            ></i>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex align-items-end flex-column">
                                                                    <h4 className="mb-1 amount-fs-size">
                                                                        {/* {transaction.id} */}
                                                                        {transaction.type === "DR"
                                                                            ? `${CURRENCY_SYMBOL} ${Number(
                                                                                  transaction?.amount ?? 0
                                                                              ).toFixed(2)}`
                                                                            : `${CURRENCY_SYMBOL} ${Number(
                                                                                  transaction?.amount ?? 0
                                                                              ).toFixed(2)}`}
                                                                    </h4>

                                                                    <span
                                                                        className={`fw-bold ${
                                                                            transaction.type === "DR"
                                                                                ? "history_badge badge_danger"
                                                                                : "history_badge success_badge"
                                                                        }`}
                                                                    >
                                                                        {transaction.type === "DR"
                                                                            ? " Debit"
                                                                            : "Credit"}
                                                                    </span>
                                                                    <p className="fs-11 mb-0 text-grey mt-0">
                                                                        {new Date(
                                                                            transaction.created_at
                                                                        ).toLocaleString("en-GB", {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-white">No Transaction History Found</p>
                                            )}

                                            {!loading && !error && totalPages > 1 && filteredHistory.length > 0 && (
                                                <PaginatedData
                                                    totalPages={totalPages}
                                                    currentPage={currentPage}
                                                    setCurrentPage={(page) => {
                                                        setCurrentPage(page);
                                                        fetchPlayerData(page);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <BottomFooter /> */}
            {/* <Footer /> */}
        </div>
    );
};

export default BetHistory;
