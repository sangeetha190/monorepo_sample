// src/Components/Pages/Transactions/Deposit/DepositMethod.jsx
import React, {useEffect, useState, useContext} from "react";
import {Link, useNavigate} from "react-router-dom";

// Adjust these paths if your structure differs:
// import StickyHeader from "../../../layouts/Header/Header";
import StickyHeader from "../../Home/Components/Header/Header";
// import Sidebar from "../../../layouts/Header/Sidebar";
import Sidebar from "../../Home/Components/Header/Sidebar";
// import AuthContext from "../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import axiosInstance from "../../../../API/axiosConfig";
import axiosInstance from "@core/api/axiosConfig";
// import routes from "../../../routes/route";
import routes from "../../../routes/routes";
import axios from "axios";

const WithdrawMethod = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [nameMethod, setNameMethod] = useState("");
    const [clickingId, setClickingId] = useState(null);

    const [historyRoute, setHistoryRoute] = useState("");

    const navigate = useNavigate();
    const {user} = useContext(AuthContext); // expects user?.token (and optional user?.id)

    /* ---------------- Fetch deposit methods ---------------- */
    useEffect(() => {
        const controller = new AbortController();

        async function fetchMethods() {
            try {
                setLoading(true);
                setErr("");
                const api_token = "efqtTvRqnGa8OeVb5Xugw13uo8BAfAEwvWpH8";
                const res = await axiosInstance.get("/player/payment-services/payment-methods", {
                    params: {type: "withdraw"},
                    headers: user?.token ? {Authorization: `Bearer ${user.token}`} : undefined,
                    signal: controller.signal,
                });

                // console.log(res);

                const list = (Array.isArray(res?.data) && res.data) || res?.data?.methods || res?.data?.data || [];

                setMethods(Array.isArray(list) ? list : []);
            } catch (e) {
                if (e?.code === "ERR_CANCELED" || e?.name === "CanceledError") return;
                setErr(e?.response?.data?.message || e?.message || "Failed to load payment methods");
            } finally {
                setLoading(false);
            }
        }

        fetchMethods();
        return () => controller.abort();
    }, [user?.token]);

    /* ---------------- Helpers ---------------- */
    function resolvePlayerId(u) {
        return u?.id ?? u?.user?.id ?? u?.player?.id ?? 2;
    }

    async function startApayFlow({returnUrl, customTxId, playerId}) {
        try {
            const res = await axiosInstance.get("/player/payment-services/a-pay", {
                params: {
                    return_url: returnUrl,
                    custom_transaction_id: customTxId,
                    player_id: playerId,
                },
                headers: {
                    Authorization: `Bearer ${user?.token || ""}`,
                    Accept: "application/json", // ensure JSON, not HTML redirect
                },
                // default validateStatus is fine since server returns 200
            });

            // Your backend sample:
            // {
            //   "status": 200,
            //   "message": "Apay URL generated successfully",
            //   "data": { "url": "https://dazen1.one/pay/en?token=...", "order_id": "68cd203a4848a79f" }
            // }
            const {url, order_id} = res?.data?.data ?? {};

            if (!url) {
                throw new Error("Payment URL missing from response.");
            }

            // (Optional) keep the order id for later verification on return page
            try {
                localStorage.setItem("apay_order_id", order_id || customTxId);
            } catch (_) {}

            // Redirect the user to A-Pay
            window.location.assign(url); // or window.location.href = url
        } catch (e) {
            setErr(e?.response?.data?.message || e?.message || "Failed to start A-Pay payment.");
        } finally {
            setClickingId(null);
        }
    }

    // function handleChoose(method) {
    //   const name_method = (method?.name || "").toLowerCase().trim();
    //   setNameMethod(name_method);

    //   console.log("name_method", name_method);

    //   const key = name_method;

    //   // If matches manual withdraw Namibia
    //   if (key.includes("manual") && key.includes("withdraw - namibia")) {
    //     navigate("/manual-withdraw-namibia");
    //     // setHistoryRoute(routes.transactions.manual_deposit_history);
    //     return;
    //   }

    //   // All other methods -> Default withdraw wallet route
    //   navigate(routes.transactions.withdrawWallet);
    //   // setHistoryRoute(routes.transactions.withdraw_history);
    // }

    function handleChoose(method) {
        const name_method = (method?.name || "").toLowerCase().trim();
        setNameMethod(name_method);

        console.log("name_method", name_method);

        const key = name_method;

        // Specific case → Manual Withdraw Namibia
        if (key.includes("manual") && key.includes("withdraw - namibia")) {
            navigate("/manual-withdraw-namibia", {
                state: {
                    methodId: method.id,
                    methodName: method.name,
                },
            });
            return;
        }

        // Default case → Withdraw Wallet route
        navigate(routes.transactions.withdrawWallet, {
            state: {
                methodId: method.id,
                methodName: method.name,
            },
        });
    }

    // Put this helper above your component (or in a utils file)
    const getMethodIcon = (name = "") => {
        const n = name.toLowerCase().trim();

        // exact/regex matches in priority order
        if (/manual deposit .*india/i.test(name)) return "assets/img/cash-payment_img.png";
        if (/manual deposit .*namibia/i.test(name)) return "assets/img/cash-payment_img.png";

        if (n.includes("manual withdraw - namibia")) return "assets/img/wallet.png"; // easy wallet deposit
        if (n.includes("blue wallet")) return "assets/img/blue_wallet.png"; // blue wallet deposit
        if (n.includes("nedbank") && n.includes("wallet")) return "assets/img/mobile-payment.png"; // nedbank wallet deposit
        if (n.includes("access money") && n.includes("wallet")) return "assets/img/coin_1.png"; // access money wallet deposit
        if (n.includes("easypay")) return "assets/img/easypay.png"; // easypay deposit - namibia

        return "assets/img/wallet_img.png"; // default
    };

    /* ---------------- UI ---------------- */
    return (
        <>
            {/* Header */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar />

                <div className="main-panel overflow-hidden">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                <div className="pt-3 pb-2">
                                    <div className="row px-2">
                                        {/* Title Row */}
                                        <div className="d-flex align-items-center justify-content-between position-relative px-0">
                                            <div className="d-flex justify-content-between align-items-center px-1 mx-1">
                                                <button
                                                    className="go_back_btn bg-grey"
                                                    onClick={() => window.history.back()}
                                                >
                                                    <i className="ri-arrow-left-s-line text-white fs-20" />
                                                </button>
                                            </div>

                                            <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16 text-center">
                                                Withdraw Payment Method
                                            </h5>
                                        </div>

                                        {/* Card */}
                                        <div className="card  account_input-textbox-container border-0">
                                            <div className="card-body py-4 pb-5">
                                                {loading && <p className="text-white text-center">Loading…</p>}
                                                {err && <p className="text-danger mb-3">{err}</p>}
                                                {!loading && !err && methods.length === 0 && (
                                                    <p className="text-white">No methods available.</p>
                                                )}
                                                {/* cvcv */}
                                                {/* Left (methods) | Right (image) */}
                                                <div className="row g-4 align-items-start">
                                                    {/* LEFT: Methods */}
                                                    <div className="col-12 col-lg-12">
                                                        <div className="row g-3 justify-content-left">
                                                            {/* 🔹 Extra box before all methods */}
                                                            {/* <div className="col-12 col-lg-6 col-xl-4">
                                <div className="p-3 rounded border h-100 d-flex flex-column">
                                  <div className="d-flex justify-content-between">
                                    <img
                                      src="/assets/img/cash-payment_img.png"
                                      alt="Wallet"
                                      style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: "contain",
                                      }}
                                    />
                                    <Link
                                      to={
                                        routes.transactions.all_withdrawHistory
                                      }
                                    >
                                      <img
                                        alt="bet_history"
                                        style={{
                                          width: 40,
                                          height: 30,
                                          objectFit: "contain",
                                        }}
                                        src="assets/img/icons/history.png"
                                      />
                                    </Link>
                                  </div>

                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <strong className="fs-4 text-white">
                                      Direct Withdraw
                                    </strong>
                                  </div>

                                  <p style={{ color: "#b1abab" }}>
                                    Use your wallet balance to deposit.
                                  </p>

                                  <Link
                                    to={
                                      routes.transactions
                                        .manual_withdraw_namibia
                                    }
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-red mt-auto w-50"
                                    >
                                      Proceed
                                    </button>
                                  </Link>
                                </div>
                              </div> */}

                                                            {/* 🔹 Existing list from API */}
                                                            {methods.map((m, idx) => {
                                                                const key = String(m.id ?? m.code ?? m.name ?? idx);
                                                                const isBusy = clickingId === key;
                                                                const title = m?.name || m?.code || "";

                                                                const tx = routes?.transactions ?? {};

                                                                //  const isManual = nk.includes("manual");

                                                                let perCardHistoryRoute;

                                                                // if (isManual) {
                                                                //   perCardHistoryRoute =
                                                                //     tx.manual_deposit_history ??
                                                                //     tx.depositHistory;
                                                                // } else if (isEasyWallet) {
                                                                //   // ✅ specific before generic
                                                                //   perCardHistoryRoute =
                                                                //     tx.easy_wallet_history ?? tx.depositHistory;
                                                                // }
                                                                return (
                                                                    <div className="col-12 col-lg-6 col-xl-4" key={key}>
                                                                        <div className="p-3 rounded border h-100 d-flex flex-column">
                                                                            <div className="d-flex justify-content-between">
                                                                                <img
                                                                                    src={getMethodIcon(m.name)}
                                                                                    alt={m.name || "Method"}
                                                                                    style={{
                                                                                        width: 50,
                                                                                        height: 50,
                                                                                        objectFit: "contain",
                                                                                    }}
                                                                                />

                                                                                <Link
                                                                                    to={
                                                                                        routes.transactions
                                                                                            .all_withdrawHistory
                                                                                    }
                                                                                >
                                                                                    <img
                                                                                        alt="bet_history"
                                                                                        style={{
                                                                                            width: 40,
                                                                                            height: 30,
                                                                                            objectFit: "contain",
                                                                                        }}
                                                                                        src="assets/img/icons/history.png"
                                                                                    />
                                                                                </Link>
                                                                            </div>

                                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                                {m.logo && (
                                                                                    <img
                                                                                        src={m.logo}
                                                                                        alt={title || "Method"}
                                                                                        style={{
                                                                                            width: 36,
                                                                                            height: 36,
                                                                                            objectFit: "contain",
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                <strong className="fs-4 text-white">
                                                                                    {m.name}
                                                                                </strong>
                                                                            </div>

                                                                            {m.description ? (
                                                                                <p
                                                                                    className="text-grey mb-2"
                                                                                    style={{color: "#b1abab"}}
                                                                                >
                                                                                    {m.description}
                                                                                </p>
                                                                            ) : (
                                                                                <p style={{color: "#b1abab"}}>
                                                                                    Select to continue.
                                                                                </p>
                                                                            )}

                                                                            {m.limits && (
                                                                                <small className="text-muted">
                                                                                    Min: {m.limits.min} • Max:{" "}
                                                                                    {m.limits.max}
                                                                                </small>
                                                                            )}

                                                                            {/* <Link
                                        to={routes.transactions.withdrawWallet}
                                      >
                                        <button
                                          type="button"
                                          className="btn btn-red mt-auto w-50"
                                          onClick={() => {
                                            setClickingId(key);
                                            handleChoose(m, key);
                                          }}
                                        >
                                          {isBusy
                                            ? "Redirecting..."
                                            : "Proceed"}
                                        </button>
                                      </Link> */}

                                                                            {/* <Link
                                        to={routes.transactions.withdrawWallet}
                                        state={{
                                          methodId: m.id,
                                          methodName: m.name,
                                        }} // 🔥 send m.id here
                                      > */}
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-red mt-auto w-50"
                                                                                onClick={() => {
                                                                                    setClickingId(key);
                                                                                    handleChoose(m, key);
                                                                                }}
                                                                            >
                                                                                {isBusy ? "Redirecting..." : "Proceed"}
                                                                            </button>

                                                                            {/* </Link> */}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* /Row */}
                                            </div>
                                        </div>
                                        {/* /Card */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WithdrawMethod;
