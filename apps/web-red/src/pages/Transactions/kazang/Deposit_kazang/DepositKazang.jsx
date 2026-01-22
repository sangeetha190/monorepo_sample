import {useContext, useState} from "react";
// import StickyHeader from "../../../../layouts/Header/Header";
import StickyHeader from "../../../Home/Components/Header/Header";
// import Sidebar from "../../../../layouts/Header/Sidebar";
import Sidebar from "../../../Home/Components/Header/Sidebar";
import {useFormik} from "formik";
import * as Yup from "yup";
// import { verifyToken } from "../../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
// import AuthContext from "../../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import {DepositKazangVoucher, redeemKazangVoucher} from "../../../../../API/depositAPI";
import {DepositKazangVoucher, redeemKazangVoucher} from "@core/api/depositAPI";

// helpers
const digitsOnly = (s) => (s || "").replace(/\D+/g, "");
const fmtPin16 = (s) => {
    const d = digitsOnly(s).slice(0, 16);
    return d.replace(/(.{4})/g, "$1 ").trim(); // 4-4-4-4
};

const schema = Yup.object({
    pin: Yup.string()
    .transform((v) => digitsOnly(v || ""))
    .matches(/^\d{16}$/, "PIN must be exactly 16 digits")
    .required("PIN is required"),
});

function Deposit() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [apiBusy, setApiBusy] = useState(false);
    const [apiError, setApiError] = useState("");
    const [details, setDetails] = useState(null);
    const [checking, setChecking] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const {user, fetchUser} = useContext(AuthContext);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const formik = useFormik({
        initialValues: {pin: ""},
        validationSchema: schema,
        onSubmit: async (values, {setSubmitting, setErrors}) => {
            setApiError("");
            setApiBusy(true);
            setDetails(null);

            try {
                // 1) Verify token
                const currentToken = user?.token;
                try {
                    const tokenRes = await verifyToken(currentToken);
                    if (tokenRes.status !== "success") {
                        const msg = tokenRes.message || "Invalid or expired token. Please log in again.";
                        setErrors({api: msg});
                        return;
                    }
                } catch (verifyError) {
                    const msg =
                        verifyError?.response?.data?.message || "Invalid or expired token. Please log in again.";
                    setErrors({api: msg});
                    return;
                }

                // 2) Clean PIN
                const cleanPin = digitsOnly(values.pin);

                // 3) Check voucher status
                const response = await DepositKazangVoucher({
                    token: currentToken,
                    pin: cleanPin,
                });
                if (String(response?.response_code) !== "0") {
                    setApiError(response?.response_message || "Check status failed");
                    return;
                }
                if (String(response?.response_code) === "4") {
                    setApiError(response?.response_message || "Check status failed");
                    return;
                }
                setDetails(response?.voucher_detail || null);
            } catch (e) {
                setApiError(e?.message || "Network error");
            } finally {
                setChecking(false);
                setApiBusy(false);
                setSubmitting(false);
            }
        },
    });

    const hasError = !!(formik.touched.pin && formik.errors.pin);

    const onPinChange = (e) => {
        const formatted = fmtPin16(e.target.value);
        formik.setFieldValue("pin", formatted);
        setDetails(null);
        setApiError("");
    };

    const onRedeem = async () => {
        if (!details) return;
        setApiError("");
        setRedeeming(true);
        try {
            const currentToken = user?.token;
            const cleanPin = digitsOnly(formik.values.pin);
            const data = await redeemKazangVoucher({
                token: currentToken,
                player_id: user?.id,
                pin: cleanPin,
            });
            if (String(data?.response_code) !== "0") {
                throw new Error(data?.message || data?.response_message || "Redemption failed");
            }

            // ✅ refresh profile so Header updates chips
            await fetchUser(currentToken);
            // Show success modal
            setShowSuccessModal(true);
        } catch (e) {
            setApiError(e?.message || "Redemption error");
        } finally {
            setRedeeming(false);
            // trigger confetti
            launchConfetti();
        }
    };

    const statusCode = details?.status_code ?? -1;
    const isAvailable = statusCode !== 1;

    // Confetti logic
    const launchConfetti = () => {
        const confettiCount = 30;
        const newConfetti = Array.from({length: confettiCount}, () => ({
            id: Math.random(),
            left: Math.random() * 100 + "%",
            color: randomColor(),
            delay: Math.random() * 0.5 + "s",
        }));
        setConfetti(newConfetti);
        setTimeout(() => setConfetti([]), 3000);
    };

    const randomColor = () => {
        const colors = ["#FFD700", "#FF3D71", "#00D1B2", "#17A2B8", "#FFDD57"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <>
            {/* Styles */}
            <style>{`
        .pop-animation { animation: pop 0.4s ease; }
        @keyframes pop { 0% { transform: scale(0.8); opacity:0; } 100% { transform: scale(1); opacity:1; } }
        .modal-header { border-bottom: none; justify-content: center; position: relative; }
        .modal-footer { border-top: none; justify-content: center; }
        .btn-close-white { filter: invert(1); position: absolute; top: 15px; right: 15px; }
        .confetti { position: absolute; width: 8px; height: 8px; top: -10px; animation: fall 3s linear forwards; border-radius:50%; }
        @keyframes fall { to { transform: translateY(300px) rotate(360deg); opacity:0; } }
      `}</style>

            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                {/* header Starts */}
                                {/* <div className="d-flex align-items-center justify-content-between position-relative  px-0 mt-3">
                  <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16">
                    kazang Voucher Deposit
                  </h5>
                </div>

                <div className="d-flex justify-content-between align-items-center px-0">
                  <button
                    className="go_back_btn bg-grey"
                    onClick={() => window.history.back()}
                  >
                    <i className="ri-arrow-left-s-line text-white fs-24" />
                  </button>
                </div> */}
                                {/* Title Row */}
                                <div className="d-flex align-items-center justify-content-between position-relative px-0 mt-3">
                                    <div className="d-flex justify-content-between align-items-center px-1 mx-1">
                                        <button className="go_back_btn bg-grey" onClick={() => window.history.back()}>
                                            <i className="ri-arrow-left-s-line text-white fs-20" />
                                        </button>
                                    </div>

                                    <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-12 text-center">
                                        EasyPay Voucher / Kazang Deposit
                                    </h5>
                                </div>
                                {/* header Ends */}

                                {/* --- Voucher Form Section --- */}
                                <div className="wizard my-5 px-2">
                                    <div className="card bg_light_grey account_input-textbox-container">
                                        <div className="card-body py-4 pb-5">
                                            <h5 className="mb-3">My Voucher</h5>
                                            <form className="nl-form" onSubmit={formik.handleSubmit}>
                                                <div className="nl-bar">
                                                    <div className={`nl-input ${hasError ? "is-invalid" : ""}`}>
                                                        <input
                                                            name="pin"
                                                            id="pin-input"
                                                            required
                                                            type="tel"
                                                            inputMode="numeric"
                                                            pattern="[0-9 ]*"
                                                            maxLength={19}
                                                            value={formik.values.pin}
                                                            onChange={onPinChange}
                                                            onBlur={formik.handleBlur}
                                                            autoComplete="one-time-code"
                                                            placeholder="Enter 16-digit voucher PIN"
                                                        />
                                                        <span className="nl-icon" aria-hidden>
                                                            🔒
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className="nl-btn"
                                                        disabled={
                                                            !formik.isValid ||
                                                            !formik.values.pin ||
                                                            checking ||
                                                            formik.isSubmitting
                                                        }
                                                    >
                                                        {checking || formik.isSubmitting ? "Checking..." : "Apply"}
                                                    </button>
                                                </div>
                                            </form>
                                            <p className="text-danger">{apiError}</p>

                                            {formik.errors.api && (
                                                <div className="nl-msg nl-msg-error">{formik.errors.api}</div>
                                            )}
                                            {hasError && <div className="nl-msg nl-msg-error">{formik.errors.pin}</div>}
                                            {details && (
                                                <div className="mt-4">
                                                    <div
                                                        className="card border-0 shadow-sm"
                                                        style={{maxWidth: "900px"}}
                                                    >
                                                        <div className="card-body white-border">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <h6 className="mb-0">
                                                                    <img
                                                                        src="https://cdn-icons-png.flaticon.com/512/869/869649.png"
                                                                        alt=""
                                                                        style={{width: "25px", height: "25px"}}
                                                                    />{" "}
                                                                    Voucher Details
                                                                </h6>
                                                                <span
                                                                    className={`badge rounded-pill ${
                                                                        isAvailable
                                                                            ? "text-bg-success"
                                                                            : "text-bg-danger"
                                                                    }`}
                                                                >
                                                                    {isAvailable
                                                                        ? "Available"
                                                                        : details.status_text || "Redeemed"}
                                                                </span>
                                                            </div>
                                                            <hr className="my-3 border-white" />
                                                            <div className="row g-2">
                                                                <div className="col-6">
                                                                    <div className="text-grey small">
                                                                        Currency Value
                                                                    </div>
                                                                    <div className="fw-semibold text-white">
                                                                        {(details.face_value ?? 0).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                                {/* <div className="col-6">
                                  <div className="text-grey small">
                                    Currency
                                  </div>
                                  <div className="fw-semibold text-white">
                                    {details.currency_code || "NAD"}{" "}
                                    {details.cost || "NAD"}
                                  </div>
                                </div> */}
                                                                <div className="col-12">
                                                                    <div className="text-grey small">Description</div>
                                                                    <div className="fw-medium text-white">
                                                                        {details.description || "-"}
                                                                    </div>
                                                                </div>
                                                                <div className="col-12">
                                                                    <div className="text-grey small">Serial</div>
                                                                    <div className="font-monospace text-white">
                                                                        {details.serial || "-"}
                                                                    </div>
                                                                </div>
                                                                {!isAvailable && (
                                                                    <div className="col-12">
                                                                        <div className="text-grey small">
                                                                            Redeemed At
                                                                        </div>
                                                                        <div className="text-white">
                                                                            {details.redemption_date || "-"}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="d-flex gap-2 mt-3">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-success"
                                                                    onClick={onRedeem}
                                                                    disabled={!isAvailable || redeeming}
                                                                >
                                                                    {redeeming ? "Processing..." : "Redeem & Deposit"}
                                                                </button>
                                                            </div>
                                                            <div
                                                                className={`text-grey small mt-2 ${
                                                                    isAvailable
                                                                        ? "text-success fw-semibold"
                                                                        : "text-danger fw-semibold"
                                                                }`}
                                                            >
                                                                {isAvailable
                                                                    ? "Voucher is available. Click Redeem when ready."
                                                                    : "This voucher has already been redeemed or expired. Try another PIN."}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* --- Success Modal --- */}
                                {showSuccessModal && (
                                    <div
                                        className="modal-backdrop d-flex justify-content-center align-items-center"
                                        style={{backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050}}
                                    >
                                        <div
                                            className="modal-dialog modal-dialog-centered mx-400 reddemd"
                                            style={{
                                                maxWidth: "400px",
                                                color: "white",
                                            }}
                                        >
                                            <div
                                                className="modal-content text-center pop-animation p-3"
                                                style={{
                                                    borderRadius: "1rem",
                                                    background: "#161616",
                                                    color: "white",
                                                }}
                                            >
                                                <div className="modal-header border-0 justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn-close btn-close-white"
                                                        onClick={() => setShowSuccessModal(false)}
                                                    />
                                                </div>
                                                <div className="modal-body fs-5 position-relative">
                                                    <img
                                                        src="https://pics.clipartpng.com/Red_Open_Gift_PNG_Clipart-1006.png"
                                                        className="w-25 mb-3"
                                                        alt="Gift"
                                                    />
                                                    <h5 className="modal-title fs-3">Redeemed Success!</h5>
                                                    <p>Voucher redeemed and deposited successfully.</p>

                                                    {/* Confetti */}
                                                    {confetti.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className="confetti"
                                                            style={{
                                                                left: c.left,
                                                                backgroundColor: c.color,
                                                                animationDelay: c.delay,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="modal-footer border-0 justify-content-center">
                                                    <button
                                                        type="button"
                                                        className="btn swiper-scrollbar-drag w-50 bgbody-color text-white rounded-pill fs-15 fw-500"
                                                        onClick={() => setShowSuccessModal(false)}
                                                    >
                                                        OK
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Deposit;
