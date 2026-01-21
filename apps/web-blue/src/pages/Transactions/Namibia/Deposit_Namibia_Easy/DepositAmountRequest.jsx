import {useFormik} from "formik";
import {useContext, useState} from "react";
// import AuthContext from "../../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import * as Yup from "yup";
// import routes from "../../../../routes/route";
import routes from "../../../../routes/routes";
import {Link} from "react-router-dom";
// import {sendDepositRequestNamibiaEasywallet} from "../../../../../API/depositAPI";
import {sendDepositRequestNamibiaEasywallet} from "@core/api/depositAPI";
// import {verifyToken} from "../../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
// import {APP_NAME, CURRENCY_SYMBOL} from "../../../../../constants";
import {APP_NAME, CURRENCY_SYMBOL} from "@core/constants";

const DepositAmountRequest = ({amount, paymentSelectedMethod, formData, setFormData}) => {
    // console.log("testing from the request deposit", paymentSelectedMethod);
    const [showModal, setShowModal] = useState(false);
    const {user} = useContext(AuthContext);
    const token = user?.token;
    const User_id = user?.id;
    // console.log("user================", User_id);

    const formik = useFormik({
        enableReinitialize: true, // 🟣 IMPORTANT!
        initialValues: {
            amount: amount || "",
            paymentSelectedMethod: formData.paymentSelectedMethod,
            utr_number: formData.utr_number,
            payment_screenshot: formData.payment_screenshot,
        },
        validationSchema: Yup.object({
            amount: Yup.string().required("Amount is required"),

            // UTR is OPTIONAL, but if provided it must be 12–22 alphanumeric
            utr_number: Yup.string()
            .trim()
            .nullable()
            .notRequired()
            .test(
                "utr-format",
                "If entered, UTR must be 12–22 characters (A–Z, 0–9).",
                (v) => !v || /^[A-Za-z0-9]{12,22}$/.test(v)
            ),

            // Image is REQUIRED
            payment_screenshot: Yup.mixed()
            .required("Payment screenshot is required")
            .test(
                "fileType",
                "Only image files are allowed",
                (file) => !file || (file && file.type && file.type.startsWith("image/"))
            )
            .test("fileSize", "Max file size is 5MB", (file) => !file || file.size <= 5 * 1024 * 1024),
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
                    setSubmitting(false);
                    return;
                }

                // ✅ Step 2: Prepare formData
                const formData = new FormData();
                formData.append("payment_detail_id", 2);
                formData.append("amount", values.amount);
                formData.append("utr", values.utr_number);

                // ✅ Step 3: Send deposit request
                const response = await sendDepositRequestNamibiaEasywallet({
                    token,
                    amount: values.amount,
                    utr_number: values.utr_number,
                    paymentSelectedMethod: paymentSelectedMethod,
                    payment_screenshot: values.payment_screenshot,
                    // player_id: User_id,
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

    //   const handleFileChange = (e) => {
    //   const file = e.currentTarget.files?.[0] || null;
    //   formik.setFieldValue("payment_screenshot", file);   // ✅ needed for Yup
    //   setFormData((prev) => ({ ...prev, payment_screenshot: file })); // if you send later
    // };
    return (
        <>
            {/* card 1 Starts */}
            <div className="card bg_light_grey account_input-textbox-container">
                {/* <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
            <h5 className="text-center mb-0">***Deposit Amount Form***</h5>
          </div> */}
                <div className="uxcard-body">
                    {amount && paymentSelectedMethod ? (
                        <>
                            <div className="uxcard-header text-center mb-4">
                                <h5 className="uxcard-title mb-1">Deposit Amount</h5>
                                <h3 className="uxcard-amount">
                                    {CURRENCY_SYMBOL} {amount}
                                </h3>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="uxcard-form">
                                {/* API Error */}
                                {formik.errors.api && (
                                    <div className="uxcard-alert-error mb-3 text-danger">
                                        {Array.isArray(formik.errors.api)
                                            ? formik.errors.api.map((err, index) => <li key={index}>{err}</li>)
                                            : formik.errors.api}
                                    </div>
                                )}

                                {/* Screenshot Upload */}
                                <div className="uxcard-upload mb-3">
                                    <label htmlFor="formFile" className="uxcard-label">
                                        Payment Screenshot <span className="text-danger">*</span>
                                    </label>

                                    <div className="uxcard-upload-box">
                                        <label htmlFor="formFile" className="uxcard-upload-label">
                                            <i className="fa-solid fa-upload me-2"></i>
                                            <span>
                                                {formik.values.payment_screenshot
                                                    ? formik.values.payment_screenshot.name
                                                    : "No file chosen"}
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            id="formFile"
                                            accept="image/*"
                                            hidden
                                            onChange={handleFileChange}
                                            onBlur={() => formik.setFieldTouched("payment_screenshot", true)}
                                        />
                                    </div>

                                    {formik.touched.payment_screenshot && formik.errors.payment_screenshot && (
                                        <small className="uxcard-error-text mt-1 d-block">
                                            {formik.errors.payment_screenshot}
                                        </small>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="text-center mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-login w-25 mt mb- text-capitalize w-md-50"
                                        disabled={formik.isSubmitting}
                                    >
                                        {formik.isSubmitting ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin me-2"></i>
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="uxcard-empty text-center mt-3">
                            {!amount && (
                                <p>
                                    <i className="fa-solid fa-hand-point-right text-warning me-2"></i>
                                    Please select an amount in <strong>Step 1</strong> before continuing.
                                </p>
                            )}
                            {!paymentSelectedMethod && (
                                <p>
                                    <i className="fa-solid fa-hand-point-right text-warning me-2"></i>
                                    Please select a payment method in <strong>Step 2</strong>.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

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
                                <img src="/assets/img/icons/coin.png" className="mb-2 w-75 coin-animate" alt="coin" />
                                <div className="fw-700 fs-13 text-center text-black mb-3">
                                    Your Request <br />
                                    Is In Our Queue!
                                </div>
                                <Link to={routes.transactions.all_depositHistory}>
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
        </>
    );
};

export default DepositAmountRequest;
