import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import BASE_URL from "@core/api/baseUrl";
import routes from "../../routes/routes";
import { Images } from "@core/constants/images";
const ForgotPassword = () => {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (values, { setSubmitting }) => {
    try {
      const response = await fetch(`${BASE_URL}/forgot-password-otp-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile: values.mobile }),
      });

      const data = await response.json();
      // console.log(data);
// kj
      if (data.status === "success") {
        localStorage.setItem("forgot_mobile", values.mobile);
        setMessage(`OTP successfully sent to ${values.mobile}`);
        setIsSuccess(true);

        setTimeout(() => navigate(routes.auth.forgotOTP), 2000);
      } else if (Array.isArray(data.errors)) {
        const fieldError = data.errors[0];
        const field = Object.keys(fieldError)[0];
        setMessage(fieldError[field]);
        setIsSuccess(false);
      } else {
        setMessage(data.message || "Something went wrong. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // podi suthu
    <section className="container black-red">
      <Link to={routes.home}>
        <div
          className="logo d-flex justify-content-center mb-2"
          style={{ "max-width": "400px" }}
        >
          <img
            src={Images.Favlogo}
            alt="Logo"
            width="50%"
            style={{ objectFit: "contain" }}
          />
        </div>
      </Link>
      <div className="pt-3 pb-2 card-log">
        <div className="">
          <div className="py-2">
            <div className="section-head">
              <h3 className="title text-black">Forgot Password</h3>
              <p className="text-gray">
                Enter your mobile number to reset your password.
              </p>
            </div>
          </div>
          <div className="form">
            <div className="forgot-password-form">
              <Formik
                initialValues={{ mobile: "" }}
                validationSchema={Yup.object({
                  mobile: Yup.string()
                    .matches(/^[0-9]{10}$/, "Invalid mobile number")
                    .required("Mobile number is required"),
                })}
                onSubmit={handleForgotPassword}
              >
                {({ isSubmitting }) => (
                  <Form>
                    {/* Success/Error Message */}
                    {message && (
                      <p
                        className={`text-center ${
                          isSuccess ? "text-success" : "text-danger"
                        }`}
                      >
                        {message}
                      </p>
                    )}
                    <div className="input-groups mb-4">
                      <label htmlFor="mobile" className="form-label text-gray">
                        Mobile
                      </label>
                      <Field
                        type="text"
                        className="form-control login-card__form-control"
                        id="mobile"
                        name="mobile"
                        placeholder="Enter your mobile number"
                      />
                      <ErrorMessage
                        name="mobile"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-login w-100 my-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Reset Password"}
                      <i className="ri-send-plane-line text-white fs-20 ms-2" />
                    </button>
                  </Form>
                )}
              </Formik>

              <div className="text-center">
                <p className="text-gray">
                  Remembered your password?{" "}
                  <Link to={routes.auth.login} className="text-red fw-600">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
