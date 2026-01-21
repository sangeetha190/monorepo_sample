import React, { useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../../../Auth/AuthContext";
import routes from "../../../routes/route";
import { EditBank, sendWithdrawRequest } from "../../../../API/withdrawAPI";
import { verifyToken } from "../../../../API/authAPI";
import { toast, ToastContainer } from "react-toastify";
import { APP_NAME, CURRENCY_SYMBOL } from "../../../../constants";

const WithdrawAmountRequest = ({ amount, bankId }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const token = user?.token;
  const formik = useFormik({
    enableReinitialize: true, // 🟣 IMPORTANT!
    initialValues: {
      amount: amount || "",
    },
    validationSchema: Yup.object({
      amount: Yup.string().required("Amount is required"),
    }),
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

        const response = await sendWithdrawRequest({
          token,
          bankId,
          amount: values.amount,
        });

        if (response.status === "success") {
          // toast.success("Withdraw request sent successfully! 🎉");
          setShowModal(true);
          resetForm();
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
          setErrors({ api: serverMessage });
        } else if (error.request) {
          setErrors({ api: "Server not responding. Please try again later." });
        } else {
          setErrors({ api: "Something went wrong. Try again." });
        }
      }
      setSubmitting(false);
    },
  });

  useEffect(() => {
    if (!token || !bankId) return; // ✅ Prevents unnecessary API call

    const fetchBankDetails = async () => {
      try {
        const response = await EditBank(bankId, token);
        if (response.status === "success") {
          setBankDetails(response.playerBank);
        } else {
          toast.error(
            response.message ||
              "Failed to fetch bank details. Please log in again.",
            { toastId: "unauthorized-toast" }
          );
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please log in again.";

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
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm justify-content-center">
            <div className="modal-content" style={{ width: "220px" }}>
              <div className="modal-body d-flex flex-column align-items-center">
                {/* <img src="assets/img/icons/rupee.gif" className="mb-2 w-75" /> */}
                <img
                  src="/assets/img/icons/coin.png"
                  className="mb-2 w-75 coin-animate"
                  alt="coin"
                />
                <div className="fw-700 fs-13 text-center text-black mb-3">
                  Your Request <br />
                  Is In Our Queue!
                </div>
                <Link to={routes.transactions.withdrawHistory}>
                  <span
                    className="btn text-white green-bg"
                    onClick={() => setShowModal(false)} // ❌ Don't use data-bs-dismiss
                  >
                    Thank You
                  </span>
                </Link>
                <span className="text-dark-grey fs-10 fw-700 mt-3">
                  For Choosing {APP_NAME}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />
      {/* card 1 Starts */}
      <div className="card bg_light_grey account_input-textbox-container">
        <div className="card-body">
          <h5 className=" mb-0">Withdraw Amount</h5>
          {amount && (
            <h4>
              {CURRENCY_SYMBOL} {amount}
            </h4>
          )}
          {bankDetails && (
            <div className="mt-3">
              <h5 className="mb-1">Bank Info:</h5>
              <p className="mb-0 text-grey">
                Bank Name: <strong>{bankDetails.bank_name}</strong>
              </p>
              <p className="mb-0 text-grey">
                Account Holder:{" "}
                <strong>{bankDetails.account_holder_name}</strong>
              </p>
              <p className="mb-0 text-grey">
                Account Number: <strong>{bankDetails.account_number}</strong>
              </p>
              <p className="mb-0 text-grey">
                Branch Code: <strong>{bankDetails.ifsc_code}</strong>
              </p>
            </div>
          )}

          {!bankId || !amount ? (
            <div className="text-danger mt-3">
              {/* {amount && <h4>{CURRENCY_SYMBOL}{amount}</h4>}
              {bankId && <h5>{bankId}</h5>} */}
              {!amount && (
                <>
                  <p>
                    {" "}
                    <i class="fa-solid fa-hand-point-right"></i> Please select
                    an amount in Step 1 before continuing.
                  </p>
                </>
              )}
              {!bankId && (
                <>
                  <p>
                    {" "}
                    <i class="fa-solid fa-hand-point-right"></i> Please select a
                    bank account in Step 2 before continuing.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form
              className="form-control_container"
              onSubmit={formik.handleSubmit}
            >
              {/* {formik.errors.api && (
                <p className="text-danger mt-3">{formik.errors.api}</p>
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
              {/* {bankId && <h5>{bankId}</h5>} */}

              <div
                className="input-field mb-3 mt-3"
                style={{ display: "none" }}
              >
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
                  readOnly // 🔐 This makes it non-editable
                  disabled
                />
                {formik.touched.amount && formik.errors.amount && (
                  <p className="text-danger">{formik.errors.amount}</p>
                )}
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
          )}
        </div>
      </div>
      {/* card 1 Starts */}
    </>
  );
};

export default WithdrawAmountRequest;
