import React, {useContext, useEffect, useRef, useState} from "react";
// import AuthContext from "../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";

import {toast, ToastContainer} from "react-toastify";
// import {getDepositMethods, getPaymentDetails} from "../../../../API/depositAPI";
import {getDepositMethods, getPaymentDetails} from "@core/api/depositAPI";
// import {verifyToken} from "../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";

const SelectPaymentMethod = ({paymentSelectedMethod, setPaymentSelectedMethod}) => {
    // console.log("selectedMethod", paymentSelectedMethod);

    const [depositMethod, setDepositMethod] = useState([]); // Payment methods
    const [selectedMethod, setSelectedMethod] = useState(null); // Selected method ID
    const [paymentDetails, setPaymentDetails] = useState(null); // Payment details from API
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [methodsLoading, setMethodsLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const lastRequestId = useRef(0);
    const inputRef1 = useRef();
    const inputRef2 = useRef();
    const inputRef3 = useRef();
    const inputRef4 = useRef();
    const inputRef5 = useRef();
    const [copied1, setCopied1] = useState(false);
    const [copied2, setCopied2] = useState(false);
    const [copied3, setCopied3] = useState(false);
    const [copied4, setCopied4] = useState(false);
    const [copied5, setCopied5] = useState(false);

    // const navigate = useNavigate();
    // const handleCopy = (ref, setCopied) => {
    //   if (ref.current) {
    //     navigator.clipboard.writeText(ref.current.value);
    //     setCopied(true);
    //     setTimeout(() => setCopied(false), 2000);
    //   }
    // };
    const handleCopy = (ref, setCopied) => {
        if (ref.current) {
            const textToCopy = ref.current.value;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                .writeText(textToCopy)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => {
                    console.error("Clipboard API failed", err);
                    toast.error("Copy failed. Try manually.");
                });
            } else {
                try {
                    // ✅ Create a temporary textarea for fallback
                    const textarea = document.createElement("textarea");
                    textarea.value = textToCopy;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);

                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (error) {
                    toast.error("Copy not supported in this browser.");
                }
            }
        }
    };

    const {user} = useContext(AuthContext);
    const token = user?.token;

    // Fetch deposit methods

    // fetch methods
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setMethodsLoading(true);
            try {
                const methodRes = await getDepositMethods(token);
                if (methodRes.status === "success") {
                    const methods = methodRes.paymentMethod || [];
                    setDepositMethod(methods);

                    // ✅ default to id=2 if exists, else first
                    const upi = methods.find((m) => m.id === 1);
                    const firstId = upi?.id ?? methods[0]?.id;
                    if (firstId) {
                        setSelectedMethod(firstId);
                        setPaymentSelectedMethod(firstId);
                        fetchPaymentDetails(firstId);
                    }
                } else {
                    toast.error(methodRes.msg || "Failed to load payment methods", {
                        toastId: "deposit-method-error",
                    });
                }
            } catch (err) {
                toast.error(err.message || "Something went wrong while fetching methods.", {
                    toastId: "deposit-method-error",
                });
            } finally {
                setMethodsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const fetchPaymentDetails = async (methodId) => {
        if (!token) return;

        setSelectedMethod(methodId);
        setPaymentSelectedMethod(methodId);

        // Clear previous UI state immediately
        setError(null);
        setPaymentDetails(null);
        setLoading(true);

        // const reqId = ++lastRequestId;

        setDetailsLoading(true);
        const reqId = ++lastRequestId.current;

        try {
            const res = await getPaymentDetails(token, methodId); // throws on status:"error"
            // Ignore stale responses if user clicked another method quickly
            // if (reqId !== lastRequestId) return;
            if (reqId !== lastRequestId.current) return;

            setPaymentDetails(res.paymentDetails || null);
        } catch (err) {
            const msg = err?.message || err?.response?.data?.msg || "Something went wrong. Please try again.";

            // if (reqId !== lastRequestId) return;
            if (reqId !== lastRequestId.current) return;

            setError(msg); // if you conditionally render error blocks
            // toast.error(msg, { toastId: "payment-details-error" });
            setPaymentDetails(null); // ensure details don't render on error
        } finally {
            // if (reqId === lastRequestId) setLoading(false);
            if (reqId === lastRequestId.current) setDetailsLoading(false);
        }
    };

    return (
        <div className=" bg_light_grey rounded-2  py-3">
            <div className="mx-3">
                <h5 className="mb-3">Select Payment Method</h5>

                {methodsLoading && <p>Loading payment methods...</p>}
            </div>
            <div>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    className="success-toaster my-3"
                />
            </div>
            {/* Bootstrap Tab Content */}
            <div className="tab-content mt-3" id="myTabContent">
                {depositMethod.map((method) => (
                    <div
                        key={method.id}
                        className={`tab-pane fade ${selectedMethod === method.id ? "show active" : ""}`}
                        id={`content-${method.id}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${method.id}`}
                    >
                        {/* Bank Details (Only for Bank) */}
                        {Number(selectedMethod) === 1 && (
                            <>
                                {error ? (
                                    <div className="text-center py-4 text-danger">{error}</div>
                                ) : detailsLoading ? (
                                    <div className="text-center py-4 text-white">Loading Bank details...</div>
                                ) : paymentDetails ? (
                                    <div className="card account_input-textbox-container border-0">
                                        <div className="card-body pt-0 py-0">
                                            <h5 className="mb-0">Bank Details</h5>
                                            <div className="form-control_container">
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={paymentDetails?.bank_name}
                                                        readOnly
                                                        ref={inputRef1}
                                                        disabled
                                                    />
                                                    <div
                                                        className="position-absolute copy-text"
                                                        style={{
                                                            right: "10px",
                                                            top: "60%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <button onClick={() => handleCopy(inputRef1, setCopied1)}>
                                                            <i className="fa-solid fa-copy text-white fs-5"></i>
                                                        </button>
                                                        {copied1 && <span className="copied-tooltip">Copied</span>}
                                                    </div>
                                                </div>
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={paymentDetails.account_holder_name}
                                                        readOnly
                                                        ref={inputRef2}
                                                        disabled
                                                    />
                                                    <div
                                                        className="position-absolute copy-text"
                                                        style={{
                                                            right: "10px",
                                                            top: "60%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <button onClick={() => handleCopy(inputRef2, setCopied2)}>
                                                            <i className="fa-solid fa-copy text-white fs-5"></i>
                                                        </button>
                                                        {copied2 && <span className="copied-tooltip">Copied</span>}
                                                    </div>
                                                </div>
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={paymentDetails.account_number}
                                                        readOnly
                                                        ref={inputRef3}
                                                        disabled
                                                    />
                                                    <div
                                                        className="position-absolute copy-text"
                                                        style={{
                                                            right: "10px",
                                                            top: "60%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <button onClick={() => handleCopy(inputRef3, setCopied3)}>
                                                            <i className="fa-solid fa-copy text-white fs-5"></i>
                                                        </button>
                                                        {copied3 && <span className="copied-tooltip">Copied</span>}
                                                    </div>
                                                </div>
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={paymentDetails.ifsc_code}
                                                        readOnly
                                                        ref={inputRef4}
                                                        disabled
                                                    />
                                                    <div
                                                        className="position-absolute copy-text"
                                                        style={{
                                                            right: "10px",
                                                            top: "60%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <button onClick={() => handleCopy(inputRef4, setCopied4)}>
                                                            <i className="fa-solid fa-copy text-white fs-5"></i>
                                                        </button>
                                                        {copied4 && <span className="copied-tooltip">Copied</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-warning">
                                        No bank details found for the selected method
                                    </div>
                                )}
                            </>
                        )}

                        {/* UPI Details (Only for UPI) */}
                        {Number(selectedMethod) === 2 && (
                            <>
                                {error ? (
                                    <div className="text-center py-4 text-danger">
                                        {" "}
                                        No payment details found for the selected method
                                    </div>
                                ) : detailsLoading ? (
                                    <div className="text-center py-4 text-white">Loading UPI details...</div>
                                ) : paymentDetails ? (
                                    <>
                                        <div className="card bg_light_grey account_input-textbox-container mt-3 border-0">
                                            <div className="card-body pt-0">
                                                <h5 className="text-center mb-2">
                                                    UPI Payment Details{" "}
                                                    {/* {paymentDetails?.is_best_pick && (
                            <span className="badge bg-success">Best Pick</span>
                          )} */}
                                                </h5>

                                                {/* QR Code */}
                                                <div className="d-flex justify-content-center mb-0">
                                                    {paymentDetails?.qr_code ? (
                                                        <img
                                                            // src={`/${paymentDetails?.qr_code}`}
                                                            src={paymentDetails.qr_code}
                                                            className="w-50"
                                                            alt="QR Code"
                                                            onError={(e) => (e.target.style.display = "none")}
                                                        />
                                                    ) : (
                                                        <div className="text-muted">No QR Code</div>
                                                    )}
                                                </div>

                                                {/* UPI ID */}
                                                <div className="form-control_container">
                                                    <div className="input-field">
                                                        <input
                                                            className="input"
                                                            type="text"
                                                            value={paymentDetails?.upi_id || ""}
                                                            readOnly
                                                            disabled
                                                            ref={inputRef5}
                                                        />
                                                        <div
                                                            className="position-absolute copy-text"
                                                            style={{
                                                                right: "10px",
                                                                top: "60%",
                                                                transform: "translateY(-50%)",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <button onClick={() => handleCopy(inputRef5, setCopied5)}>
                                                                <i className="fa-solid fa-copy text-white fs-5"></i>
                                                            </button>
                                                            {copied5 && <span className="copied-tooltip">Copied</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Optional Extra Info */}
                                                {paymentDetails?.account_holder_name && (
                                                    <p className="mt-2 text-white text-center">
                                                        Account Holder: {paymentDetails?.account_holder_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 text-warning">
                                        No payment details found for the selected method
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectPaymentMethod;
