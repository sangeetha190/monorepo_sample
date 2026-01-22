import React, {useContext, useEffect, useState} from "react";
// import AuthContext from "../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import axios from "axios";
// import BASE_URL from "../../../API/api";
import {BASE_URL} from "@core/api/api";
import {useFormik} from "formik";
import * as Yup from "yup";
// import StickyHeader from "../../layouts/Header/Header";
import StickyHeader from "../../../Home/Components/Header/Header";
// import Footer from "../../layouts/footer/Footer";
import Footer from "../../../Home/Components/Footer/Footer";
// import BottomFooter from "../../layouts/footer/BottomFooter";
import BottomFooter from "../../../Home/Components/Footer/BottomFooter";

function Deposit() {
    const [depositMethod, setDepositMethod] = useState([]); // Payment methods
    const [selectedMethod, setSelectedMethod] = useState(null); // Selected method ID
    const [paymentDetails, setPaymentDetails] = useState(null); // Payment details from API
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [activeStep, setActiveStep] = useState("step1");

    const {user} = useContext(AuthContext);
    const token = user?.token;

    // Fetch deposit methods
    useEffect(() => {
        const fetchDepositMethods = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/player/get-deposit-method`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                if (response.data.status === "success") {
                    setDepositMethod(response.data.paymentMethod || []);
                } else {
                    setError(response.data.msg || "Failed to load payment methods");
                }
            } catch (err) {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDepositMethods();
    }, [token]);

    // Fetch payment details based on method selection
    const fetchPaymentDetails = async (methodId) => {
        if (!token) return;

        setSelectedMethod(methodId); // Update selected method
        setLoading(true);

        try {
            const response = await axios.get(`${BASE_URL}/player/get-payment-detail`, {
                params: {payment_method_id: methodId}, // <-- Pass data as query parameters
                headers: {Authorization: `Bearer ${token}`},
            });

            if (response.data.status === "success") {
                setPaymentDetails(response.data.paymentDetail); // Store payment details
                // console.log(response.data.paymentDetail);
            } else {
                setError(response.data.msg || "Failed to load payment details");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            amount: "",
            utr_number: "",
            payment_screenshot: null, // ✅ Store file separately
        },
        validationSchema: Yup.object({
            utr_number: Yup.string().required("UTR number is required"),
            amount: Yup.string().required("Amount is required"),
        }),
        onSubmit: async (values, {setSubmitting, setErrors, resetForm}) => {
            try {
                const formData = new FormData();
                formData.append("payment_detail_id", 2); // ✅ Add payment_detail_id
                formData.append("amount", values.amount);
                formData.append("utr", values.utr_number);

                if (values.payment_screenshot) {
                    formData.append("image", values.payment_screenshot); // ✅ Correct key name
                }

                const response = await axios.post(`${BASE_URL}/player/send-deposit-request`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.data.status === "success") {
                    alert("Deposit request sent successfully!");
                    resetForm(); // ✅ Reset form after success
                } else {
                    setErrors({
                        api: response.data.message || "Failed to send deposit request.",
                    });
                }
            } catch (error) {
                if (error.response) {
                    setErrors({api: error.response.data.message || "Invalid request"});
                } else if (error.request) {
                    setErrors({api: "Server not responding. Please try again later."});
                } else {
                    setErrors({api: "Something went wrong. Try again."});
                }
            }
            setSubmitting(false);
        },
    });

    // ✅ Handle File Upload
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        formik.setFieldValue("payment_screenshot", file);
    };

    // test starts

    const steps = [
        {
            id: "step1",
            icon: "fas fa-folder-open",
            title: "Step 1",
            content: () => <SelectAmount />, // ✅ FIX: Wrap in a function
        },
        {
            id: "step2",
            icon: "fas fa-briefcase",
            title: "Step 2",
            content: () => <SelectPaymentMethod />,
        },
        {
            id: "step3",
            icon: "fas fa-star",
            title: "Step 3",
            content: () => <DepositAmountRequest />,
        },
        {
            id: "step4",
            icon: "fas fa-flag-checkered",
            title: "Complete",
            content: () => "You have successfully completed all steps.",
        },
    ];

    const goNext = () => {
        const currentIndex = steps.findIndex((step) => step.id === activeStep);
        if (currentIndex < steps.length - 1) {
            setActiveStep(steps[currentIndex + 1].id);
        }
    };

    const goPrevious = () => {
        const currentIndex = steps.findIndex((step) => step.id === activeStep);
        if (currentIndex > 0) {
            setActiveStep(steps[currentIndex - 1].id);
        }
    };
    // test Ends
    return (
        <>
            <div>
                {/* <StickyHeader /> */}

                {/* test Starts */}
                <div className="container">
                    <div className="wizard my-5">
                        <ul className="nav nav-tabs justify-content-center">
                            {steps.map((step, index) => (
                                <li key={step.id} className="nav-item flex-fill" role="presentation">
                                    <a
                                        className={`nav-link rounded-circle mx-auto d-flex align-items-center justify-content-center ${
                                            activeStep === step.id ? "active" : ""
                                        }`}
                                        href={`#${step.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveStep(step.id);
                                        }}
                                    >
                                        <i className={step.icon}></i>
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Navigation Tabs */}
                        <div className="tab-content">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`tab-pane fade ${activeStep === step.id ? "show active" : ""}`}
                                    id={step.id}
                                >
                                    <h3>{step.title}</h3>
                                    {step.content()} {/* ✅ FIX: Call the function */}
                                    {/* <div className="d-flex justify-content-between">
                    {index > 0 && (
                      <button
                        className="btn btn-secondary previous"
                        onClick={goPrevious}
                      >
                        <i className="fas fa-angle-left"></i> Back
                      </button>
                    )}
                    {index < steps.length - 1 ? (
                      <button className="btn btn-info next" onClick={goNext}>
                        Continue <i className="fas fa-angle-right"></i>
                      </button>
                    ) : (
                      <button className="btn btn-info next">
                        Submit <i className="fas fa-angle-right"></i>
                      </button>
                    )}
                  </div> */}
                                </div>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`tab-pane fade ${activeStep === step.id ? "show active" : ""}`}
                                    id={step.id}
                                >
                                    {/* <h3>{step.title}</h3> */}
                                    <p>{step.content}</p>
                                    <div className="d-flex justify-content-between">
                                        {index > 0 && (
                                            <button className="btn btn-secondary previous" onClick={goPrevious}>
                                                <i className="fas fa-angle-left"></i> Back
                                            </button>
                                        )}
                                        {index < steps.length - 1 ? (
                                            <button className="btn btn-info next" onClick={goNext}>
                                                Continue <i className="fas fa-angle-right"></i>
                                            </button>
                                        ) : (
                                            <button className="btn btn-info next">
                                                Submit <i className="fas fa-angle-right"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* test Ends */}
                <section className="container vh-100 pt-40 pb-5">
                    <div className="h-100">
                        <div className="pt-3 pb-2">
                            <div className="container-fluid p-0">
                                <h5 className="mb-3">Select Payment Method</h5>

                                {loading && <p>Loading payment methods...</p>}
                                {error && <p className="text-danger">{error}</p>}

                                {depositMethod.length === 0 && !loading && !error && (
                                    <p>No payment methods available.</p>
                                )}

                                {/* Bootstrap Tab Navigation */}
                                {depositMethod.length > 0 && !loading && !error && (
                                    <nav className="nav nav-pills d-flex justify-content-between tab_red_active">
                                        {depositMethod.map((method) => (
                                            <button
                                                key={method.id}
                                                className={`nav-link btn-color text-white w-150 ${
                                                    selectedMethod === method.id ? "active" : ""
                                                }`}
                                                onClick={() => fetchPaymentDetails(method.id)} // Fetch details on click
                                                id={`tab-${method.id}`}
                                                data-bs-toggle="tab"
                                                data-bs-target={`#content-${method.id}`} // Bootstrap tab switching
                                                type="button"
                                                role="tab"
                                                aria-controls={`content-${method.id}`}
                                                aria-selected={selectedMethod === method.id ? "true" : "false"}
                                            >
                                                <img
                                                    src="assets/img/icons/icons8-deposit-64.png"
                                                    alt="deposit"
                                                    width="30px"
                                                />
                                                {method.name} {method.id}
                                            </button>
                                        ))}
                                    </nav>
                                )}

                                {/* Bootstrap Tab Content */}
                                <div className="tab-content mt-3" id="myTabContent">
                                    {depositMethod.map((method) => (
                                        <div
                                            key={method.id}
                                            className={`tab-pane fade ${
                                                selectedMethod === method.id ? "show active" : ""
                                            }`}
                                            id={`content-${method.id}`}
                                            role="tabpanel"
                                            aria-labelledby={`tab-${method.id}`}
                                        >
                                            {/* Payment Details */}
                                            {/* {selectedMethod === method.id && paymentDetails && (
                <div className="card bg_light_grey account_input-textbox-container">
                  <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                    <h5 className="text-center mb-0">
                      Payment Details for{" "}
                      {paymentDetails.payment_method_name}
                    </h5>
                  </div>
                  <div className="card-body">
                    <pre className="text-white">
                      {JSON.stringify(paymentDetails, null, 2)}
                    </pre>
                  </div>
                </div>
              )} */}

                                            {/* Bank Details (Only for Bank) */}
                                            {selectedMethod === 1 && paymentDetails && paymentDetails.length > 0 && (
                                                <>
                                                    {paymentDetails.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="card bg_light_grey account_input-textbox-container"
                                                        >
                                                            <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                                                <h5 className="text-center mb-0">Bank Details</h5>
                                                            </div>
                                                            <div className="card-body">
                                                                <div className="form-control_container">
                                                                    <div className="input-field mb-3">
                                                                        <input
                                                                            required
                                                                            className="input"
                                                                            type="text"
                                                                            value={item.bank_name}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                    <div className="input-field mb-3">
                                                                        <input
                                                                            required
                                                                            className="input"
                                                                            type="text"
                                                                            value={item.account_holder_name}
                                                                            readOnly
                                                                        />
                                                                        {/* <label className="label">
                                A/C Holder Name
                              </label> */}
                                                                    </div>
                                                                    <div className="input-field mb-3">
                                                                        <input
                                                                            required
                                                                            className="input"
                                                                            type="text"
                                                                            value={item.account_number}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                    <div className="input-field mb-3">
                                                                        <input
                                                                            required
                                                                            className="input"
                                                                            type="text"
                                                                            value={item.ifsc_code}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Rules Section */}
                                                    <div className="card bg-transparent account_input-textbox-container mt-3 mb-4">
                                                        <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                                            <h5 className="text-center mb-0">Rules</h5>
                                                        </div>
                                                        <div className="card-body">
                                                            <ul className="list-unstyled">
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    Transfer the amount through our safe payment gateway
                                                                </li>
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    The amount will be deposited to your account
                                                                    instantly
                                                                </li>
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    Transfer the amount through our safe payment gateway
                                                                </li>
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    Transfer the amount through our safe payment gateway
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* UPI Details (Only for UPI) */}
                                            {selectedMethod === 2 && paymentDetails && paymentDetails.length > 0 && (
                                                <>
                                                    {paymentDetails.map((item, index) => (
                                                        <>
                                                            {/* card 1 Starts */}
                                                            <div className="card bg_light_grey account_input-textbox-container my-3">
                                                                <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                                                    <h5 className="text-center mb-0">
                                                                        UPI Payment Details
                                                                    </h5>
                                                                </div>
                                                                <div className="card-body">
                                                                    <div className="d-flex justify-content-center mb-3">
                                                                        <img
                                                                            src={`https://staging.syscorp.in/storage/${item.qr_code}`}
                                                                            className="w-50"
                                                                            alt="QR Code"
                                                                        />
                                                                    </div>

                                                                    <div className="form-control_container" action>
                                                                        <div className="input-field mb-3">
                                                                            <input
                                                                                required
                                                                                className="input"
                                                                                type="text"
                                                                                value={item.upi_id}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* card 1 Starts */}
                                                        </>
                                                    ))}

                                                    {/* // Rules Starts here */}
                                                    <div className="card bg-transparent account_input-textbox-container mt-3 mb-4">
                                                        <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                                            <h5 className="text-center mb-0">Rules</h5>
                                                        </div>
                                                        <div className="card-body">
                                                            <ul className="list-unstyled">
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    Transfer the amount through our safe payment gateway
                                                                </li>
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    The amount will be deposited to your account
                                                                    instantly
                                                                </li>
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    Transfer the amount through our safe payment gateway
                                                                </li>
                                                                <li className="text-white fs-14 mb-2">
                                                                    <img
                                                                        src="assets/img/icons/tick.png"
                                                                        alt="tick"
                                                                        width="20px"
                                                                    />
                                                                    Transfer the amount through our safe payment gateway
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    {/* // Rules Ends here */}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* deposit form Starts */}
                                {/* card 1 Starts */}
                                <div className="card bg_light_grey account_input-textbox-container my-3">
                                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                        <h5 className="text-center mb-0">***Deposit Amount Form***</h5>
                                    </div>
                                    <div className="card-body">
                                        {/* <div className="d-flex justify-content-center mb-3">
              <img
                src="https://www.hellotech.com/guide/wp-content/uploads/2020/05/HelloTech-qr-code-1024x1024.jpg"
                className="w-50"
                alt="QR_code"
              />
            </div> */}
                                        <form className="form-control_container" onSubmit={formik.handleSubmit}>
                                            {formik.errors.api && <p className="text-danger">{formik.errors.api}</p>}

                                            <div className="input-field mb-3">
                                                <input
                                                    required
                                                    className="input"
                                                    type="text"
                                                    name="amount"
                                                    value={formik.values.amount}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                <label className="label" htmlFor="amount">
                                                    Amount
                                                </label>
                                                {formik.touched.amount && formik.errors.amount && (
                                                    <p className="text-danger">{formik.errors.amount}</p>
                                                )}
                                            </div>

                                            <div className="input-field mb-3">
                                                <input
                                                    required
                                                    className="input"
                                                    type="text"
                                                    name="utr_number"
                                                    value={formik.values.utr_number}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                <label className="label" htmlFor="utr_number">
                                                    Enter UTR No
                                                </label>
                                                {formik.touched.utr_number && formik.errors.utr_number && (
                                                    <p className="text-danger">{formik.errors.utr_number}</p>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                <label htmlFor="formFile" className="form-label text-white">
                                                    Payment Screenshot
                                                </label>
                                                <div className="custom-file-input">
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
                                                        onChange={handleFileChange} // ✅ Correct file handling
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-center">
                                                <button
                                                    type="submit"
                                                    className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                                                    disabled={formik.isSubmitting}
                                                >
                                                    {formik.isSubmitting ? "Submitting ..." : "Submit"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                {/* card 1 Starts */}
                                {/* deposit form /Ends */}
                                {/* amount Starts */}
                                {/* card 1 Starts */}
                                <div className="card bg_light_grey account_input-textbox-container mt-3">
                                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                        <h5 className="text-center mb-0">Select Amount</h5>
                                    </div>
                                    <div className="card-body">
                                        <form className="form-control_container" action>
                                            <div className="input-field mb-3">
                                                <input required className="input" type="text" />
                                                <label className="label" htmlFor="input">
                                                    Amount
                                                </label>
                                            </div>
                                            <div className="recharge-amount-container button">
                                                <button type="button" className="btn">
                                                    10
                                                </button>
                                                <button type="button" className="btn">
                                                    20
                                                </button>
                                                <button type="button" className="btn">
                                                    50
                                                </button>
                                                <button type="button" className="btn">
                                                    100
                                                </button>
                                                <button type="button" className="btn">
                                                    1000
                                                </button>
                                                <button type="button" className="btn">
                                                    10000
                                                </button>
                                                <button type="button" className="btn">
                                                    100
                                                </button>
                                                <button type="button" className="btn">
                                                    1000
                                                </button>
                                                <button type="button" className="btn">
                                                    10000
                                                </button>
                                            </div>
                                            <div className="d-flex justify-content-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                {/* card 3 Starts */}
                                {/* amount Ends */}
                            </div>

                            <BottomFooter />
                            <Footer />
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Deposit;

const SelectAmount = () => {
    return (
        <>
            {/* card 1 Starts */}
            <div className="card bg_light_grey account_input-textbox-container mt-3">
                <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                    <h5 className="text-center mb-0">Select Amount</h5>
                </div>
                <div className="card-body">
                    <form className="form-control_container" action>
                        <div className="input-field mb-3">
                            <input required className="input" type="text" />
                            <label className="label" htmlFor="input">
                                Amount
                            </label>
                        </div>
                        <div className="recharge-amount-container button">
                            <button type="button" className="btn">
                                10
                            </button>
                            <button type="button" className="btn">
                                20
                            </button>
                            <button type="button" className="btn">
                                50
                            </button>
                            <button type="button" className="btn">
                                100
                            </button>
                            <button type="button" className="btn">
                                1000
                            </button>
                            <button type="button" className="btn">
                                10000
                            </button>
                            <button type="button" className="btn">
                                100
                            </button>
                            <button type="button" className="btn">
                                1000
                            </button>
                            <button type="button" className="btn">
                                10000
                            </button>
                        </div>
                        <div className="d-flex justify-content-center">
                            <button type="button" className="btn btn-login w-50 mt-4 mb-3 text-capitalize">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* card 3 Starts */}
        </>
    );
};

const SelectPaymentMethod = () => {
    const [depositMethod, setDepositMethod] = useState([]); // Payment methods
    const [selectedMethod, setSelectedMethod] = useState(null); // Selected method ID
    const [paymentDetails, setPaymentDetails] = useState(null); // Payment details from API
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [activeStep, setActiveStep] = useState("step1");

    const {user} = useContext(AuthContext);
    const token = user?.token;

    // Fetch deposit methods
    useEffect(() => {
        const fetchDepositMethods = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/player/get-deposit-method`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                if (response.data.status === "success") {
                    setDepositMethod(response.data.paymentMethod || []);
                } else {
                    setError(response.data.msg || "Failed to load payment methods");
                }
            } catch (err) {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDepositMethods();
    }, [token]);

    // Fetch payment details based on method selection
    const fetchPaymentDetails = async (methodId) => {
        if (!token) return;

        setSelectedMethod(methodId); // Update selected method
        setLoading(true);

        try {
            const response = await axios.get(`${BASE_URL}/player/get-payment-detail`, {
                params: {payment_method_id: methodId}, // <-- Pass data as query parameters
                headers: {Authorization: `Bearer ${token}`},
            });

            if (response.data.status === "success") {
                setPaymentDetails(response.data.paymentDetail); // Store payment details
                console.log(response.data.paymentDetail);
            } else {
                setError(response.data.msg || "Failed to load payment details");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <h5 className="mb-3">Select Payment Method</h5>

            {loading && <p>Loading payment methods...</p>}
            {error && <p className="text-danger">{error}</p>}

            {depositMethod.length === 0 && !loading && !error && <p>No payment methods available.</p>}

            {/* Bootstrap Tab Navigation */}
            {depositMethod.length > 0 && !loading && !error && (
                <nav className="nav nav-pills d-flex justify-content-between tab_red_active">
                    {depositMethod.map((method) => (
                        <button
                            key={method.id}
                            className={`nav-link btn-color text-white w-150 ${
                                selectedMethod === method.id ? "active" : ""
                            }`}
                            onClick={() => fetchPaymentDetails(method.id)} // Fetch details on click
                            id={`tab-${method.id}`}
                            data-bs-toggle="tab"
                            data-bs-target={`#content-${method.id}`} // Bootstrap tab switching
                            type="button"
                            role="tab"
                            aria-controls={`content-${method.id}`}
                            aria-selected={selectedMethod === method.id ? "true" : "false"}
                        >
                            <img src="assets/img/icons/icons8-deposit-64.png" alt="deposit" width="30px" />
                            {method.name} {method.id}
                        </button>
                    ))}
                </nav>
            )}
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
                        {/* Payment Details */}
                        {/* {selectedMethod === method.id && paymentDetails && (
    <div className="card bg_light_grey account_input-textbox-container">
      <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
        <h5 className="text-center mb-0">
          Payment Details for{" "}
          {paymentDetails.payment_method_name}
        </h5>
      </div>
      <div className="card-body">
        <pre className="text-white">
          {JSON.stringify(paymentDetails, null, 2)}
        </pre>
      </div>
    </div>
  )} */}

                        {/* Bank Details (Only for Bank) */}
                        {selectedMethod === 1 && paymentDetails && paymentDetails.length > 0 && (
                            <>
                                {paymentDetails.map((item, index) => (
                                    <div key={index} className="card bg_light_grey account_input-textbox-container">
                                        <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                            <h5 className="text-center mb-0">Bank Details</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="form-control_container">
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={item.bank_name}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={item.account_holder_name}
                                                        readOnly
                                                    />
                                                    {/* <label className="label">
                    A/C Holder Name
                  </label> */}
                                                </div>
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={item.account_number}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="input-field mb-3">
                                                    <input
                                                        required
                                                        className="input"
                                                        type="text"
                                                        value={item.ifsc_code}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Rules Section */}
                                <div className="card bg-transparent account_input-textbox-container mt-3 mb-4">
                                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                        <h5 className="text-center mb-0">Rules</h5>
                                    </div>
                                    <div className="card-body">
                                        <ul className="list-unstyled">
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                Transfer the amount through our safe payment gateway
                                            </li>
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                The amount will be deposited to your account instantly
                                            </li>
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                Transfer the amount through our safe payment gateway
                                            </li>
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                Transfer the amount through our safe payment gateway
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* UPI Details (Only for UPI) */}
                        {selectedMethod === 2 && paymentDetails && paymentDetails.length > 0 && (
                            <>
                                {paymentDetails.map((item, index) => (
                                    <>
                                        {/* card 1 Starts */}
                                        <div className="card bg_light_grey account_input-textbox-container my-3">
                                            <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                                <h5 className="text-center mb-0">UPI Payment Details</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-center mb-3">
                                                    <img
                                                        src={`https://staging.syscorp.in/storage/${item.qr_code}`}
                                                        className="w-50"
                                                        alt="QR Code"
                                                    />
                                                </div>

                                                <div className="form-control_container" action>
                                                    <div className="input-field mb-3">
                                                        <input
                                                            required
                                                            className="input"
                                                            type="text"
                                                            value={item.upi_id}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* card 1 Starts */}
                                    </>
                                ))}

                                {/* // Rules Starts here */}
                                <div className="card bg-transparent account_input-textbox-container mt-3 mb-4">
                                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                        <h5 className="text-center mb-0">Rules</h5>
                                    </div>
                                    <div className="card-body">
                                        <ul className="list-unstyled">
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                Transfer the amount through our safe payment gateway
                                            </li>
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                The amount will be deposited to your account instantly
                                            </li>
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                Transfer the amount through our safe payment gateway
                                            </li>
                                            <li className="text-white fs-14 mb-2">
                                                <img src="assets/img/icons/tick.png" alt="tick" width="20px" />
                                                Transfer the amount through our safe payment gateway
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                {/* // Rules Ends here */}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

const DepositAmountRequest = () => {
    const {user} = useContext(AuthContext);
    const token = user?.token;
    const formik = useFormik({
        initialValues: {
            amount: "",
            utr_number: "",
            payment_screenshot: null, // ✅ Store file separately
        },
        validationSchema: Yup.object({
            utr_number: Yup.string().required("UTR number is required"),
            amount: Yup.string().required("Amount is required"),
        }),
        onSubmit: async (values, {setSubmitting, setErrors, resetForm}) => {
            try {
                const formData = new FormData();
                formData.append("payment_detail_id", 2); // ✅ Add payment_detail_id
                formData.append("amount", values.amount);
                formData.append("utr", values.utr_number);

                if (values.payment_screenshot) {
                    formData.append("image", values.payment_screenshot); // ✅ Correct key name
                }

                const response = await axios.post(`${BASE_URL}/player/send-deposit-request`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.data.status === "success") {
                    alert("Deposit request sent successfully!");
                    resetForm(); // ✅ Reset form after success
                } else {
                    setErrors({
                        api: response.data.message || "Failed to send deposit request.",
                    });
                }
            } catch (error) {
                if (error.response) {
                    setErrors({api: error.response.data.message || "Invalid request"});
                } else if (error.request) {
                    setErrors({api: "Server not responding. Please try again later."});
                } else {
                    setErrors({api: "Something went wrong. Try again."});
                }
            }
            setSubmitting(false);
        },
    });

    // ✅ Handle File Upload
    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        formik.setFieldValue("payment_screenshot", file);
    };

    return (
        <>
            {/* card 1 Starts */}
            <div className="card bg_light_grey account_input-textbox-container my-3">
                <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                    <h5 className="text-center mb-0">***Deposit Amount Form***</h5>
                </div>
                <div className="card-body">
                    {/* <div className="d-flex justify-content-center mb-3">
              <img
                src="https://www.hellotech.com/guide/wp-content/uploads/2020/05/HelloTech-qr-code-1024x1024.jpg"
                className="w-50"
                alt="QR_code"
              />
            </div> */}
                    <form className="form-control_container" onSubmit={formik.handleSubmit}>
                        {formik.errors.api && <p className="text-danger">{formik.errors.api}</p>}

                        <div className="input-field mb-3">
                            <input
                                required
                                className="input"
                                type="text"
                                name="amount"
                                value={formik.values.amount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="label" htmlFor="amount">
                                Amount
                            </label>
                            {formik.touched.amount && formik.errors.amount && (
                                <p className="text-danger">{formik.errors.amount}</p>
                            )}
                        </div>

                        <div className="input-field mb-3">
                            <input
                                required
                                className="input"
                                type="text"
                                name="utr_number"
                                value={formik.values.utr_number}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <label className="label" htmlFor="utr_number">
                                Enter UTR No
                            </label>
                            {formik.touched.utr_number && formik.errors.utr_number && (
                                <p className="text-danger">{formik.errors.utr_number}</p>
                            )}
                        </div>

                        <div className="mb-2">
                            <label htmlFor="formFile" className="form-label text-white">
                                Payment Screenshot
                            </label>
                            <div className="custom-file-input">
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
                                    onChange={handleFileChange} // ✅ Correct file handling
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-center">
                            <button
                                type="submit"
                                className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? "Submitting ..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* card 1 Starts */}
        </>
    );
};
