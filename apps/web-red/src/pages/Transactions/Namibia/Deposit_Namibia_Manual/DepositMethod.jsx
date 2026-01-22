// src/Components/Pages/Transactions/Deposit/DepositMethod.jsx
import {useEffect, useState, useContext} from "react";
import {useNavigate} from "react-router-dom";

// Adjust these paths if your structure differs:
// import StickyHeader from "../../../../layouts/Header/Header";
import StickyHeader from "../../../Home/Components/Header/Header";
// import Sidebar from "../../../../layouts/Header/Sidebar";
import Sidebar from "../../../Home/Components/Header/Sidebar";
// import AuthContext from "../../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import axiosInstance from "../../../../../API/axiosConfig";
import axiosInstance from "@core/api/axiosConfig";

const DepositMethod = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [clickingId, setClickingId] = useState(null);

    const navigate = useNavigate();
    const {user} = useContext(AuthContext); // expects user?.token (and optional user?.id)

    /* ---------------- Fetch deposit methods ---------------- */
    useEffect(() => {
        const controller = new AbortController();

        async function fetchMethods() {
            try {
                setLoading(true);
                setErr("");

                const res = await axiosInstance.get("/player/payment-services/payment-methods", {
                    params: {type: "deposit"},
                    headers: user?.token ? {Authorization: `Bearer ${user.token}`} : undefined,
                    signal: controller.signal,
                });

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

    function handleChoose(method) {
        const name = (method?.name || "").toLowerCase().trim();

        // Manual Deposit -> internal route
        if (name.includes("manual")) {
            navigate("/deposit");
            return;
        }

        // A-Pay -> kickoff via axios (so token + JSON headers go along)
        // if (name.includes("apay")) {
        //   if (!user?.token) {
        //     setErr("Please login again to start the payment.");
        //     return;
        //   }
        //   const playerId = resolvePlayerId(user);
        //   const customTxId = `TXN${Date.now()}`;
        //   setClickingId(method.id || method.code || method.name || "apay");
        //   startApayFlow({
        //     returnUrl: "https://jiboomba.in",
        //     customTxId,
        //     playerId,
        //   });
        //   return;
        // }

        if (name.includes("apay")) {
            if (!user?.token) {
                setErr("Please login again to start the payment.");
                return;
            }
            const playerId = resolvePlayerId(user);
            const customTxId = `TXN${Date.now()}`;

            const returnUrl = new URL("/deposit-history", window.location.origin).toString();
            setClickingId(method.id || method.code || method.name || "apay");
            startApayFlow({
                returnUrl,
                customTxId,
                playerId,
            });
            return;
        }

        // Fallback
        // console.log("Unhandled method:", method);
    }

    /* ---------------- UI ---------------- */
    return (
        <>
            {/* Header */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar />

                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                <div className="pt-3 pb-2">
                                    <div className="row px-2">
                                        {/* Title Row */}
                                        <div className="d-flex align-items-center justify-content-between position-relative px-0">
                                            <div className="d-flex justify-content-between align-items-center px-0">
                                                <button
                                                    className="go_back_btn bg-grey"
                                                    onClick={() => window.history.back()}
                                                >
                                                    <i className="ri-arrow-left-s-line text-white fs-20" />
                                                </button>
                                            </div>

                                            <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16">
                                                Deposit Payment Method
                                            </h5>
                                        </div>

                                        {/* Card */}
                                        <div className="card  bg_light_grey account_input-textbox-container mt-5">
                                            <div className="card-body py-4 pb-5">
                                                {loading && <p className="text-muted">Loading…</p>}
                                                {err && <p className="text-danger mb-3">{err}</p>}
                                                {!loading && !err && methods.length === 0 && (
                                                    <p className="text-white">No methods available.</p>
                                                )}

                                                {/* Left (methods) | Right (image) */}
                                                <div className="row g-4 align-items-start">
                                                    {/* LEFT: Methods */}
                                                    <div className="col-12 col-lg-12 ">
                                                        <div className="row g-3 ">
                                                            {methods.map((m, idx) => {
                                                                const key = m.id || m.code || m.name || idx;
                                                                const isBusy = clickingId === key;
                                                                return (
                                                                    <div className="col-12 col-md-4" key={key}>
                                                                        <div className="p-3 rounded border h-100 d-flex flex-column ">
                                                                            <div className="d-flex ">
                                                                                {m.name === "Manual Deposit - India" ? (
                                                                                    <div className=" card_bx ">
                                                                                        <img
                                                                                            src="assets/img/cash-payment_img.png"
                                                                                            alt={m.name || "Method"}
                                                                                            style={{
                                                                                                width: 50,
                                                                                                height: 50,
                                                                                                objectFit: "contain",
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                ) : (
                                                                                    <img
                                                                                        src="assets/img/wallet_img.png"
                                                                                        alt={m.name || "Method"}
                                                                                        style={{
                                                                                            width: 50,
                                                                                            height: 50,
                                                                                            objectFit: "contain",
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </div>

                                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                                {m.logo && (
                                                                                    <img
                                                                                        src={m.logo}
                                                                                        alt={m.name || "Method"}
                                                                                        style={{
                                                                                            width: 36,
                                                                                            height: 36,
                                                                                            objectFit: "contain",
                                                                                        }}
                                                                                    />
                                                                                )}

                                                                                <strong className="fs-4 text-white">
                                                                                    {m.name || m.display_name || m.code}
                                                                                </strong>
                                                                            </div>

                                                                            {m.name === "Manual Deposit - India" ? (
                                                                                <p
                                                                                    className=""
                                                                                    style={{color: "#b1abab"}}
                                                                                >
                                                                                    Manual Payment Transfer funds
                                                                                    manually via bank transfer, UPI or
                                                                                    cash. Upload receipt or add details
                                                                                    after placing your order.
                                                                                </p>
                                                                            ) : (
                                                                                <p
                                                                                    className=""
                                                                                    style={{color: "#b1abab"}}
                                                                                >
                                                                                    A-Pay Instant checkout using A-Pay
                                                                                    wallet — fast, secure and one-tap
                                                                                    payments. Balance will be debited
                                                                                    immediately.
                                                                                </p>
                                                                            )}

                                                                            {m.description && (
                                                                                <p className="text-muted mb-2">
                                                                                    {m.description}
                                                                                </p>
                                                                            )}

                                                                            {m.limits && (
                                                                                <small className="text-muted">
                                                                                    Min: {m.limits.min} • Max:{" "}
                                                                                    {m.limits.max}
                                                                                </small>
                                                                            )}

                                                                            <button
                                                                                className="btn btn-red mt-auto w-50"
                                                                                disabled={isBusy}
                                                                                onClick={() => {
                                                                                    setClickingId(key);
                                                                                    handleChoose(m);
                                                                                }}
                                                                            >
                                                                                {isBusy ? "Redirecting..." : "Proceed"}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* RIGHT: Image */}
                                                    {/* <div className="col-12 col-lg-4 d-flex justify-content-center">
                            <img
                              src="https://cdni.iconscout.com/illustration/premium/thumb/credit-card-bill-payment-app-illustration-svg-png-download-4525614.png"
                              alt="Payment methods"
                              className="img-fluid"
                              style={{ maxHeight: 620, objectFit: "contain" }}
                            />
                          </div> */}
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

export default DepositMethod;
