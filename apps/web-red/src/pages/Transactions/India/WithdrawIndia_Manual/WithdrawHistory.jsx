import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../../API/api";
import AuthContext from "../../../../Auth/AuthContext";
import { withdrawHistoryPage } from "../../../../API/withdrawAPI";
import { toast, ToastContainer } from "react-toastify";
import PaginatedData from "../../Pagination/PaginatedData";
import StickyHeader from "../../../layouts/Header/Header";
import Sidebar from "../../../layouts/Header/Sidebar";
import { CURRENCY_SYMBOL } from "../../../../../constants";
import { useLocation, useNavigate } from "react-router-dom";

const WithdrawHistory = () => {
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const location = useLocation();
  const totalPages = Math.ceil(
    withdrawHistory.filter((entry) =>
      selectedTab === "all" ? true : entry.status === selectedTab
    ).length / itemsPerPage
  );
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const fetchWithdrawHistory = async () => {
    setLoading(true);
    try {
      // const verify = await verifyToken();
      // if (verify.status !== "success") {
      //   setError("Invalid or expired token. Please login again.");
      //   setWithdrawHistory([]);
      //   return;
      // }

      const response = await withdrawHistoryPage(token);
      // console.log(response);

      if (
        response.status === "success" &&
        Array.isArray(response.withdrawHistory)
      ) {
        setWithdrawHistory(response.withdrawHistory);
        setError(null);
      } else {
        setError(response.msg || "Failed to load withdraw history.");
      }
    } catch (err) {
      // console.error("Error fetching withdrawal history:", err);
      toast.error(`${err.message}. Please log in again to continue.`, {
        toastId: "unauthorized-toast",
        onClose: () => {
          // runs if user clicks X OR after autoClose timeout
          navigate(location.pathname, { replace: true, state: {} });
        },
      });
      setError(err.message || "Something went wrong. Please try again.");
      setWithdrawHistory([]);
      // Redirect after a short delay (e.g., 2 seconds)
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawHistory();

    const handleFocus = () => {
      fetchWithdrawHistory();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const filteredHistory = withdrawHistory.filter((entry) =>
    selectedTab === "all" ? true : entry.status === selectedTab
  );

  const handleWithdrawCancel = async (withdraw_id) => {
    try {
      const response = await axios.get(`${BASE_URL}/player/cancel-withdraw`, {
        params: { withdraw_id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        // console.log(response.data.msg);

        // alert("Withdrawal cancelled successfully ✅", response.data.msg);
        toast.success(`${response.data.msg}`);
        await fetchWithdrawHistory();
      } else {
        alert(response.data.message || "Failed to cancel withdrawal ❌");
      }
    } catch (error) {
      // console.error("Cancel withdraw error:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    }
  };

  return (
    <div>
      {/* header  */}
      <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {/* header end */}
      {/* <ToastContainer position="top-right" autoClose={5000} theme="dark" /> */}
      <section className="container-fluid page-body-wrapper">
        {/* Sidebar Nav Starts */}
        <Sidebar />
        {/* Sidebar Nav Ends */}

        <div className="main-panel">
          <div className="content-wrapper">
            <div className="max-1250 mx-auto">
              <div className="h-100">
                <div className="pt-3 pb-2">
                  <div className="row px-2">
                    {/*
            <div className="d-flex align-items-center position-relative py-2 px-0">
           
                <div className="d-flex justify-content-between align-items-center px-0">
                  <button
                    className="go_back_btn"
                    onClick={() => window.history.back()}
                  >
                    <i className="ri-arrow-left-s-line text-white fs-20" />
                  </button>
                </div>

                
                <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16">
                Withdraw History
                </h5>
                
              </div>*/}
                    {/* header Starts */}
                    <div className="d-flex align-items-center justify-content-between position-relative  px-3">
                      {/* Back Button on Left */}
                      <div className="d-flex justify-content-between align-items-center px-0">
                        {/* <button
                          className="go_back_btn bg-grey"
                          onClick={() => window.history.back()}
                        >
                          <i className="ri-arrow-left-s-line text-white fs-20" />
                        </button> */}
                      </div>

                      {/* Centered Title */}
                      <h5 className="m-0 text-white fs-16">Withdraw History</h5>
                      <div className="d-flex justify-content-between align-items-center px-3">
                        <button
                          className="go_back_btn bg-grey"
                          onClick={fetchWithdrawHistory}
                        >
                          <i class="fa-solid fa-arrows-rotate text-white fs-16"></i>
                        </button>
                      </div>
                    </div>
                    {/* header Ends */}

                    {/* <div className="d-flex justify-content-between align-items-center px-0">
                <button
                  className="go_back_btn"
                  onClick={() => window.history.back()}
                >
                  <i className="ri-arrow-left-s-line text-white fs-24" />
                </button>
              </div> */}

                    {/* <div className="d-flex justify-content-between"> */}
                    {/* <div className="my-2">
                  <h2 className="text-white fs-20">Withdraw History</h2>
                </div> */}
                    {/* <p
                  className="btn btn-sm btn-outline-info"
                  onClick={fetchWithdrawHistory}
                >
                  🔄 Refresh
                </p>
              </div> */}

                    {/* <div className="nav nav-pills flex-wrap" id="latest-bet-tabs">
                {[
                  "all",
                  "pending",
                  "processing",
                  "verified",
                  "rejected",
                  "canceled",
                ].map((tab) => (
                  <button
                    key={tab}
                    className={`nav-link latest_bet_btn ${
                      selectedTab === tab ? "active" : ""
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div> */}

                    <div className="overflow-auto px-0 mt-4">
                      <div
                        className="nav nav-pills flex-nowrap gap-2 scroll-hidden rounded-2"
                        id="latest-bet-tabs"
                        style={{
                          overflowX: "auto",
                          whiteSpace: "nowrap",
                          // background: "#192432",
                        }}
                      >
                        {[
                          "all",
                          "pending",
                          "processing",
                          "verified",
                          "rejected",
                          "canceled",
                        ].map((tab) => (
                          <button
                            key={tab}
                            className={`nav-link latest_bet_btn ${
                              selectedTab === tab ? "active" : ""
                            }`}
                            style={{ padding: "2px 12px" }}
                            onClick={() => setSelectedTab(tab)}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="tab-content p-0 mt-2 mb-3">
                      {loading ? (
                        <p className="text-white text-center mt-4">
                          Loading...
                        </p>
                      ) : error ? (
                        <>
                          <p className="text-danger">{error}</p>
                          <div className="d-flex flex-column align-content-center">
                            {/* <button
                              className="btn btn-warning mt-2"
                              onClick={fetchWithdrawHistory}
                            >
                              Retry
                            </button> */}
                            {/* <img
                              src="https://cdni.iconscout.com/illustration/premium/thumb/unauthorized-access-illustration-download-in-svg-png-gif-file-formats--hacker-attack-cyber-intrusion-security-breach-data-pack-crime-illustrations-7706304.png"
                              alt="unauth"
                              className="w-75"
                            /> */}
                          </div>
                        </>
                      ) : filteredHistory.length > 0 ? (
                        filteredHistory
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )
                          .map((withdraw) => (
                            <div className="bet-card" key={withdraw.id}>
                              {/* <div className="mybet-single-card p-3">
                          <ul className="bet-details">
                            <li>
                              <span>Withdraw Amount</span>
                              <span>{CURRENCY_SYMBOL} {withdraw.amount}</span>
                            </li>
                            <li>
                              <span>Status</span>
                              <span
                                className={`fw-bold text-capitalize ${
                                  withdraw.status === "pending"
                                    ? "text-warning"
                                    : withdraw.status === "verified"
                                    ? "text-success"
                                    : withdraw.status === "rejected"
                                    ? "text-info"
                                    : "text-danger"
                                }`}
                              >
                                {withdraw.status}
                              </span>
                            </li>
                          </ul>

                          {withdraw.status === "pending" && (
                            <div className="d-flex justify-content-end">
                              <button
                                className="btn bg-primary_color text-white"
                                onClick={() =>
                                  handleWithdrawCancel(withdraw.id)
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div> */}

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
                                        class="fa-solid fa-arrow-up"
                                        style={{ transform: "rotate(45deg)" }}
                                      ></i>
                                    </div>
                                    {/* ✅ Add margin-start (left) using ms-3 */}
                                  </div>

                                  <div className="d-flex align-items-end flex-column">
                                    <h4 className="mb-1 amount-fs-size">
                                      {CURRENCY_SYMBOL} {withdraw.amount}
                                    </h4>

                                    <span
                                      className={`fw-bold ${
                                        withdraw.status === "pending"
                                          ? "history_badge pending_badge"
                                          : withdraw.status === "verified"
                                          ? "history_badge success_badge"
                                          : withdraw.status === "processing"
                                          ? "history_badge processing_badge"
                                          : "history_badge badge_danger"
                                      }`}
                                    >
                                      {withdraw.status}
                                    </span>
                                    {/* <p className="fs-11 mb-0 text-grey mt-1">
                                {new Date(withdraw.created_at).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </p> */}
                                    <p className="fs-11 mb-0 text-grey mt-1">
                                      {new Date(
                                        withdraw.created_date
                                      ).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </p>
                                    {/* withdraw */}

                                    {withdraw.status === "pending" && (
                                      <div className="d-flex justify-content-end">
                                        <button
                                          className="btn bg-grey text-white"
                                          onClick={() =>
                                            handleWithdrawCancel(withdraw.id)
                                          }
                                          style={{
                                            padding: "0px 17px",
                                            fontSize: " 13px",
                                            marginTop: "10px",
                                          }}
                                        >
                                          Cancel Request
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center mt-5">
                          <p className="text-white">
                            No Withdraw History Found
                          </p>
                        </div>
                      )}

                      {!loading &&
                        !error &&
                        totalPages > 1 &&
                        filteredHistory.length > 0 && (
                          <PaginatedData
                            totalPages={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                          />
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

export default WithdrawHistory;
