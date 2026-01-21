import React, { useEffect, useState } from "react";
// import BASE_URL from "../../../../API/api";
// import axios from "axios";
import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useFormik } from "formik";
import AuthContext from "../../../../Auth/AuthContext";
import {
  changeWalletStatus,
  deleteBankDetails,
  EditwalletBank,
  getBankDetails,
  getWalletDetails,
  storeBank,
  storeWallet,
  updateBank,
  updateWallet,
} from "../../../../API/withdrawAPI";
import { verifyToken } from "../../../../API/authAPI";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
const BankDetails = ({ selectedBankId, setSelectedBankId }) => {
  const [bankDetails, setbankDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  //   const [selectedTab, setSelectedTab] = useState("all");
  const [activeTab, setActiveTab] = useState("bank"); // 'bank' or 'add'
  const [editingBankId, setEditingBankId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteSelectedBankId, setDeleteSelectedBankId] = useState(null);

  const [loadingId, setLoadingId] = useState(null); // Track which specific button is loading
  // const [editingBankData, setEditingBankData] = useState(null);
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const navigate = useNavigate();
  const location = useLocation();
  // useEffect(() => {
  //   toast.success("Testing toast closing...", { autoClose: 3000 });
  // }, []);
  // useEffect(() => {
  //   const currentToken = user?.token;

  //   if (!currentToken) {
  //     setError("Authentication error. Please log in again.");
  //     setLoading(false);
  //     return;
  //   }

  //   const fetchWithdrawHistory = async () => {
  //     try {
  //       const verifyRes = await verifyToken(currentToken);
  //       if (verifyRes.status !== "success") {
  //         setError("Invalid or expired token. Please log in again.");
  //         return;
  //       }

  //       const response = await getBankDetails(currentToken);
  //       if (
  //         response.status === "success" &&
  //         Array.isArray(response.playerBank)
  //       ) {
  //         setbankDetails(response.playerBank);
  //       } else {
  //         setError(response.msg || "Failed to load withdraw history.");
  //       }
  //     } catch (err) {
  //       setError("Something went wrong. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchWithdrawHistory();
  // }, [user?.token]); // ✅ token change will re-run

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

        const response = await getWalletDetails(); // ✅ No need to pass token if axiosInstance handles it

        if (
          response.status === "success" &&
          Array.isArray(response.playerWallet)
        ) {
          setbankDetails(response.playerWallet);
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
  // Toggle Wallet Status
  const toggleWalletStatus = async (wallet_id, currentStatus) => {
    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    // Prevent double-clicking
    if (loadingId) return;
    setLoadingId(wallet_id);

    const newStatus = currentStatus === "1" ? "0" : "1";

    try {
      // ✅ Step 1: Verify token (Keep your existing logic)
      try {
        const tokenRes = await verifyToken(token);
        if (tokenRes.status !== "success") {
          setError(tokenRes.message || "Invalid token.");
          setLoadingId(null);
          return;
        }
      } catch (verifyError) {
        setError("Token verification failed.");
        setLoadingId(null);
        return;
      }

      // ✅ Step 2: Proceed with status change
      // This calls the API function we fixed in the previous step
      const response = await changeWalletStatus(token, wallet_id, newStatus);

      console.log("newStatus:", newStatus, "ID:", wallet_id);

      if (response.status === "success") {
        // Update Local State
        setbankDetails((prevDetails) =>
          prevDetails.map((wallet) =>
            wallet.id === wallet_id ? { ...wallet, status: newStatus } : wallet
          )
        );

        // Updated Toast Text for Wallet Context
        toast.success(
          <span>
            Wallet{" "}
            <span style={{ position: "relative", top: "-2px" }}>
              {newStatus === "1" ? "🔓" : "🔒"}
            </span>{" "}
            {newStatus === "1" ? "Activated" : "Deactivated"} successfully!
          </span>,
          { autoClose: 3000 }
        );
      } else {
        alert(response.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("An error occurred while updating status.");
    } finally {
      // Always stop loading, success or fail
      setLoadingId(null);
    }
  };

  //   validation
  const validationSchema = Yup.object({
    // Updated: Bank Name -> Name
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),

    // Updated: A/C Holder Name -> Phone Number
    phone_number: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must be digits only")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number cannot exceed 15 digits") // Updated to 15
      .required("Phone Number is required"),
  });

  //   const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
      phone_number: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors, resetForm }) => {
      try {
        // ✅ Step 1: Verify the token
        try {
          const tokenRes = await verifyToken(token);
          if (tokenRes.status !== "success") {
            toast.error(
              tokenRes.message ||
                "Invalid or expired token. Please log in again."
            );
            setErrors({
              api:
                tokenRes.message ||
                "Invalid or expired token. Please log in again.",
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
              navigate(location.pathname, { replace: true, state: {} });
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
        const response = await storeWallet(token, values);

        console.log(response);

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

          const refreshedBanks = await getWalletDetails(token);
          if (
            refreshedBanks.status === "success" &&
            Array.isArray(refreshedBanks.playerWallet)
          ) {
            setbankDetails(refreshedBanks.playerWallet);
          }
          setLoading(false);
        } else {
          setErrors({
            api:
              response.data.message ||
              "Something went wrong while saving bank details.",
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
          setErrors({ api: Array.from(apiErrors) });
        } else if (error.request) {
          setErrors({
            api: ["Server not responding. Please try again later."],
          });
        } else {
          setErrors({ api: ["Something went wrong. Try again."] });
        }
      }
      setSubmitting(false);
    },
  });

  // Formik Update the form
  const updateFormik = useFormik({
    initialValues: {
      name: "",
      phone_number: "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // ✅ Step 1: Verify the token
        try {
          const tokenRes = await verifyToken(token);
          if (tokenRes.status !== "success") {
            toast.error(
              tokenRes.message ||
                "Invalid or expired token. Please log in again."
            );
            setErrors({
              api:
                tokenRes.message ||
                "Invalid or expired token. Please log in again.",
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
              navigate(location.pathname, { replace: true, state: {} });
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

        // const response = await axios.post(
        //   `${BASE_URL}/player/update-bank/${editingBankId}`,
        //   values,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        const response = await updateWallet(token, values, editingBankId);
        if (response.status === "success") {
          // alert("Bank updated successfully! ✅");
          toast.success(`Bank updated successfully! 🎉`);

          updateFormik.resetForm(); // ✅ Reset the modal form
          setEditingBankId(null);
          setActiveTab("bank");

          // ✅ Refresh the list
          setLoading(true);
          // const refreshedBanks = await axios.get(
          //   `${BASE_URL}/player/get-bank`,
          //   {
          //     headers: { Authorization: `Bearer ${token}` },
          //   }
          // );

          const refreshedBanks = await getWalletDetails(token);

          if (
            refreshedBanks.status === "success" &&
            Array.isArray(refreshedBanks.playerWallet)
          ) {
            setbankDetails(refreshedBanks.playerWallet);
          }

          setLoading(false);
          const modalEl = document.getElementById("edit_bank_details");
          const bootstrap = window.bootstrap; // ✅ add this line for CDN

          if (modalEl) {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.hide(); // ✅ closes the modal
          }
        } else {
          setErrors({ api: response.data.message || "Something went wrong." });
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
          setErrors({ api: Array.from(apiErrors) });
        } else if (error.request) {
          setErrors({
            api: ["Server not responding. Please try again later."],
          });
        } else {
          setErrors({ api: ["Something went wrong. Try again."] });
        }
      }
      setSubmitting(false);
    },
  });

  const handleEditwalletBankClick = async (bankId) => {
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
      const message =
        verifyError.message || "Session expired. Please log in again.";
      toast.error(message);
      return;
    }

    // ✅ Step 3: Proceed with fetch
    try {
      // console.log(walletId, "--------------------------"); // Changed bankId to walletId for clarity
      const response = await EditwalletBank(bankId); // Pass walletId
      // console.log(walletId, "--------------------------");

      console.log(response);

      if (response.status === "success") {
        // Renamed 'bank' to 'wallet' for better context
        const wallet = response.data; // You might need to change 'response.playerBank' to 'response.playerWallet'

        setEditingBankId(bankId); // Use walletId in the setter

        // --- KEY CHANGES HERE: Updating Formik values ---
        updateFormik.setValues({
          name: wallet.name || "", // Fetches 'name' and replaces 'bank_name'
          phone_number: wallet.phone_number || "", // Fetches 'phone_number' and replaces 'account_holder_name'
        });
      } else {
        // Updated toast message for wallet context
        toast.error(response.message || "Failed to fetch wallet details.");
      }
    } catch (error) {
      // Updated toast message for wallet context
      toast.error("Something went wrong while fetching wallet data.");
    }
  };

  const handleDeleteBankClick = (bankId) => {
    setDeleteSelectedBankId(bankId); // save this to use later
    setShowModal(true); // open confirmation modal
  };
  const confirmDeleteBank = async () => {
    try {
      const response = await deleteBankDetails(token, deleteSelectedBankId);

      if (response.status === "success") {
        toast.success(`Bank deleted successfully! 🎉`);

        // remove deleted bank from state
        setbankDetails((prevDetails) =>
          prevDetails.filter((bank) => bank.id !== deleteSelectedBankId)
        );
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

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        pauseOnHover={false}
        closeOnClick
        theme="dark"
      />
      {loading && <p>Loading...</p>}

      {error && <p className="text-danger">{error}</p>}

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9990 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm justify-content-center">
            <div className="modal-content" style={{ width: "350px" }}>
              <div className="modal-body d-flex flex-column align-items-center py-4">
                <img
                  src="assets/img/icons/warning.gif"
                  className="mb-2"
                  style={{ width: "53px" }}
                />
                <h4 className="fw-700 text-center text-black mb-2">
                  Are you sure?
                </h4>
                <div className="fw-500 fs-13 text-center text-black mb-3">
                  You want to delete this!
                </div>
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
            className={`nav-link btn-color text-white w-150 ${
              activeTab === "bank" ? "active" : ""
            }`}
            onClick={() => setActiveTab("bank")}
            type="button"
          >
            Bank Details
          </button>
          <button
            className={`nav-link btn-color text-white w-150 ${
              activeTab === "add" ? "active" : ""
            }`}
            onClick={() => setActiveTab("add")}
            type="button"
          >
            Add Bank
          </button>
        </nav>
        <div className="tab-content mt-3" id="myTabContent">
          {/* Bank Details Tab */}
          {activeTab === "bank" && (
            <div
              className="tab-pane fade show active"
              id="Bank_details"
              role="tabpanel"
            >
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
                  ) : bankDetails.filter((bank) => bank.status === "1").length >
                    0 ? (
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
                                    <strong>UPI ID:</strong>{" "}
                                    {bank.upi_id || "N/A"}
                                  </p>
                                ) : (
                                  <>
                                    <div>
                                      <p className="mb-0 text-grey">
                                        Bank Name
                                      </p>
                                      <h6>{bank.bank_name || "N/A"}</h6>
                                    </div>
                                    <div>
                                      <p className="mb-0 text-grey">
                                        Account Holder:
                                      </p>
                                      <h6>
                                        {bank.account_holder_name || "N/A"}
                                      </h6>
                                    </div>
                                    <div>
                                      <p className="mb-0 text-grey">
                                        Account Number:
                                      </p>
                                      <h6>{bank.account_number || "N/A"}</h6>
                                    </div>
                                    <div>
                                      <p className="mb-0 text-grey">
                                        IFSC Code
                                      </p>
                                      <h6>{bank.ifsc_code || "N/A"}</h6>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {/* input icon starts */}
                            <div className="px-2 py-1">
                              <div className="form-check px-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="flexRadioDefault"
                                  value={bank.id}
                                  checked={selectedBankId === bank.id}
                                  onChange={() => setSelectedBankId(bank.id)}
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
                      style={{ padding: "2px 10px" }}
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
            <div
              className="tab-pane fade show active"
              id="profile"
              role="tabpanel"
            >
              {/* your add bank form UI here */}
              {/* card 2*/}
              {/* <div className="card bg_light_grey account_input-textbox-container"> */}
              <div className="card bg_light_grey br-grey account_input-textbox-container my-2 mx-2">
                <div className="card-body p-2">
                  <h5 className="mb-1">Add wallet Details</h5>
                  <form
                    className="form-control_container"
                    onSubmit={formik.handleSubmit}
                  >
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

                    {/* Field 1: Name */}
                    <div className="input-field">
                      <input
                        required
                        className="input"
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className="label">Name</label>
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-danger">{formik.errors.name}</p>
                      )}
                    </div>

                    {/* Field 2: Phone Number */}
                    <div className="input-field">
                      <input
                        required
                        className="input"
                        type="number"
                        name="phone_number"
                        value={formik.values.phone_number}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <label className="label">Phone Number</label>
                      {formik.touched.phone_number &&
                        formik.errors.phone_number && (
                          <p className="text-danger">
                            {formik.errors.phone_number}
                          </p>
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
              <h1
                className="modal-title text-white fs-5"
                id="exampleModalToggleLabel"
              >
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
                          {bank.payment_method?.name === "UPI" ? (
                            <p>
                              <strong>UPI ID:</strong> {bank.upi_id || "N/A"}
                            </p>
                          ) : (
                            <>
                              <div>
                                <p className="mb-0 text-grey">Name</p>
                                <h6>{bank.name || "N/A"}</h6>
                              </div>
                              <div>
                                <p className="mb-0 text-grey">Phone Number:</p>
                                <h6>{bank.phone_number || "N/A"}</h6>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        {/* Status Button */}

                        {bank.status}
                        <button
                          disabled={loadingId === bank.id} // Disable if this specific button is loading
                          className={`btn ${
                            bank.status === "1" ? "btn-success" : "btn-danger"
                          }`}
                          onClick={() =>
                            toggleWalletStatus(bank.id, bank.status)
                          }
                          style={{
                            minWidth: "80px",
                            opacity: loadingId === bank.id ? 0.6 : 1,
                          }}
                        >
                          {loadingId === bank.id ? (
                            // Optional: Simple loading text or spinner
                            <span>...</span>
                          ) : bank.status === "1" ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          className="btn mt-2"
                          onClick={() => handleEditwalletBankClick(bank.id)}
                          data-bs-toggle="modal"
                          data-bs-target="#edit_bank_details"
                        >
                          <i class="fa-solid fa-pen-to-square fs-4 text-white"></i>
                        </button>
                        {/* Edit Button */}
                        <button
                          className="btn mt-2"
                          onClick={() => handleDeleteBankClick(bank.id)}
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
        tabindex="-1"
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
                onSubmit={updateFormik.handleSubmit}
              >
                {/* {updateFormik.errors.api && (
                  <p className="text-danger">{updateFormik.errors.api}</p>
                )} */}

                {updateFormik.errors.api &&
                  (Array.isArray(updateFormik.errors.api) ? (
                    <p className="text-danger ">
                      {updateFormik.errors.api.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </p>
                  ) : (
                    <p className="text-danger">{updateFormik.errors.api}</p>
                  ))}

                <div className="input-field mb-3">
                  <input
                    required
                    className="input"
                    type="text"
                    name="name" // Changed from bank_name
                    value={updateFormik.values.name} // Changed
                    onChange={updateFormik.handleChange}
                    onBlur={updateFormik.handleBlur}
                  />
                  <label className="label">Name</label> {/* Changed */}
                  {updateFormik.touched.name &&
                    updateFormik.errors.name && ( // Changed
                      <p className="text-danger">{updateFormik.errors.name}</p>
                    )}
                </div>

                <div className="input-field mb-3">
                  <input
                    required
                    className="input"
                    type="number" // Changed type to number/tel is often better for phones
                    name="phone_number" // Changed from account_holder_name
                    value={updateFormik.values.phone_number} // Changed
                    onChange={updateFormik.handleChange}
                    onBlur={updateFormik.handleBlur}
                  />
                  <label className="label">Phone Number</label> {/* Changed */}
                  {updateFormik.touched.phone_number &&
                    updateFormik.errors.phone_number && ( // Changed
                      <p className="text-danger">
                        {updateFormik.errors.phone_number}
                      </p>
                    )}
                </div>

                <div className="d-flex justify-content-center">
                  <button
                    type="submit"
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
