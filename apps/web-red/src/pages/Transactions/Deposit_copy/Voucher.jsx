import React, {useContext, useEffect, useRef, useState} from "react";
// import {getPortalSettings, sendDepositRequest} from "../../../../API/depositAPI";
import {getPortalSettings, sendDepositRequest} from "@core/api/depositAPI";
import {toast, ToastContainer} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {useFormik} from "formik";
// import AuthContext from "../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import * as Yup from "yup";
// import {verifyToken} from "../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
// import {CURRENCY_SYMBOL} from "../../../../constants";
import {CURRENCY_SYMBOL} from "@core/constants";

const Voucher = ({amount, setAmount, token, paymentSelectedMethod, formData, setFormData}) => {
    const [amounts, setAmounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bounds, setBounds] = useState({min: null, max: null});
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const settings = await getPortalSettings("deposit", token);
                const min = Number(settings?.min_deposit);
                const max = Number(settings?.max_deposit);

                if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max) {
                    setAmounts([]);
                    setBounds({min: null, max: null});
                } else {
                    setBounds({min, max});
                    setAmounts(generateFourButtons(min, max));
                }
            } catch (err) {
                console.error("Failed to fetch portal settings:", err);
                setAmounts([]);
                setBounds({min: null, max: null});
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    /* ---------- handlers ---------- */
    const handleSelectAmount = (value) => {
        setAmount(String(value));
        setError(""); // quick-pick is always valid
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setAmount(val);

        if (val === "") return setError("");

        const num = Number(val);
        if (!Number.isFinite(num)) {
            setError("Enter a valid number");
            return;
        }
        const {min, max} = bounds;
        if (min != null && num < min) {
            setError(`Minimum allowed is {CURRENCY_SYMBOL} ${min.toLocaleString("en-IN")}`);
        } else if (max != null && num > max) {
            setError(`Maximum allowed is {CURRENCY_SYMBOL} ${max.toLocaleString("en-IN")}`);
        } else {
            setError("");
        }
    };

    const handleAmountBlur = () => {
        const num = Number(amount);
        if (!Number.isFinite(num)) return;
        const {min, max} = bounds;
        let v = num;
        if (min != null && v < min) v = min;
        if (max != null && v > max) v = max;
        if (v !== num) setAmount(String(v));
    };

    // upload photo Starts
    // console.log("testing from the request deposit", paymentSelectedMethod);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate(); // Navigation function
    const {user} = useContext(AuthContext);
    // const token = user?.token;
    const formik = useFormik({
        enableReinitialize: true, // 🟣 IMPORTANT!
        initialValues: {
            amount: amount || "",
            // utr_number: "",
            // payment_screenshot: null,
            // amount: formData.amount,
            paymentSelectedMethod: formData.paymentSelectedMethod,
            utr_number: formData.utr_number,
            payment_screenshot: formData.payment_screenshot,
        },
        validationSchema: Yup.object({
            utr_number: Yup.string().required("UTR number is required"),
            amount: Yup.string().required("Amount is required"),
        }),
        onSubmit: async (values, {setSubmitting, setErrors, resetForm}) => {
            try {
                // ✅ Step 1: Verify token with its own error handler
                let tokenRes;
                try {
                    tokenRes = await verifyToken(token);
                    if (tokenRes.status !== "success") {
                        setErrors({
                            api: tokenRes.message || "Invalid or expired token. Please log in again.",
                        });
                        setSubmitting(false);
                        return;
                    }
                } catch (verifyError) {
                    const errorMessage =
                        verifyError.response?.data?.message || "Invalid or expired token. Please log in again.";
                    setErrors({api: errorMessage});
                    // Redirect after a short delay (e.g., 2 seconds)
                    setTimeout(() => {
                        navigate("/login");
                    }, 5000);
                    setSubmitting(false);
                    return;
                }

                // ✅ Step 2: Prepare formData
                const formData = new FormData();
                formData.append("payment_detail_id", 2);
                formData.append("amount", values.amount);
                formData.append("utr", values.utr_number);
                if (values.payment_screenshot) {
                    formData.append("image", values.payment_screenshot);
                }

                // ✅ Step 3: Send deposit request
                const response = await sendDepositRequest({
                    token,
                    amount: values.amount,
                    utr_number: values.utr_number,
                    payment_screenshot: values.payment_screenshot,
                    paymentSelectedMethod: paymentSelectedMethod,
                });

                // ✅ Step 4: Handle success/failure
                if (response.status === "success") {
                    // alert("Deposit request sent successfully!");
                    setShowModal(true);
                    resetForm();
                    // navigate(routes.transactions.depositHistory);
                } else {
                    setErrors({
                        api: response.data.message || "Failed to send deposit request.",
                    });
                }
            } catch (error) {
                // catch (error) {
                //   // ✅ Step 5: General error fallback
                //   // if (error.response) {
                //   //   const serverMessage =
                //   //     error.response.data?.msg || // ✅ use "msg" instead of "message"
                //   //     "Something went wrong!";
                //   //   setErrors({ api: serverMessage });
                //   // } else if (error.request) {
                //   //   setErrors({ api: "Server not responding. Please try again later." });
                //   // } else {
                //   //   setErrors({ api: "Something went wrong. Try again." });
                //   // }
                //   if (error.response) {
                //     setErrors({ api: error.response.data.message || "Invalid request" });
                //   } else if (error.request) {
                //     setErrors({ api: "Server not responding. Please try again later." });
                //   } else {
                //     setErrors({ api: "Something went wrong. Try again." });
                //   }
                // }
                if (error.response) {
                    const data = error.response.data;
                    const apiErrors = new Set();

                    // ✅ Collect Laravel-style validation errors
                    if (data.errors) {
                        Object.values(data.errors).forEach((fieldErrors) => {
                            fieldErrors.forEach((msg) => apiErrors.add(msg));
                        });
                    }

                    // ✅ Add message only if not already included
                    if (data.msg && !apiErrors.has(data.msg)) {
                        apiErrors.add(data.msg);
                    }
                    // if (data.message && !apiErrors.has(data.message)) {
                    //   apiErrors.add(data.message);
                    // }

                    if (apiErrors.size === 0) {
                        apiErrors.add("Something went wrong.");
                    }

                    // ✅ Set final cleaned list to formik
                    setErrors({api: Array.from(apiErrors)});
                } else if (error.request) {
                    setErrors({
                        api: ["Server not responding. Please try again later."],
                    });
                } else {
                    setErrors({api: ["Something went wrong. Try again."]});
                }
            }
            setSubmitting(false);
        },
    });

    // ✅ Handle File Upload
    // const handleFileChange = (event) => {
    //   const file = event.currentTarget.files[0];
    //   formik.setFieldValue("payment_screenshot", file);
    // };
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        formik.setFieldValue("payment_screenshot", file);

        setFormData((prev) => ({
            ...prev,
            payment_screenshot: file,
        }));
    };
    // upload photo Ends

    return (
        <div className="card bg_light_grey account_input-textbox-container">
            <div className="card-body py-4 pb-5">
                <h5 className="mb-3">Enter Voucher ID</h5>

                <form className="form-control_container" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-field mb-1">
                        <input
                            required
                            className={`input ${error ? "is-invalid" : ""}`}
                            type="number"
                            value={amount}
                            min={bounds.min ?? undefined}
                            max={bounds.max ?? undefined}
                            onChange={handleAmountChange}
                            onBlur={handleAmountBlur}
                            inputMode="numeric"
                        />
                        <label className="label" htmlFor="input">
                            Enter Voucher ID
                        </label>
                    </div>

                    {/* hint / error */}
                    {error ? (
                        <small className="text-danger d-block mb-3">{error}</small>
                    ) : bounds.min != null && bounds.max != null ? (
                        <small className="text-muted d-block mb-3">
                            Allowed range: {CURRENCY_SYMBOL} {bounds.min.toLocaleString("en-IN")} – {CURRENCY_SYMBOL}{" "}
                            {bounds.max.toLocaleString("en-IN")}
                        </small>
                    ) : null}

                    <div className="d-flex justify-content-center">
                        <button
                            type="submit"
                            className="btn btn-login w-25 mt mb- text-capitalize"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? "Submitting ..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Voucher;

/* ------------ helpers ------------ */

/**
 * Pick a “nice” step (…000) based on the range so we get clean values.
 * Targets ~2 interior buttons.
 */
function pickStep(min, max) {
    const range = max - min;
    if (range >= 200000) return 50000; // 50k steps
    if (range >= 100000) return 20000; // 20k steps
    if (range >= 50000) return 10000; // 10k steps
    if (range >= 20000) return 5000; // 5k steps
    if (range >= 10000) return 2000; // 2k steps
    return 1000; // 1k step fallback
}

function roundToStep(n, step) {
    return Math.round(n / step) * step;
}

/**
 * Generate exactly 4 buttons:
 * [min, niceMid1, niceMid2, max]
 * where the two mids are clean …000 numbers inside the range.
 */
function generateFourButtons(min, max) {
    const step = pickStep(min, max);

    // target mids around 1/3 and 2/3 of the range
    const t1 = min + (max - min) / 3;
    const t2 = min + (2 * (max - min)) / 3;

    let m1 = roundToStep(t1, step);
    let m2 = roundToStep(t2, step);

    // clamp to (min, max)
    m1 = Math.min(Math.max(m1, min), max);
    m2 = Math.min(Math.max(m2, min), max);

    // ensure they don't collide with min/max
    if (m1 === min) m1 = Math.min(m1 + step, max);
    if (m1 === max) m1 = Math.max(max - step, min);

    if (m2 === max) m2 = Math.max(m2 - step, min);
    if (m2 === min) m2 = Math.min(min + step, max);

    // if mids collide with each other, spread them by a step if possible
    if (m1 === m2) {
        const tryLeft = m1 - step;
        const tryRight = m2 + step;
        if (tryLeft > min) m1 = tryLeft;
        else if (tryRight < max) m2 = tryRight;
    }

    // build unique, sorted list with min & max guaranteed
    const set = new Set([min, m1, m2, max]);
    const arr = Array.from(set).sort((a, b) => a - b);

    // ensure exactly 4 entries: if we lost one due to collisions, fill using step grid
    if (arr.length < 4) {
        const first = Math.ceil(min / step) * step;
        for (let v = first; v <= max && arr.length < 4; v += step) {
            if (!arr.includes(v)) arr.splice(arr.length - 1, 0, v); // insert before max
        }
    }

    // if more than 4 (unlikely), trim to 4 while keeping min & max
    if (arr.length > 4) {
        const t1 = min + (max - min) / 3;
        const t2 = min + (2 * (max - min)) / 3;
        const mids = arr.slice(1, -1);
        mids.sort((a, b) => {
            const da = Math.min(Math.abs(a - t1), Math.abs(a - t2));
            const db = Math.min(Math.abs(b - t1), Math.abs(b - t2));
            return da - db;
        });
        return [arr[0], mids[0], mids[1], arr[arr.length - 1]].sort((a, b) => a - b);
    }

    return arr;
}
