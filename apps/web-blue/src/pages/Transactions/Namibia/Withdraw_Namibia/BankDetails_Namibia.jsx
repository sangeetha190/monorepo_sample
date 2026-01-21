import {useEffect, useState} from "react";
// import BASE_URL from "../../../../API/api";
// import axios from "axios";
import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
import {useContext} from "react";
import {useFormik} from "formik";
// import AuthContext from "../../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";

// import {
//     changeBankNamibiaStatus,
//     deleteBankNamibiaDetails,
//     EditBankNamibia,
//     getBankDetailsNamibia,
//     storeBankNamibia,
//     updateBankNamibia,
// } from "../../../../../API/withdrawAPI";
import {
    changeBankNamibiaStatus,
    deleteBankNamibiaDetails,
    EditBankNamibia,
    getBankDetailsNamibia,
    storeBankNamibia,
    updateBankNamibia,
} from "@core/api/withdrawAPI";
// import {verifyToken} from "../../../../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
import {toast, ToastContainer} from "react-toastify";
// import {saveSelectedBank} from "../../../../../API/bankSelectionStorage";
import {saveSelectedBank} from "@core/api/bankSelectionStorage";
import {useLocation, useNavigate} from "react-router-dom";
// import { Link } from "react-router-dom";
const BankDetails = ({selectedBankId, setSelectedBankId, paymentSelectedMethod, setPaymentSelectedMethod}) => {
    const [bankDetails, setbankDetails] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    //   const [selectedTab, setSelectedTab] = useState("all");
    const [activeTab, setActiveTab] = useState("bank"); // 'bank' or 'add'
    const [editingBankId, setEditingBankId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteSelectedBankId, setDeleteSelectedBankId] = useState(null);
    const [statusLoading, setStatusLoading] = useState({});
    const [selectedBankIdNo, setSelectedBankIdNo] = useState(null);
    // const [editingBankData, setEditingBankData] = useState(null);
    const {user} = useContext(AuthContext);
    const token = user?.token;
    const userId = user?.id;
    const navigate = useNavigate();
    const location = useLocation();
    // const handleSelectBank = (bank) => {
    //   saveSelectedBank(bank);
    //   setPaymentSelectedMethod("bank");
    //   window.dispatchEvent(new Event("nm-bank-selected")); // 🔔 tell listeners to refresh
    //   // navigate("/deposit-namibia/manual-deposit/get-payment-details");
    // };

    const handleSelectBank = (bank) => {
        // Save full bank object for other components
        saveSelectedBank(bank);

        // ✅ Update parent so Step 3 gets correct bankId
        setSelectedBankId(bank.id);

        // Mark payment method type
        setPaymentSelectedMethod("bank");

        // Tell WithdrawAmountRequest to refresh its local bank info
        window.dispatchEvent(new Event("nm-bank-selected"));
    };

    // pick first active bank when data arrives
    useEffect(() => {
        if (!bankDetails?.length) return;
        if (selectedBankIdNo != null) return;

        const firstActive = bankDetails.find((b) => b.status === "1");
        if (firstActive) {
            setSelectedBankIdNo(String(firstActive.id)); // store as string to be safe
            handleSelectBank?.(firstActive);
            // ✅ Update parent & storage through common handler
            //  handleSelectBank?.(firstActive);
        }
    }, [bankDetails, selectedBankIdNo, handleSelectBank]);

    useEffect(() => {
        const currentToken = user?.token;

        if (!currentToken) {
            setError("Authentication error. Please log in again.");
            setLoading(false);
            return;
        }

        const fetchWithdrawHistory = async () => {
            try {
                const verifyRes = await verifyToken(currentToken);
                if (verifyRes.status !== "success") {
                    toast.error("Session expired. Please log in again.", {
                        toastId: "expired-token",
                    });
                    setError("Invalid or expired token. Please log in again.");
                    setLoading(false);
                    return;
                }

                const response = await getBankDetailsNamibia(token, userId); // ✅ No need to pass token if axiosInstance handles it
                if (response.status === "success" && Array.isArray(response.playerBank)) {
                    setbankDetails(response.playerBank);
                } else {
                    setError(response.msg || "Failed to load withdraw history.");
                }
            } catch (err) {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawHistory();
    }, [user?.token]);

    // Toggle Bank Status
    // const toggleBankStatus = async (bank_id, currentStatus) => {
    //   if (!token) {
    //     setError("Authentication error. Please log in again.");
    //     return;
    //   }

    //   const newStatus = currentStatus === "1" ? "0" : "1";
    //   try {
    //     // ✅ Step 1: Verify token with its own error handler
    //     try {
    //       const tokenRes = await verifyToken(token);
    //       if (tokenRes.status !== "success") {
    //         setError(
    //           tokenRes.message || "Invalid or expired token. Please log in again."
    //         );
    //         return;
    //       }
    //     } catch (verifyError) {
    //       const errorMessage =
    //         verifyError.response?.data?.message ||
    //         verifyError.message ||
    //         "Invalid or expired token. Please log in again.";
    //       setError(errorMessage);
    //       return;
    //     }

    //     // ✅ Step 2: Proceed with status change
    //     const response = await changeBankNamibiaStatus(token, bank_id, newStatus);

    //     // console.log("newStatus", newStatus);

    //     if (response.status === "success") {
    //       setbankDetails((prevDetails) =>
    //         prevDetails.map((bank) =>
    //           bank.id === bank_id ? { ...bank, status: newStatus } : bank
    //         )
    //       );

    //       toast.success(
    //         <span>
    //           Bank{" "}
    //           <span style={{ position: "relative", top: "-2px" }}>
    //             {newStatus === "1" ? "🔓" : "🔒"}
    //           </span>{" "}
    //           {newStatus === "1" ? "Activated" : "Deactivated"} successfully!
    //         </span>,
    //         {
    //           autoClose: 5000,
    //           pauseOnHover: true,
    //           closeOnClick: true,
    //         }
    //       );
    //     } else {
    //       alert(response.message || "Failed to update status.");
    //     }
    //   } catch (err) {
    //     if (err.response?.data?.type === "invalid_token") {
    //       setError("Invalid or expired token. Please log in again.");
    //       return;
    //     }

    //     const errorMessage =
    //       err.response?.data?.message ||
    //       err.message ||
    //       "Failed to update status.";
    //     console.error("API Error:", err.response?.data || err.message);
    //     alert(`Error: ${errorMessage}`);
    //   }
    // };

    const toggleBankStatus = async (bank_id, currentStatus) => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }

        const newStatus = currentStatus === "1" ? "0" : "1";

        try {
            setStatusLoading((prev) => ({...prev, [bank_id]: true})); // start loading

            // Verify token (unchanged)
            try {
                const tokenRes = await verifyToken(token);
                if (tokenRes.status !== "success") {
                    setError(tokenRes.message || "Invalid or expired token. Please log in again.");
                    return;
                }
            } catch (verifyError) {
                const errorMessage =
                    verifyError.response?.data?.message || verifyError.message || "Invalid or expired token.";
                setError(errorMessage);
                return;
            }

            // Call API (unchanged)
            const response = await changeBankNamibiaStatus(token, bank_id, newStatus);

            if (response.status === "success") {
                // update UI
                setbankDetails((prev) => prev.map((b) => (b.id === bank_id ? {...b, status: newStatus} : b)));

                toast.success(
                    <span>
                        <span aria-hidden="true">{newStatus === "1" ? "🔓" : "🔒"} </span>
                        <span className="visually-hidden">{newStatus === "1" ? "Activated" : "Deactivated"}</span>
                        {newStatus === "1" ? "Activated" : "Deactivated"} successfully!
                    </span>,
                    {
                        onClose: () => {
                            // runs after it closes (timeout or X click)
                            navigate(location.pathname, {replace: true, state: {}});
                        },
                    }
                );
            } else {
                toast.error(response.message || "Failed to update status.");
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update status.";
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setStatusLoading((prev) => ({...prev, [bank_id]: false})); // end loading
        }
    };

    //   validation
    const validationSchema = Yup.object({
        bank_name: Yup.string().required("Bank Name is required"),
        account_holder_name: Yup.string().required("Account Holder Name is required"),
        account_number: Yup.string().matches(/^\d+$/, "Only numbers allowed").required("Account Number is required"),
        branch_code: Yup.string().required("Branch Code is required"),
        branch_name: Yup.string().required("Branch Name is required"),
    });

    //   const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            account_number: "",
            branch_code: "",
            branch_name: "",
            bank_name: "",
            account_holder_name: "",
        },
        validationSchema,
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

                // ✅ Step 2: Submit bank form
                const response = await storeBankNamibia(token, values, userId);

                if (response.status === "success") {
                    toast.dismiss("bank-added"); // optional: clean before show
                    toast.success("Bank added successfully! 🎉", {
                        toastId: "bank-added",
                        autoClose: 3000,
                        pauseOnHover: false,
                        closeOnClick: true,
                    });

                    resetForm();
                    setActiveTab("bank");
                    setLoading(true);

                    const refreshedBanks = await getBankDetailsNamibia(token, userId);
                    if (refreshedBanks.status === "success" && Array.isArray(refreshedBanks.playerBank)) {
                        setbankDetails(refreshedBanks.playerBank);
                    }
                    setLoading(false);
                } else {
                    setErrors({
                        api: response.data.message || "Something went wrong while saving bank details.",
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
    // for the EDIT form (matches your edit fields)
    const editValidationSchema = Yup.object({
        bank_name: "",
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
    });
    // Formik Update the form
    const updateFormik = useFormik({
        initialValues: {
            bank_name: "",
            account_holder_name: "",
            account_number: "",
            ifsc_code: "",
        },
        enableReinitialize: true,
        validateOnBlur: true,
        validateOnChange: true,
        validationSchema: editValidationSchema, // 👈 use the edit schema here
        onSubmit: async (values, {setSubmitting, setErrors, resetForm}) => {
            // console.log("[EDIT BANK] submit fired ✅ with values:", values);

            try {
                // 1) Verify token
                try {
                    const tokenRes = await verifyToken(token);
                    // console.log("[VERIFY] tokenRes:", tokenRes);
                    if (tokenRes.status !== "success") {
                        const msg = tokenRes.message || "Invalid/expired token";
                        toast.error(msg);
                        setErrors({api: msg});
                        return;
                    }
                } catch (verifyError) {
                    const errorMessage =
                        verifyError?.response?.data?.message || verifyError?.message || "Invalid or expired token.";
                    toast.error(`${errorMessage}. Please log in again.`, {
                        toastId: "unauthorized-toast",
                    });
                    setErrors({api: errorMessage});
                    return;
                }

                // 2) Hit the update API
                // console.log("[API] calling updateBankNamibia...");
                const response = await updateBankNamibia(token, values, editingBankId);
                // console.log("[API] response:", response);

                if (response?.status === "success") {
                    toast.success("Bank updated successfully! 🎉");
                    resetForm(); // reset Formik
                    setEditingBankId(null);
                    setActiveTab("bank");

                    // 3) Refresh list
                    setLoading(true);
                    const refreshed = await getBankDetailsNamibia(token, userId);
                    if (refreshed?.status === "success" && Array.isArray(refreshed.playerBank)) {
                        setbankDetails(refreshed.playerBank);
                    }
                    setLoading(false);

                    // 4) Close modal
                    const modalEl = document.getElementById("edit_bank_details");
                    const bs = window.bootstrap;
                    if (modalEl && bs?.Modal) {
                        bs.Modal.getOrCreateInstance(modalEl).hide();
                    }
                } else {
                    const msg = response?.data?.message || "Something went wrong.";
                    setErrors({api: msg});
                }
            } catch (error) {
                console.error("[API ERROR]", error);
                if (error.response) {
                    const data = error.response.data;
                    const apiErrors = new Set();

                    if (data.errors) {
                        Object.values(data.errors).forEach((arr) => arr.forEach((m) => apiErrors.add(m)));
                    }
                    if (data.msg) apiErrors.add(data.msg);
                    if (data.message) apiErrors.add(data.message);
                    if (apiErrors.size === 0) apiErrors.add("Something went wrong.");

                    setErrors({api: Array.from(apiErrors)});
                } else if (error.request) {
                    setErrors({
                        api: ["Server not responding. Please try again later."],
                    });
                } else {
                    setErrors({api: ["Something went wrong. Try again."]});
                }
            } finally {
                setSubmitting(false); // always re-enable the button
                // console.log("[EDIT BANK] setSubmitting(false)");
            }
        },
    });

    const handleEditBankClick = async (bankId) => {
        const token = localStorage.getItem("token"); // or from context/user if available

        // ✅ Step 1: Check token existence
        if (!token) {
            toast.error("Authentication error. Please log in again.");
            return;
        }

        // ✅ Step 2: Verify token validity
        try {
            const tokenRes = await verifyToken(); // no need to pass token if axiosInstance handles it
            if (tokenRes.status !== "success") {
                toast.error(tokenRes.message || "Invalid token. Please log in again.");
                return;
            }
        } catch (verifyError) {
            const message = verifyError.message || "Session expired. Please log in again.";
            toast.error(message);
            return;
        }

        // ✅ Step 3: Proceed with fetch
        try {
            // console.log(bankId, "--------------------------");
            const response = await EditBankNamibia(bankId); // token handled by axiosInstance
            // console.log(bankId, "--------------------------");
            if (response.status === "success") {
                const bank = response.playerBank;

                setEditingBankId(bankId);
                updateFormik.setValues({
                    bank_name: bank.bank_name || "",
                    account_holder_name: bank.account_holder_name || "",
                    account_number: bank.account_number || "",
                    ifsc_code: bank.ifsc_code || "",
                });
            } else {
                toast.error(response.message || "Failed to fetch bank details.");
            }
        } catch (error) {
            toast.error("Something went wrong while fetching bank data.");
        }
    };

    const handleDeleteBankClick = (bankId) => {
        setDeleteSelectedBankId(bankId); // save this to use later
        setShowModal(true); // open confirmation modal
    };

    const confirmDeleteBank = async () => {
        try {
            const response = await deleteBankNamibiaDetails(token, deleteSelectedBankId);

            if (response.status === "success") {
                toast.success(`Bank deleted successfully! 🎉`);

                // remove deleted bank from state
                setbankDetails((prevDetails) => prevDetails.filter((bank) => bank.id !== deleteSelectedBankId));
            } else {
                toast.error(response.msg || "Failed to delete bank");
            }
        } catch (error) {
            toast.error("Something went wrong while deleting the bank");
        } finally {
            setShowModal(false); // close modal
            setSelectedBankId(null); // clear selected bank
        }
    };

    // handlePopUP
    // const handlePopUP = () => {
    //   alert("Api is disabled ");
    // };
    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} pauseOnHover={false} closeOnClick theme="dark" />
            {loading && <p>Loading...</p>}

            {error && <p className="text-danger">{error}</p>}

            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9990}}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm justify-content-center">
                        <div className="modal-content" style={{width: "350px"}}>
                            <div className="modal-body d-flex flex-column align-items-center py-4">
                                <img src="assets/img/icons/warning.gif" className="mb-2" style={{width: "53px"}} />
                                <h4 className="fw-700 text-center text-black mb-2">Are you sure?</h4>
                                <div className="fw-500 fs-13 text-center text-black mb-3">You want to delete this!</div>
                                <div className="d-flex justify-content-between w-75">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={confirmDeleteBank} // ✅ triggers actual delete
                                    >
                                        Yes, delete it!
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedBankId(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg_light_grey rounded-2 py-3 pb-2">
                <nav className="nav nav-pills d-flex justify-content-between tab_red_active pt-2 px-2 pb-2 ">
                    <button
                        className={`nav-link btn-color text-white w-150 ${activeTab === "bank" ? "active" : ""}`}
                        onClick={() => setActiveTab("bank")}
                        type="button"
                    >
                        Bank Details
                    </button>

                    <button
                        className={`nav-link btn-color text-white w-150 ${activeTab === "add" ? "active" : ""}`}
                        onClick={() => setActiveTab("add")}
                        type="button"
                    >
                        Add Bank
                    </button>
                </nav>
                <div className="tab-content mt-3" id="myTabContent">
                    {/* Bank Details Tab */}
                    {activeTab === "bank" && (
                        <div className="tab-pane fade show active" id="Bank_details" role="tabpanel">
                            {/* your bank details list UI here */}
                            {/* card 1 Starts */}
                            <div className="card bg_light_grey br-grey account_input-textbox-container my-2 mx-2">
                                <div className="card-body p-2">
                                    <h5 className="mb-3">Select the Bank</h5>
                                    {/*  Details Starts */}
                                    {loading ? (
                                        <p className="text-white">Loading...</p>
                                    ) : error ? (
                                        <p className="text-danger">{error}</p>
                                    ) : bankDetails.filter((bank) => bank.status === "1").length > 0 ? (
                                        bankDetails
                                        .filter((bank) => bank.status === "1")
                                        .map((bank) => (
                                            <div className="bet-card" key={bank.id}>
                                                {/* card 1 Starts */}
                                                <div className="d-flex justify-content-between border rounded mt-2 py-2 px-2">
                                                    <div className="d-flex justify-content-between">
                                                        {/* bank Details Starts */}
                                                        <div>
                                                            {/* <h3>{bank.id}</h3> */}
                                                            {/* <h6>
                                  Payment Method:{" "}
                                  {bank.payment_method?.name || "N/A"}
                                </h6> */}
                                                            {bank.payment_method?.name === "UPI" ? (
                                                                <p>
                                                                    <strong>UPI ID:</strong> {bank.upi_id || "N/A"}
                                                                </p>
                                                            ) : (
                                                                <>
                                                                    <div>
                                                                        <p className="mb-0 text-grey">Bank Name</p>
                                                                        <h6>{bank.bank_name || "N/A"}</h6>
                                                                    </div>
                                                                    <div>
                                                                        <p className="mb-0 text-grey">
                                                                            Account Holder:
                                                                        </p>
                                                                        <h6>{bank.account_holder_name || "N/A"}</h6>
                                                                    </div>
                                                                    <div>
                                                                        <p className="mb-0 text-grey">
                                                                            Account Number:
                                                                        </p>
                                                                        <h6>{bank.account_number || "N/A"}</h6>
                                                                    </div>
                                                                    <div>
                                                                        <p className="mb-0 text-grey">Branch Code</p>
                                                                        <h6>{bank.ifsc_code || "N/A"}</h6>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* input icon starts */}
                                                    <div className="px-2 py-1">
                                                        <div className="form-check px-3">
                                                            {/* <input
                                  className="form-check-input"
                                  type="radio"
                                  name="flexRadioDefault"
                                  value={bank.id}
                                  checked={selectedBankId === bank.id}
                                  onChange={() => setSelectedBankId(bank.id)}
                                  onClick={() => handleSelectBank(bank)}
                                  defaultChecked
                                /> */}
                                                            {/* <input
                                  className="form-check-input"
                                  type="radio"
                                  name="flexRadioDefault"
                                  value={bank.id}
                                  checked={
                                    String(selectedBankIdNo) === String(bank.id)
                                  }
                                  onChange={() => {
                                    setSelectedBankIdNo(String(bank.id));
                                    handleSelectBank?.(bank);
                                  }}
                                /> */}

                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="flexRadioDefault"
                                                                value={bank.id}
                                                                checked={String(selectedBankIdNo) === String(bank.id)}
                                                                onChange={() => {
                                                                    setSelectedBankIdNo(String(bank.id));
                                                                    handleSelectBank?.(bank);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Status Button */}
                                                    {/* <div>
                             
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  toggleBankStatus(bank.id, bank.status)
                                }
                              >
                                Active
                              </button>
                            </div> */}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white">No Active Bank Details Found.</p>
                                    )}

                                    {/*  Details ends */}

                                    {/* view More Bank Details starts */}
                                    <div className="mt-2">
                                        <a
                                            className="btn bg-primary_color text-white"
                                            style={{padding: "2px 10px"}}
                                            data-bs-toggle="modal"
                                            href="#exampleModalToggle"
                                            role="button"
                                        >
                                            View More bank Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* Card 1 Ends */}
                        </div>
                    )}

                    {/* Add Bank Tab */}
                    {activeTab === "add" && (
                        <div className="tab-pane fade show active" id="profile" role="tabpanel">
                            {/* your add bank form UI here */}
                            {/* card 2*/}
                            {/* <div className="card bg_light_grey account_input-textbox-container"> */}
                            <div className="card bg_light_grey br-grey account_input-textbox-container my-2 mx-2">
                                <div className="card-body p-2">
                                    <h5 className="mb-1">Add Bank Details</h5>
                                    <form className="form-control_container" onSubmit={formik.handleSubmit}>
                                        {/* {formik.errors.api && (
                      <p className="text-danger">{formik.errors.api}</p>
                    )} */}

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

                                        <div className="input-field">
                                            <input
                                                required
                                                className="input"
                                                type="number"
                                                name="account_number"
                                                value={formik.values.account_number}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <label className="label">A/C Number</label>
                                            {formik.touched.account_number && formik.errors.account_number && (
                                                <p className="text-danger">{formik.errors.account_number}</p>
                                            )}
                                        </div>

                                        <div className="input-field">
                                            <input
                                                required
                                                className="input"
                                                type="text"
                                                name="branch_code"
                                                value={formik.values.branch_code}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <label className="label">Branch Code</label>
                                            {formik.touched.branch_code && formik.errors.branch_code && (
                                                <p className="text-danger">{formik.errors.branch_code}</p>
                                            )}
                                        </div>

                                        <div className="input-field">
                                            <input
                                                required
                                                className="input"
                                                type="text"
                                                name="bank_name"
                                                value={formik.values.bank_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <label className="label">Bank Name</label>
                                            {formik.touched.bank_name && formik.errors.bank_name && (
                                                <p className="text-danger">{formik.errors.bank_name}</p>
                                            )}
                                        </div>

                                        <div className="input-field">
                                            <input
                                                required
                                                className="input"
                                                type="text"
                                                name="branch_name"
                                                value={formik.values.branch_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <label className="label">Branch Name</label>
                                            {formik.touched.branch_name && formik.errors.branch_name && (
                                                <p className="text-danger">{formik.errors.branch_name}</p>
                                            )}
                                        </div>

                                        <div className="input-field">
                                            <input
                                                required
                                                className="input"
                                                type="text"
                                                name="account_holder_name"
                                                value={formik.values.account_holder_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <label className="label">A/C Holder Name</label>
                                            {formik.touched.account_holder_name &&
                                                formik.errors.account_holder_name && (
                                                    <p className="text-danger">{formik.errors.account_holder_name}</p>
                                                )}
                                        </div>

                                        <div className="d-flex justify-content-center">
                                            <button
                                                type="submit"
                                                className="btn btn-login w-50 my-2 text-capitalize"
                                                disabled={formik.isSubmitting}
                                            >
                                                {formik.isSubmitting ? "Adding..." : "Add"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            {/* card 2*/}
                        </div>
                    )}
                </div>
            </div>
            {/* Modal Starts Bank Details */}
            <div
                className="modal fade"
                id="exampleModalToggle"
                aria-hidden="true"
                aria-labelledby="exampleModalToggleLabel"
                tabindex="-1"
            >
                <div className="modal-dialog modal-dialog-centered ">
                    <div className="modal-content bg_light_grey ">
                        <div className="modal-header">
                            <h1 className="modal-title text-white fs-5" id="exampleModalToggleLabel">
                                Active / Inactive bank List
                            </h1>
                            <button
                                type="button"
                                className="btn-close filter-invert"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {/*  Details Starts */}
                            {loading ? (
                                <p className="text-white">Loading...</p>
                            ) : error ? (
                                <p className="text-danger">{error}</p>
                            ) : bankDetails.length > 0 ? (
                                bankDetails.map((bank) => (
                                    <div className="bet-card" key={bank.id}>
                                        {/* card 1 Starts */}
                                        <div className="d-flex justify-content-between border rounded mt-2 py-2 px-2">
                                            <div>
                                                {/* bank Details Starts */}
                                                <div>
                                                    {/* <h3>{bank.id}</h3> */}
                                                    {/* <h6>
                            Payment Method: {bank.payment_method?.name || "N/A"}
                          </h6> */}
                                                    {bank.payment_method?.name === "UPI" ? (
                                                        <p>
                                                            <strong>UPI ID:</strong> {bank.upi_id || "N/A"}
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <p className="mb-0 text-grey">Bank Name</p>
                                                                <h6>{bank.bank_name || "N/A"}</h6>
                                                            </div>
                                                            <div>
                                                                <p className="mb-0 text-grey">Account Holder:</p>
                                                                <h6>{bank.account_holder_name || "N/A"}</h6>
                                                            </div>
                                                            <div>
                                                                <p className="mb-0 text-grey">Account Number:</p>
                                                                <h6>{bank.account_number || "N/A"}</h6>
                                                            </div>
                                                            <div>
                                                                <p className="mb-0 text-grey">Branch Code</p>
                                                                <h6>{bank.ifsc_code || "N/A"}</h6>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column">
                                                {/* Status Button */}
                                                {/* <button
                          className={`btn ${
                            bank.status === "1" ? "btn-success" : "btn-danger"
                          }`}
                          onClick={() => toggleBankStatus(bank.id, bank.status)}
                          // onClick={handlePopUP}
                        >
                          {bank.status === "1" ? "Active" : "Inactive"}
                        </button> */}

                                                {/* <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="switchCheckChecked"
                          />
                        </div> */}
                                                {/* Status Toggle */}
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="form-check form-switch m-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            id={`statusSwitch-${bank.id}`}
                                                            checked={bank.status === "1"}
                                                            onChange={() => toggleBankStatus(bank.id, bank.status)}
                                                            disabled={!!statusLoading[bank.id]}
                                                            aria-checked={bank.status === "1"}
                                                            aria-label="Toggle bank active status"
                                                            style={{
                                                                backgroundColor:
                                                                    bank.status === "1" ? "#198754" : "#dc3545", // green / red
                                                                borderColor:
                                                                    bank.status === "1" ? "#198754" : "#dc3545",
                                                                boxShadow:
                                                                    bank.status === "1"
                                                                        ? "0 0 0 .25rem rgba(25,135,84,.25)"
                                                                        : "0 0 0 .25rem rgba(220,53,69,.25)",
                                                            }}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`fw-600 ${
                                                            bank.status === "1" ? "text-success" : "text-danger"
                                                        }`}
                                                    >
                                                        {/* {bank.status === "1" ? "Active" : "Inactive"} */}
                                                    </span>
                                                </div>

                                                {/* Edit Button */}
                                                <button
                                                    className="btn mt-2"
                                                    // onClick={handlePopUP}
                                                    onClick={() => handleEditBankClick(bank.id)}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#edit_bank_details"
                                                >
                                                    <i class="fa-solid fa-pen-to-square fs-4 text-white"></i>
                                                </button>
                                                {/* Edit Button */}
                                                <button
                                                    className="btn mt-2"
                                                    onClick={() => handleDeleteBankClick(bank.id)}
                                                    // onClick={handlePopUP}
                                                >
                                                    <i class="fa-regular fa-trash-can fs-4 text-danger">
                                                        {/* {bank.id} */}
                                                    </i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white">No Bank Details Found.</p>
                            )}
                            {/*  Details ends */}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="edit_bank_details"
                aria-hidden="true"
                aria-labelledby="edit_bank_details_modal"
                tabIndex={-1} // 👈 React camelCase
            >
                <div className="modal-dialog modal-dialog-centered ">
                    <div className="modal-content bg_light_grey rounded-2 py-3">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="edit_bank_details_modal">
                                Edit the bank Details
                            </h1>
                            <button
                                type="button"
                                className="btn-close filter-invert"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body ">
                            {" "}
                            <form
                                className="form-control_container"
                                noValidate // 👈 let Yup handle it
                                onSubmit={updateFormik.handleSubmit}
                            >
                                {/* {updateFormik.errors.api && (
                  <p className="text-danger">{updateFormik.errors.api}</p>
                )} */}

                                {/* API error block */}
                                {updateFormik.errors.api &&
                                    (Array.isArray(updateFormik.errors.api) ? (
                                        <ul className="text-danger mb-3">
                                            {updateFormik.errors.api.map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-danger mb-3">{updateFormik.errors.api}</p>
                                    ))}

                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="bank_name"
                                        value={updateFormik.values.bank_name}
                                        onChange={updateFormik.handleChange}
                                        onBlur={updateFormik.handleBlur}
                                    />
                                    <label className="label">Bank Name</label>
                                    {updateFormik.touched.bank_name && updateFormik.errors.bank_name && (
                                        <p className="text-danger">{updateFormik.errors.bank_name}</p>
                                    )}
                                </div>

                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="account_holder_name"
                                        value={updateFormik.values.account_holder_name}
                                        onChange={updateFormik.handleChange}
                                        onBlur={updateFormik.handleBlur}
                                    />
                                    <label className="label">A/C Holder Name</label>
                                    {updateFormik.touched.account_holder_name &&
                                        updateFormik.errors.account_holder_name && (
                                            <p className="text-danger">{updateFormik.errors.account_holder_name}</p>
                                        )}
                                </div>

                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="account_number"
                                        value={updateFormik.values.account_number}
                                        onChange={updateFormik.handleChange}
                                        onBlur={updateFormik.handleBlur}
                                    />
                                    <label className="label">A/C Number</label>
                                    {updateFormik.touched.account_number && updateFormik.errors.account_number && (
                                        <p className="text-danger">{updateFormik.errors.account_number}</p>
                                    )}
                                </div>

                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="ifsc_code"
                                        value={updateFormik.values.ifsc_code}
                                        onChange={updateFormik.handleChange}
                                        onBlur={updateFormik.handleBlur}
                                    />
                                    <label className="label">Branch Code</label>
                                    {updateFormik.touched.ifsc_code && updateFormik.errors.ifsc_code && (
                                        <p className="text-danger">{updateFormik.errors.ifsc_code}</p>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center">
                                    <button
                                        type="submit" // 👈 add this
                                        className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                                        disabled={updateFormik.isSubmitting}
                                    >
                                        {updateFormik.isSubmitting ? "Updating..." : "Update"}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer d-none">
                            <button
                                className="btn btn-primary"
                                data-bs-target="#exampleModalToggle"
                                data-bs-toggle="modal"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BankDetails;
