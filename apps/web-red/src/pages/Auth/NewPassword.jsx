import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";

import { Images } from "@core/constants/images";

import routes from "../../routes/routes";
import BASE_URL from "@core/api/baseUrl";

const NewPassword = () => {
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedMobile = localStorage.getItem("forgot_mobile");
    if (storedMobile) {
      setMobile(storedMobile);
    } else {
      navigate("/forgot-password"); // Redirect if mobile number is missing
    }
  }, [navigate]);


  const handleNewPassword = async (values, { setSubmitting }) => {
    try {
      const response = await fetch(`${BASE_URL}/new-password-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobile,
          password: values.password,
          password_confirmation: values.confirmPassword, // Corrected mapping
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Password changed successfully! Redirecting...");

        // Logout the user to remove old session
        await fetch(`${BASE_URL}/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile }),
        });

        localStorage.removeItem("user_token");
        sessionStorage.clear();

        setTimeout(() => navigate("/login"), 2000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Failed to update password.");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container black-red position-relative">
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
              <h3 className="title text-black">Enter New Password</h3>
              <p className="text-gray">
                Create a strong password to secure your account.
              </p>
            </div>
          </div>

          <div className="form">
            <div className="new-password-form">
              <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={Yup.object({
                  password: Yup.string()
                    .min(6, "Password must be at least 6 characters")
                    .required("Password is required"),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref("password"), null], "Passwords must match") // Fixed validation reference
                    .required("Confirm Password is required"),
                })}
                onSubmit={handleNewPassword}
              >
                {({ isSubmitting }) => (
                  <Form>
                    {/* Mobile Number (Display only) */}
                    <div className="input-groups mb-3">
                      <label className="form-label text-gray">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        className="form-control login-card__form-control"
                        value={mobile}
                        disabled
                      />
                    </div>

                    {/* New Password */}
                    <div className="input-groups mb-3 position-relative">
                      <label
                        htmlFor="password"
                        className="form-label text-gray"
                      >
                        New Password
                      </label>
                      <Field
                        type="password"
                        className="form-control login-card__form-control"
                        id="password"
                        name="password"
                        placeholder="Enter new password"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-danger"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="input-groups mb-3 position-relative">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label text-gray"
                      >
                        Confirm Password
                      </label>
                      <Field
                        type="password"
                        className="form-control login-card__form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-danger"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-login w-100 my-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Password"}{" "}
                      <i className="ri-lock-line text-white fs-20" />
                    </button>

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
                  </Form>
                )}
              </Formik>

              <div className="text-center">
                <p className="text-gray">
                  Remembered your password?{" "}
                  <a href="/login" className="text-red fw-600">
                    Log In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="position-absolute bot-img" >
        <img src="https://static.vecteezy.com/system/resources/previews/025/277/333/non_2x/golden-black-casino-gambling-tokens-chips-png.png" className="w-100"/>
      </div> */}
    </section>
  );
};

export default NewPassword;
