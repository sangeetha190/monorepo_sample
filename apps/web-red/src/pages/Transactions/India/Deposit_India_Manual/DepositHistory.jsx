import React, {useContext, useEffect, useState} from "react";
import BASE_URL from "../../../../API/api";
import axios from "axios";
// import { depositHistory } from "../../../../API/depositAPI";
import {depositHistory} from "@core/api/depositAPI";
import {verifyToken} from "../../../../API/authAPI";
// import AuthContext from "../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";

import {toast, ToastContainer} from "react-toastify";
// import StickyHeader from "../../../layouts/Header/Header";
import StickyHeader from "../../../Home/Components/Header/Header";
// import Sidebar from "../../../layouts/Header/Sidebar";
import Sidebar from "../../../Home/Components/Header/Sidebar";
// import axiosInstance from "../../../../API/axiosConfig";
import axiosInstance from "@core/api/axiosConfig";
// import { CURRENCY_SYMBOL } from "../../../../../constants";
import {CURRENCY_SYMBOL} from "@core/constants";
import {useLocation, useNavigate} from "react-router-dom";

const DepositHistory = () => {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const {user, profile} = useContext(AuthContext);
    // console.log("user", user);
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const itemsPerPage = 10;

    //   const [selectedTab, setSelectedTab] = useState("all");
    // const [currentPage, setCurrentPage] = useState(1);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersErr, setOrdersErr] = useState("");
    const [ordersMeta, setOrdersMeta] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });
    // ✅ Moved outside useEffect
    const fetchPlayerData = async () => {
        setLoading(true); // show loading again if retrying

        try {
            const token = user?.token;
            // const token = localStorage.getItem("token"); // 🟢 moved inside try

            // if (!token) {
            //   setError("Authentication error. Please log in again.");
            //   return;
            // }

            // const verify = await verifyToken();
            // if (verify.status !== "success") {
            //   setError("Invalid or expired token. Please login again.");
            //   setHistory([]); // 🟢 clear the old history
            //   return;
            // }

            const response = await depositHistory(token);
            if (response.status === "success") {
                setHistory(response.depositHistory);
                setError(null); // 🟢 clear old errors
                // console.log(response, response);
            } else {
                setError(response.msg || "Failed to load profile");
            }
        } catch (err) {
            // console.log(err, "error message", err.message);
            // toast.error(errorMessage);
            toast.error(`${err.message}. Please log in again to continue.`, {
                toastId: "unauthorized-toast", // prevents duplicate toasts
                onClose: () => {
                    // runs if user clicks X OR after autoClose timeout
                    navigate(location.pathname, {replace: true, state: {}});
                },
            });
            setError(err.message || "Something went wrong. Please try again.");
            setHistory([]); // 🟢 clear old data on error
            // Redirect after a short delay (e.g., 2 seconds)
            setTimeout(() => {
                navigate("/login");
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTab !== "orders list") return;

        const controller = new AbortController();
        async function fetchOrders() {
            try {
                setOrdersLoading(true);
                setOrdersErr("");

                const playerId = user.id;

                const res = await axiosInstance.get("/player/payment-services/a-pay/orders", {
                    params: {player_id: playerId, page: currentPage},
                    headers: user?.token ? {Authorization: `Bearer ${user.token}`} : undefined,
                    signal: controller.signal,
                });

                // Flexible shape handling
                const list = res?.data?.data || res?.data?.orders || res?.data || [];
                setOrders(Array.isArray(list) ? list : []);

                const meta = res?.data?.meta || res?.data?.pagination || {};
                const total = meta?.total ?? list.length;
                const perPage = meta?.per_page ?? meta?.perPage ?? 10;
                const lastPage = meta?.last_page ?? Math.max(1, Math.ceil(total / perPage));

                setOrdersMeta({
                    total,
                    per_page: perPage,
                    current_page: meta?.current_page ?? currentPage,
                    last_page: lastPage,
                });
            } catch (e) {
                if (e?.code === "ERR_CANCELED" || e?.name === "CanceledError") return;
                setOrdersErr(e?.response?.data?.message || e?.message || "Failed to load A-Pay orders.");
            } finally {
                setOrdersLoading(false);
            }
        }

        fetchOrders();
        return () => controller.abort();
    }, [selectedTab, currentPage, user?.token]);

    useEffect(() => {
        const handleFocus = () => {
            fetchPlayerData(); // ✅ Reuse here
        };

        fetchPlayerData(); // ✅ Initial fetch

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    const filteredHistory = history.filter((bet) => {
        if (selectedTab === "all") return true;
        return bet.status === selectedTab;
    });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedData = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    // pagination code starts
    const renderPagination = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }

        return pages.map((page, index) =>
            page === "..." ? (
                <li key={index} className="page-item disabled">
                    <span className="page-link">...</span>
                </li>
            ) : (
                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                    </button>
                </li>
            )
        );
    };

    const fmtINR = (n = 0) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(Number(n || 0));

    const statusBadge = (s) => {
        const v = (s ?? "").toString().trim().toLowerCase();
        if (!v) return "badge bg-secondary";

        if (["success", "paid", "completed"].includes(v)) return "badge bg-success";
        if (["failed", "rejected", "error", "cancelled", "canceled"].includes(v)) return "badge bg-danger";
        if (["processing", "created", "pending", "initiated"].includes(v)) return "badge bg-warning text-dark";

        return "badge bg-secondary";
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}

            <section className="page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}

                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                <div className="pt-3 pb-2">
                                    <div className="row px-2">
                                        {/* <div className="d-flex justify-content-between align-items-center px-0 ">
                <button
                  className="go_back_btn"
                  onClick={() => window.history.back()}
                >
                  <i className="ri-arrow-left-s-line text-white fs-24" />
                </button>
              </div> */}

                                        {/* <div className="d-flex justify-content-between">
                <div className="my-2">
                  <h2 className="text-white fs-20">Deposit History</h2>
                </div>

                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={fetchPlayerData}
                >
                  🔄 Refresh
                </button>
              </div> */}

                                        {/* header Starts */}
                                        <div className="d-flex align-items-center justify-content-between position-relative  px-2">
                                            {/* Back Button on Left */}
                                            <div className="d-flex justify-content-between align-items-center px-2">
                                                {/* <button
                          className="go_back_btn bg-grey"
                          onClick={() => window.history.back()}
                        >
                          <i className="ri-arrow-left-s-line text-white fs-20" />
                        </button> */}
                                            </div>

                                            {/* Centered Title */}
                                            <h5 className="m-0 text-white fs-16">Deposit History</h5>
                                            <div className="d-flex justify-content-between align-items-center px-0">
                                                <button className="go_back_btn bg-grey" onClick={fetchPlayerData}>
                                                    <i class="fa-solid fa-arrows-rotate text-white fs-16"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* header Ends */}
                                        <div className="overflow-auto px-3 mt-4">
                                            <div
                                                className="nav nav-pills flex-nowrap gap-2 scroll-hidden rounded-2"
                                                id="latest-bet-tabs"
                                                style={{overflowX: "auto", whiteSpace: "nowrap"}}
                                            >
                                                {[
                                                    "all",
                                                    "pending",
                                                    "processing",
                                                    "verified",
                                                    "rejected",
                                                    "orders list",
                                                ].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        className={`nav-link latest_bet_btn ${
                                                            selectedTab === tab ? "active" : ""
                                                        }`}
                                                        style={{padding: "2px 12px"}}
                                                        onClick={() => {
                                                            setSelectedTab(tab);
                                                            setCurrentPage(1);
                                                        }}
                                                    >
                                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedTab === "orders list" && (
                                            <div className="mt-3">
                                                {ordersLoading && <p className="text-muted">Loading orders…</p>}

                                                {ordersErr && (
                                                    <div className="alert alert-danger d-flex justify-content-between">
                                                        <span>{ordersErr}</span>
                                                        <button
                                                            className="btn btn-sm btn-outline-light"
                                                            onClick={() => setCurrentPage((p) => p)} // retrigger effect
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                )}

                                                {!ordersLoading && !ordersErr && orders.length === 0 && (
                                                    <div className="text-center p-4 border rounded">
                                                        <div className="mb-2">No orders yet</div>
                                                        <small className="text-muted">
                                                            Your A-Pay orders will appear here.
                                                        </small>
                                                    </div>
                                                )}

                                                {!ordersLoading && !ordersErr && orders.length > 0 && (
                                                    <>
                                                        <div className="table-responsive">
                                                            <table className="table table-dark table-striped align-middle">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Order ID</th>
                                                                        <th>Amount</th>
                                                                        <th>Status</th>
                                                                        {/* <th>Payment Ref</th> */}
                                                                        <th>Created</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {orders.map((o, i) => (
                                                                        <tr key={o.id || o.order_id || i}>
                                                                            <td className="fw-semibold">
                                                                                {o.order_id || o.id || "-"}
                                                                            </td>
                                                                            <td>{fmtINR(o.amount || o.total || 0)}</td>
                                                                            <td>
                                                                                <span className={statusBadge(o.status)}>
                                                                                    {o.status || "—"}
                                                                                </span>
                                                                            </td>
                                                                            {/* <td>
                                        {o.payment_reference ||
                                          o.txn_id ||
                                          o.gateway_ref ||
                                          "—"}
                                      </td> */}
                                                                            <td>
                                                                                {o.created_at
                                                                                    ? new Date(
                                                                                          o.created_at
                                                                                      ).toLocaleString("en-IN", {
                                                                                          hour12: false,
                                                                                      })
                                                                                    : "—"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* Pagination */}
                                                        {ordersMeta?.last_page > 1 && (
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <small className="text-muted">
                                                                    Page {ordersMeta.current_page} of{" "}
                                                                    {ordersMeta.last_page} • Total {ordersMeta.total}
                                                                </small>
                                                                <div className="btn-group">
                                                                    <button
                                                                        className="btn btn-outline-light btn-sm"
                                                                        disabled={currentPage <= 1}
                                                                        onClick={() =>
                                                                            setCurrentPage((p) => Math.max(1, p - 1))
                                                                        }
                                                                    >
                                                                        ‹ Prev
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-light btn-sm"
                                                                        disabled={currentPage >= ordersMeta.last_page}
                                                                        onClick={() =>
                                                                            setCurrentPage((p) =>
                                                                                Math.min(ordersMeta.last_page, p + 1)
                                                                            )
                                                                        }
                                                                    >
                                                                        Next ›
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <div className="tab-content px-3 mt-2 mb-3">
                                            {loading ? (
                                                <p className="text-white text-center mt-4">Loading...</p>
                                            ) : error ? (
                                                <>
                                                    <p className="text-danger text-center mt-3">{error}</p>
                                                    <div className="d-flex align-content-center justify-content-center">
                                                        {/* <button
                              className="btn btn-warning mt-2 w-50"
                              onClick={fetchPlayerData}
                            >
                              Retry
                            </button> */}
                                                        {/* <img
                            src="https://cdni.iconscout.com/illustration/premium/thumb/unauthorized-access-illustration-download-in-svg-png-gif-file-formats--hacker-attack-cyber-intrusion-security-breach-data-pack-crime-illustrations-7706304.png"
                            alt="unauth"
                          /> */}
                                                    </div>
                                                </>
                                            ) : paginatedData.length > 0 ? (
                                                paginatedData.map((bet) => (
                                                    <div className="bet-card" key={bet.id}>
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
                                                                        <i
                                                                            class="fa-solid fa-arrow-down"
                                                                            style={{transform: "rotate(45deg)"}}
                                                                        ></i>
                                                                    </div>
                                                                    {/* ✅ Add margin-start (left) using ms-3 */}
                                                                    <div className="ms-3 ms-sm-2">
                                                                        <p className="mb-0 fs-11">UTR NO</p>
                                                                        <p className="fs-14 mb-0">{bet.utr}</p>
                                                                        <p className="fs-11 mb-0 text-grey mt-2">
                                                                            {new Date(bet.created_date).toLocaleString(
                                                                                "en-GB",
                                                                                {
                                                                                    day: "2-digit",
                                                                                    month: "short",
                                                                                    year: "numeric",
                                                                                }
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="d-flex  align-items-end flex-column">
                                                                    <h4 className="mb-1 amount-fs-size">
                                                                        {CURRENCY_SYMBOL} {bet.amount}
                                                                    </h4>

                                                                    <span
                                                                        className={`fw-bold ${
                                                                            bet.status === "pending"
                                                                                ? "history_badge pending_badge"
                                                                                : bet.status === "verified"
                                                                                ? "history_badge success_badge"
                                                                                : bet.status === "processing"
                                                                                ? "history_badge processing_badge"
                                                                                : "text-danger"
                                                                        }`}
                                                                    >
                                                                        {bet.status}
                                                                    </span>
                                                                    {/* <p className="fs-11 mb-0 text-grey mt-1">
                              {new Date(bet.created_at).toLocaleString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </p> */}
                                                                    <p className="fs-11 mb-0 text-grey mt-1">
                                                                        {new Date(bet.created_date).toLocaleTimeString(
                                                                            "en-US",
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                                hour12: true,
                                                                            }
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* <div>
                          <i class="fa-solid fa-arrow-down"></i>
                        </div>
                        <div className="card-title">
                          <h6>UTR NO</h6>
                          <span>{bet.utr}</span>
                        </div>
                        <ul className="bet-details">
                          <li>
                            <span>Deposit Amt</span>
                            <span>{bet.amount}</span>
                          </li>
                          <li>
                            <span>Status</span>
                            <span
                              className={`fw-bold ${
                                bet.status === "pending"
                                  ? "history_badge pending_badge"
                                  : bet.status === "verified"
                                  ? "history_badge success_badge"
                                  : bet.status === "processing"
                                  ? "history_badge processing_badge"
                                  : "text-danger"
                              }`}
                            >
                              {bet.status}
                            </span>
                          </li>
                        </ul> */}
                                                        </div>

                                                        {/* <div className="d-flex flex-column justify-content-center align-items-center px-2">
                        <div className="text-bold mb-3">Screenshot</div>

                        <div className=" d-flex justify-content-center px-2">
                          <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCHzy2sdDsoabC5DYf5IwEkch1uyaffsXO8w&s"
                            alt="Payment_screenshot"
                            className="w-25"
                          />
                        </div>
                      </div> */}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center mt-4">
                                                    <p className="text-white text-center">No Deposit History Found</p>
                                                </div>
                                            )}
                                            {/* {!loading && totalPages > 1 && (
                  <div className="d-flex justify-content-center my-3">
                    <button
                      className="btn btn-sm btn-outline-light mx-1"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      ⬅ Prev
                    </button>
                    <span className="text-white mx-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-light mx-1"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next ➡
                    </button>
                  </div>
                )} */}

                                            {/* test 2 Starts final */}
                                            {/* {!loading && totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center my-3 gap-3">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      ⬅ Prev
                    </button>

                    <ul className="pagination justify-content-center my-3">
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next ➡
                    </button>
                  </div>
                )}{" "} */}
                                            {/* test 2 Ends */}
                                            {!loading && !error && totalPages > 1 && (
                                                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 my-3">
                                                    {/* Prev Button */}
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        style={
                                                            currentPage === 1
                                                                ? {}
                                                                : {background: "#505050", color: "white"}
                                                        }
                                                    >
                                                        ⬅ Prev
                                                    </button>

                                                    {/* Page Numbers */}
                                                    <ul className="pagination mb-0">{renderPagination()}</ul>

                                                    {/* Next Button */}
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() =>
                                                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                                        }
                                                        disabled={currentPage === totalPages}
                                                        style={
                                                            currentPage === totalPages
                                                                ? {}
                                                                : {background: "#505050", color: "white"}
                                                        }
                                                    >
                                                        Next ➡
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DepositHistory;
