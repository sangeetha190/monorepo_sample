import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";

import routes from "../../routes/routes";
import { Images } from "@core/constants/images";
import AuthContext from "@core/auth/AuthContext";
import { getAuthType, registerUser } from "@core/api/authAPI";

import { toast, ToastContainer } from "react-toastify";


const PENDING_CODE_KEY = "pendingGiftCode";
const Register = () => {
  const { login } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Navigation function
  const [authType, setAuthType] = useState(null); // 👈 Store type here
  const [loading, setLoading] = useState(true); // 👈 To wait until API response
  const [giftNotice, setGiftNotice] = useState(null);
  useEffect(() => {
    // Check both giftNotice flag and pending code
    const noticeFlag = localStorage.getItem("giftNotice");
    const pendingCode = localStorage.getItem(PENDING_CODE_KEY);

    if (noticeFlag === "true" && pendingCode) {
      setGiftNotice("You got a gift! Please login to claim it 🎁");
    }
  }, []);
  useEffect(() => {
    // if the token is there then navigate to the home
    const token = localStorage.getItem("token");
    if (token) {
      navigate(routes.home);
    }
    // 👇 Fetch the authentication type from your API
    const fetchAuthType = async () => {
      try {
        const res = await getAuthType(); // e.g., returns { type: "default" }
        // console.log(res);
        setAuthType(res.type);
      } catch (err) {
        console.error("Failed to get auth type", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthType();
  }, [navigate]);

  //   Validation Schema
  const validationSchema = Yup.object({
    username: Yup.string().required("Name is required"),
    mobile: Yup.string().required("Mobile number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    agreement: Yup.boolean().oneOf([true], "You must accept the terms"),
  });

  const otpValidationSchema = Yup.object({
    username: Yup.string()
      .required("Name is required")
      .test("unique-username", "Checking...", async function (value) {
        if (!value) return false;

        try {
          const res = await checkPlayerName(value);

          if (res.status === "success") return true;

          return this.createError({
            message: res.msg || "Username already taken",
          });
        } catch (err) {
          // ✅ Handle 409 error gracefully
          const message =
            err?.response?.data?.msg ||
            "Something went wrong while checking name.";
          return this.createError({ message });
        }
      }),
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number")
      .required("Mobile number is required"),
    agreement: Yup.boolean().oneOf([true], "You must accept the terms"),
  });

  const handleRegister = async (values, { setSubmitting }) => {
    setErrorMessage(""); // Reset previous errors

    try {
      if (authType === "default") {
        // ✅ Call the registerUser function (returns full response)
        const data = await registerUser(
          values.username,
          values.mobile,
          values.password
        );
        if (data.status === "success") {
          localStorage.setItem("token", data.token);
          login(data.token);

          toast.success("Registration successful!", {
            autoClose: 2500, // how long the toast stays
            pauseOnHover: true,
            onClose: () => navigate(routes.home), // redirect after toast disappears
          });
        } else {
          setErrorMessage(data.msg || "Registration failed.");
        }
      } else if (authType === "otp") {
        const data = await registerUser(values.username, values.mobile);

        if (data.status === "success") {
          alert(data.msg || "Registration successful!");
          localStorage.setItem("token", data.token);
          login(data.token); //  ✨ Update global auth state
          navigate(routes.auth.verifyOTP, {
            state: {
              player_name: values.username,
              mobile: values.mobile,
              type: "login", // or "login"
              authType,
            },
          }); // ✅ for programmatic redirects
        } else {
          setErrorMessage(data.msg || "Registration failed."); // ✅ Show API error message
        }
      } else if (authType === "static_otp") {
        const data = await registerUser(values.username, values.mobile);
        // console.log(data);

        if (data.status === "success") {
          alert(data.msg || "Registration successful!");

          navigate(routes.auth.verifyOTP, {
            state: {
              mobile: values.mobile,
              type: "register",
              otp: data.otp, // 👈 pass static OTP to Verify page,
            },
          });
        } else {
          setErrorMessage(data.msg || "Registration failed.");
        }
      }
    } catch (error) {
      if (error.response?.data?.msg) {
        setErrorMessage(error.response.data.msg); // ✅ Show error from API
      } else if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors)
          .flat()
          .join(" ");
        // console.log("Setting Validation error:", validationErrors);
        setErrorMessage(validationErrors); // ✅ Show validation errors
      } else {
        setErrorMessage("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // if (loading) return <p className="text-white text-center mt-5">Loading...</p>;
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="dark"
        closeButton={<MyClose />}
      />
      <section className="container black-red">
        <Link to={routes.home}>
          <div className="logo d-flex justify-content-center mb-2">
            <img src={Images.Favlogo} alt="Logo" width="50%" />
          </div>
        </Link>

        <div className="pt-3 pb-2 card-log">
          {/* Logo */}
          {giftNotice && (
            <div className="alert alert-light border border-warning shadow-sm d-flex align-items-center gap-0 py-0 px-1">
              <span style={{ fontSize: "2rem" }}>🎁</span>
              <span>
                <span style={{ fontWeight: "700", color: "#109607ff" }}>
                  You got a gift!
                </span>
                {/* <br /> */}
                {/* <span style={{ color: "#555" }}> Login to claim it.</span> */}
              </span>
            </div>
          )}
          <div className="">
            {/* Heading */}
            <div className="py-2">
              <h3 className="title text-black">Register</h3>
              <p className="text-gray">Create your account to get started.</p>
            </div>

            {authType === "default" ? (
              <>
                {/*   Register Form */}
                <Formik
                  initialValues={{
                    name: "",
                    mobile: "",
                    password: "",
                    confirmPassword: "",
                    agreement: false,
                  }}
                  validationSchema={validationSchema}
                  validateOnChange={false} // only validate on blur or submit
                  onSubmit={handleRegister}
                >
                  {({ isSubmitting }) => (
                    <Form className="login-form">
                      {/* Show API Error Message */}
                      {errorMessage && (
                        <p className="text-danger">{errorMessage}</p>
                      )}

                      {/*   Username Input */}
                      <div className="input-groups mb-2">
                        <label
                          htmlFor="username"
                          className="form-label text-gray"
                        >
                          Username
                        </label>
                        <Field
                          type="text"
                          className="form-control login-card__form-control"
                          id="username"
                          name="username"
                        />
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="error text-danger"
                        />
                      </div>

                      {/*   Mobile Number Input */}
                      {/* Mobile Number Input */}
                      <div className="input-groups mb-2">
                        <label
                          htmlFor="mobile"
                          className="form-label text-gray"
                        >
                          Mobile No
                        </label>

                        <Field name="mobile">
                          {({ field, form }) => (
                            <input
                              {...field}
                              type="tel"
                              id="mobile"
                              className="form-control login-card__form-control"
                              inputMode="numeric" // brings up numeric keypad on mobile
                              pattern="[0-9]*" // soft hint for digits
                              autoComplete="tel"
                              onChange={(e) => {
                                const digits = e.target.value.replace(
                                  /\D/g,
                                  ""
                                ); // strip non-digits
                                form.setFieldValue("mobile", digits); // ❌ no length cap
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pasted = (
                                  e.clipboardData || window.clipboardData
                                ).getData("text");
                                const digits = pasted.replace(/\D/g, "");
                                form.setFieldValue("mobile", digits); // ❌ no length cap
                              }}
                            />
                          )}
                        </Field>

                        <ErrorMessage
                          name="mobile"
                          component="div"
                          className="error text-danger"
                        />
                      </div>

                      {/*   Password Input */}
                      <div className="input-groups mb-2">
                        <label
                          htmlFor="password"
                          className="form-label text-gray"
                        >
                          Password
                        </label>
                        <Field
                          type="password"
                          className="form-control login-card__form-control"
                          id="password"
                          name="password"
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="error text-danger"
                        />
                      </div>

                      {/*   Confirm Password Input */}
                      <div className="input-groups mb-2 position-relative">
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
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="error text-danger"
                        />
                      </div>

                      {/*   Agreement Checkbox */}
                      <div className="mb-3 form-check">
                        <Field
                          type="checkbox"
                          className="form-check-input "
                          id="agreement"
                          name="agreement"
                        />
                        <label
                          className="form-check-label text-secondary mt-1 px-1"
                          htmlFor="agreement"
                        >
                          I agree to the User Agreement & confirm I am at least
                          18 years old
                        </label>
                        <ErrorMessage
                          name="agreement"
                          component="div"
                          className="error text-danger"
                        />
                      </div>

                      {/*   Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-login w-100 my-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Signing up..." : "Sign up"}
                        <i className="ri-expand-right-line text-white fs-20 ms-2" />
                      </button>
                    </Form>
                  )}
                </Formik>
              </>
            ) : authType === "otp" ? (
              <Formik
                initialValues={{
                  name: "",
                  mobile: "",
                  agreement: false,
                }}
                validationSchema={otpValidationSchema}
                onSubmit={handleRegister}
              >
                {({ isSubmitting }) => (
                  <Form className="login-form">
                    {/* Show API Error Message */}
                    {errorMessage && (
                      <p className="text-danger">{errorMessage}</p>
                    )}

                    {/*   Username Input */}
                    <div className="input-groups mb-4">
                      <label
                        htmlFor="username"
                        className="form-label text-white"
                      >
                        Username
                      </label>
                      <Field
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="error text-danger"
                      />
                    </div>

                    {/*   Mobile Number Input */}
                    <div className="input-groups mb-4">
                      <label htmlFor="mobile" className="form-label text-white">
                        Mobile No
                      </label>
                      <Field
                        type="tel"
                        className="form-control"
                        id="mobile"
                        name="mobile"
                      />
                      <ErrorMessage
                        name="mobile"
                        component="div"
                        className="error text-danger"
                      />
                    </div>
                    {/*   Agreement Checkbox */}
                    <div className="mb-3 form-check">
                      <Field
                        type="checkbox"
                        className="form-check-input"
                        id="agreement"
                        name="agreement"
                      />
                      <label
                        className="form-check-label text-secondary mt-1 px-1"
                        htmlFor="agreement"
                      >
                        I agree to the User Agreement & confirm I am at least 18
                        years old
                      </label>
                      <ErrorMessage
                        name="agreement"
                        component="div"
                        className="error text-danger"
                      />
                    </div>

                    {/*   Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-login w-100 my-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing up..." : "Sign up"}
                      <i className="ri-expand-right-line text-white fs-20 ms-2" />
                    </button>
                  </Form>
                )}
              </Formik>
            ) : authType === "static_otp" ? (
              <Formik
                initialValues={{
                  name: "",
                  mobile: "",
                  agreement: false,
                }}
                validationSchema={otpValidationSchema}
                onSubmit={handleRegister}
              >
                {({ isSubmitting }) => (
                  <Form className="login-form">
                    {/* Show API Error Message */}
                    {errorMessage && (
                      <p className="text-danger">{errorMessage}</p>
                    )}

                    {/*   Username Input */}
                    <div className="input-groups mb-4">
                      <label
                        htmlFor="username"
                        className="form-label text-white"
                      >
                        Username
                      </label>
                      <Field
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="error text-danger"
                      />
                    </div>

                    {/*   Mobile Number Input */}
                    <div className="input-groups mb-4">
                      <label htmlFor="mobile" className="form-label text-white">
                        Mobile No
                      </label>
                      <Field
                        type="tel"
                        className="form-control"
                        id="mobile"
                        name="mobile"
                      />
                      <ErrorMessage
                        name="mobile"
                        component="div"
                        className="error text-danger"
                      />
                    </div>
                    {/*   Agreement Checkbox */}
                    <div className="mb-3 form-check">
                      <Field
                        type="checkbox"
                        className="form-check-input"
                        id="agreement"
                        name="agreement"
                      />
                      <label
                        className="form-check-label text-secondary mt-1 px-1"
                        htmlFor="agreement"
                      >
                        I agree to the User Agreement & confirm I am at least 18
                        years old
                      </label>
                      <ErrorMessage
                        name="agreement"
                        component="div"
                        className="error text-danger"
                      />
                    </div>

                    {/*   Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-login w-100 my-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing up..." : "Sign up"}
                      <i className="ri-expand-right-line text-white fs-20 ms-2" />
                    </button>
                  </Form>
                )}
              </Formik>
            ) : (
              <p className="text-white">Invalid auth type: {authType}</p>
            )}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray">
                Already have an account?
                <span
                  className="link ms-2 fs-16 text-red"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(routes.auth.login)}
                >
                  Sign In
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;

const MyClose = ({ closeToast }) => (
  <button onClick={closeToast} className="toaster_close_btn">
    ×
  </button>
);
