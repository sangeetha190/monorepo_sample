import {useFormik} from "formik";
import React, {useContext, useState} from "react";
// import AuthContext from "../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import * as Yup from "yup";
// import BASE_URL from "../../../../API/api";
// import axios from "axios";
// import routes from "../../../routes/route";
import routes from "../../../routes/routes";
import {Link, useNavigate} from "react-router-dom";
// import {sendDepositRequest} from "../../../../API/depositAPI";
import {sendDepositRequest} from "@core/api/depositAPI";
// import {verifyToken} from "../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
// import {APP_NAME, CURRENCY_SYMBOL} from "../../../../constants";
import {APP_NAME, CURRENCY_SYMBOL} from "@core/constants";
const DepositAmountRequest = ({amount, paymentSelectedMethod, formData, setFormData}) => {
    // console.log("testing from the request deposit", paymentSelectedMethod);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate(); // Navigation function
    const {user} = useContext(AuthContext);
    const token = user?.token;
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
                    // Redirect after a short delay (e.g., 2 seconds)
                    setTimeout(() => {
                        navigate("/login");
                    }, 5000);
                    setErrors({api: errorMessage});
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
    return (
        <>
            {/* card 1 Starts */}
            <div className="card bg_light_grey account_input-textbox-container">
                {/* <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
            <h5 className="text-center mb-0">***Deposit Amount Form***</h5>
          </div> */}
                <div className="card-body">
                    {amount && paymentSelectedMethod ? (
                        <>
                            <h5 className=" mb-0">Deposit Amount</h5>
                            <h3 className="text-success">
                                {CURRENCY_SYMBOL} {amount}
                            </h3>
                            <h5 className="mb-3">
                                You have selected the {paymentSelectedMethod === 1 ? "BANK" : "UPI"} payment method.
                            </h5>
                            {/* test starts */}

                            {/* test Ends */}
                            <form className="form-control_container" onSubmit={formik.handleSubmit}>
                                {formik.errors.api &&
                                    (Array.isArray(formik.errors.api) ? (
                                        <p className="text-danger ">
                                            {formik.errors.api.map((err, index) => (
                                                <li key={index}>{err}</li>
                                            ))}
                                        </p>
                                    ) : (
                                        <p className="text-danger">{formik.errors.api}</p>
                                    ))}
                                {/* <p>Testing</p>
                {formik.errors.api && (
                  <p className="text-danger">{formik.errors.api}</p>
                )} */}
                                <div className="input-field mb-3 mt-3" style={{display: "none"}}>
                                    <p className="mb-0">
                                        You have selected {CURRENCY_SYMBOL}
                                        {amount} to deposit.
                                    </p>
                                    <input
                                        required
                                        className="input readonly-input mt-1"
                                        type="text"
                                        name="amount"
                                        value={formik.values.amount}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor="formFile" className="form-label text-white mb-0">
                                        Payment Screenshot
                                    </label>
                                    <div className="custom-file-input" style={{marginTop: 0}}>
                                        <label htmlFor="formFile">
                                            <span className="btn">Upload File</span>
                                            <span className="file-name">
                                                {formik.values.payment_screenshot
                                                    ? formik.values.payment_screenshot.name
                                                    : "No file chosen"}
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            id="formFile"
                                            className="form-control"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>

                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="utr_number"
                                        value={formik.values.utr_number}
                                        // onChange={formik.handleChange}
                                        onChange={(e) => {
                                            formik.handleChange(e);
                                            setFormData((prev) => ({
                                                ...prev,
                                                utr_number: e.target.value,
                                            }));
                                        }}
                                        onBlur={formik.handleBlur}
                                    />
                                    <label className="label" htmlFor="utr_number">
                                        Enter UTR No
                                    </label>
                                    {formik.touched.utr_number && formik.errors.utr_number && (
                                        <p className="text-danger">{formik.errors.utr_number}</p>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center">
                                    <button
                                        type="submit"
                                        className="btn btn-login w-50 mt mb- text-capitalize"
                                        disabled={formik.isSubmitting}
                                    >
                                        {formik.isSubmitting ? "Submitting ..." : "Submit"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-danger mt-3">
                            {!amount && (
                                <p>
                                    <i className="fa-solid fa-hand-point-right"></i> Please select an amount in{" "}
                                    <strong>Step 1</strong> before continuing.
                                </p>
                            )}
                            {!paymentSelectedMethod && (
                                <p>
                                    <i className="fa-solid fa-hand-point-right"></i> Please select a payment method and
                                    deposit the amount in <strong>Step 2</strong> before continuing.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* card 1 Starts */}

            {/* <!-- Modal --> */}
            {/* {showModal && (
        <div
          className="modal fade"
          id="payment"
          tabindex="-1"
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered modal-sm justify-content-center">
            <div className="modal-content" style={{ width: "220px" }}>
              <div className="modal-body d-flex flex-column align-items-center">
                <img src="assets/img/icons/rupee.gif" className="mb-2 w-75" />
                <div className="fw-700 fs-13 text-center text-black mb-3">
                  Your Request <br />
                  Is In Our Queue!
                </div>
                <span
                  className="btn text-white green-bg"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  Thank You
                </span>
                <span className="text-dark-grey fs-10 fw-700 mt-3">
                  For Choosing jiboomba 
                </span>
              </div>
            </div>
          </div>
        </div>
      )} */}

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
                                <Link to={routes.transactions.depositHistory}>
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
