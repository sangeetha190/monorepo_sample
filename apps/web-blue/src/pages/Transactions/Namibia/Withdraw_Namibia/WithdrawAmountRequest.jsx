import React, {useContext, useEffect, useState} from "react";
import * as Yup from "yup";
import {useFormik} from "formik";
import {Link, useLocation, useNavigate} from "react-router-dom";
// import AuthContext from "../../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import routes from "../../../../routes/route";
import routes from "../../../../routes/routes";
// import {
//     EditBank,
//     EditBankNamibia,
//     sendWithdrawRequest,
//     sendWithdrawRequestNamibia,
// } from "../../../../../API/withdrawAPI";
import {EditBank, EditBankNamibia, sendWithdrawRequest, sendWithdrawRequestNamibia} from "@core/api/withdrawAPI";
// import {verifyToken} from "../../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
import {toast, ToastContainer} from "react-toastify";
// import {clearSelectedBank, loadSelectedBank} from "../../../../../API/bankSelectionStorage";
import {clearSelectedBank, loadSelectedBank} from "@core/api/bankSelectionStorage";
// import {APP_NAME, CURRENCY_SYMBOL} from "../../../../../constants";
import {APP_NAME, CURRENCY_SYMBOL} from "@core/constants";

const WithdrawAmountRequest = ({amount, bankId}) => {
    const [bankDetails, setBankDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const {user} = useContext(AuthContext);
    const token = user?.token;
    const userid = user?.id;
    console.log(bankDetails);
    const [bank, setBank] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        const refresh = () => setBank(loadSelectedBank());
        refresh(); // initial
        window.addEventListener("nm-bank-selected", refresh);
        return () => window.removeEventListener("nm-bank-selected", refresh);
    }, []);

    useEffect(() => {
        setBank(loadSelectedBank());
    }, [location.key]); // 🔁 runs on each navigation to this route

    const formik = useFormik({
        enableReinitialize: true, // 🟣 IMPORTANT!
        initialValues: {
            amount: amount || "",
        },
        validationSchema: Yup.object({
            amount: Yup.string().required("Amount is required"),
        }),
        onSubmit: async (values, {setSubmitting, setErrors, resetForm}) => {
            try {
                // ✅ Step 1: Verify the token
                try {
                    const tokenRes = await verifyToken(token);
                    if (tokenRes.status !== "success") {
                        toast.error(tokenRes.message || "Invalid or expired token. Please log in again.");
                        setErrors({
                            api: tokenRes.message || "Invalid or expired token. Please log in again.",
                        });
                        setSubmitting(false);
                        return;
                    }
                } catch (verifyError) {
                    const errorMessage =
                        verifyError.response?.data?.message ||
                        verifyError.message ||
                        "Invalid or expired token. Please log in again.";

                    // toast.error(errorMessage);
                    toast.error(`${errorMessage}. Please log in again to continue.`, {
                        toastId: "unauthorized-toast", // prevents duplicate toasts
                        onClose: () => {
                            // runs if user clicks X OR after autoClose timeout
                            navigate(location.pathname, {replace: true, state: {}});
                        },
                    });
                    // Redirect after a short delay (e.g., 2 seconds)
                    setTimeout(() => {
                        navigate("/login");
                    }, 5000);
                    // setErrors({ api: errorMessage });
                    setSubmitting(false);
                    return;
                }

                const response = await sendWithdrawRequestNamibia({
                    token,
                    bankId,
                    amount: values.amount,
                    userid,
                });

                if (response.status === "success") {
                    // toast.success("Withdraw request sent successfully! 🎉");
                    setShowModal(true);
                    resetForm();
                    localStorage.removeItem("nm_selected_bank");
                    // navigate(routes.transactions.withdrawHistory);
                } else {
                    setErrors({
                        api: response.msg || "Failed to send withdraw request.",
                    });
                }
            } catch (error) {
                if (error.response) {
                    const serverMessage =
                        error.response.data?.msg ||
                        error.response.data?.errors?.player_bank_id?.[0] ||
                        "Something went wrong!";
                    setErrors({api: serverMessage});
                } else if (error.request) {
                    setErrors({api: "Server not responding. Please try again later."});
                } else {
                    setErrors({api: "Something went wrong. Try again."});
                }
            }
            setSubmitting(false);
        },
    });

    // ============================ *********** Dont Delete this to get the bank details  ***********************  =====================
    useEffect(() => {
        if (!token || !bankId) return; // ✅ Prevents unnecessary API call

        const fetchBankDetails = async () => {
            try {
                const response = await EditBankNamibia(bankId, token);
                if (response.status === "success") {
                    setBankDetails(response.playerBank);
                } else {
                    toast.error(response.message || "Failed to fetch bank details. Please log in again.", {
                        toastId: "unauthorized-toast",
                    });
                }
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message || error.message || "Something went wrong. Please log in again.";

                toast.error(`${errorMessage}`, {
                    toastId: "unauthorized-toast",
                });
            }
        };

        fetchBankDetails();
    }, [token, bankId]);

    return (
        <>
            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{backgroundColor: "rgba(0,0,0,0.5)"}}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm justify-content-center">
                        <div className="modal-content" style={{width: "220px"}}>
                            <div className="modal-body d-flex flex-column align-items-center">
                                {/* <img src="assets/img/icons/rupee.gif" className="mb-2 w-75" /> */}
                                <img src="/assets/img/icons/coin.png" className="mb-2 w-75 coin-animate" alt="coin" />
                                <div className="fw-700 fs-13 text-center text-black mb-3">
                                    Your Request <br />
                                    Is In Our Queue!
                                </div>
                                <Link to={routes.transactions.all_withdrawHistory}>
                                    <span
                                        className="btn text-white green-bg"
                                        onClick={() => setShowModal(false)} // ❌ Don't use data-bs-dismiss
                                    >
                                        Thank You
                                    </span>
                                </Link>
                                <span className="text-dark-grey fs-10 fw-700 mt-3">For Choosing {APP_NAME}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            {/* card 1 Starts */}
            <div className="card withdraw_card shadow-lg border-0">
                <div className="card-body px-0">
                    <h5 className="text-uppercase fw-semibold  mb-2 px-0">Withdraw Amount</h5>

                    {amount && (
                        <h3 className="fw-bold text-gradient mb-3">
                            {CURRENCY_SYMBOL} {amount}
                        </h3>
                    )}

                    {(bankDetails || bank) && (
                        <div className="bank-info bg-glass p-3 rounded-4 mt-3">
                            <h5 className="fw-semibold text-success fw-bold mb-2 px-0">Bank Information</h5>
                            <div className="text-grey small">
                                <p className="mb-1">
                                    Bank Name: <strong>{bankDetails?.bank_name || bank?.bank_name}</strong>
                                </p>
                                <p className="mb-1">
                                    Account Holder:{" "}
                                    <strong>{bankDetails?.account_holder_name || bank?.account_name}</strong>
                                </p>
                                <p className="mb-1">
                                    Account Number:{" "}
                                    <strong>{bankDetails?.account_number || bank?.account_masked}</strong>
                                </p>
                                {bankDetails?.ifsc_code && (
                                    <p className="mb-0">
                                        Branch Code: <strong>{bankDetails.ifsc_code}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {!bankId || !amount ? (
                        <div className="text-danger mt-3 alert alert-light border-start border-danger">
                            {!amount && (
                                <p className="mb-1">
                                    <i className="fa-solid fa-hand-point-right me-1"></i>
                                    Please select an amount in Step 1 before continuing.
                                </p>
                            )}
                            {!bankId && (
                                <p className="mb-0">
                                    <i className="fa-solid fa-hand-point-right me-1"></i>
                                    Please select a bank account in Step 2 before continuing.
                                </p>
                            )}
                        </div>
                    ) : (
                        <form className="form-control_container mt-4" onSubmit={formik.handleSubmit}>
                            {formik.errors.api &&
                                (Array.isArray(formik.errors.api) ? (
                                    <ul className="text-danger small mb-2">
                                        {formik.errors.api.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-danger small mb-2">{formik.errors.api}</p>
                                ))}

                            <div className="d-flex justify-content-center">
                                <button
                                    type="submit"
                                    className="btn btn-gradient w-25 mt-3 rounded-pill py-2 fw-semibold"
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? "Submitting..." : "Submit "}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* card 1 Starts */}
        </>
    );
};

export default WithdrawAmountRequest;
