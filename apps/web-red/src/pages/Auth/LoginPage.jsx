import { useFormik } from "formik";
import * as Yup from "yup";

import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthContext from "@core/auth/AuthContext";
import { getAuthType, loginUser } from "@core/api/authAPI";

import { APP_NAME } from "@core/constants";// if you export it
import routes from "../../routes/routes";
import { Images } from "@core/constants/images";

const PENDING_CODE_KEY = "pendingGiftCode";
const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [authType, setAuthType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giftNotice, setGiftNotice] = useState(null);
  const [submitLock, setSubmitLock] = useState(false);
  useEffect(() => {
    // Check both giftNotice flag and pending code
    const noticeFlag = localStorage.getItem("giftNotice");
    const pendingCode = localStorage.getItem(PENDING_CODE_KEY);

    if (noticeFlag === "true" && pendingCode) {
      setGiftNotice("You got a gift! Please login to claim it 🎁");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(routes.home);
    }
    const getAuthTypes = async () => {
      try {
        const res = await getAuthType(); // e.g., returns { type: "default" }
        // console.log(res);
        setAuthType(res.type);
      } catch (error) {
        console.error("Error fetching auth types:", error);
      } finally {
        setLoading(false);
      }
    };
    getAuthTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      user_mobile: "",
      user_password: "",
      static_otp: "",
    },
    validationSchema: Yup.object().shape({
      user_mobile: Yup.string().required("Mobile number is required"),
      user_password:
        authType === "default"
          ? Yup.string()
              .min(6, "Password must be at least 6 characters")
              .required("Password is required")
          : Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (authType === "default") {
          const data = await loginUser(
            values.user_mobile,
            values.user_password
          );
         
          if (data.status === "success") {
            localStorage.setItem("token", data.token);
            login(data.token);
            navigate(routes.home, { state: { showLoginSuccess: true } });
          } else {

            const fieldErrors = {};
            data.errors.forEach((err) => {
              const field = Object.keys(err)[0];
              // Map API field name to formik field name
              if (field === "mobile") {
                fieldErrors["user_mobile"] = err[field];
              } else {
                fieldErrors[field] = err[field];
              }
            });
            setErrors(fieldErrors);
          }
        } else if (authType === "otp") {
          const otpResponse = await loginUser(values.user_mobile); // Using the renamed function
       
          if (otpResponse && otpResponse.status === "success") {
           
            navigate(routes.auth.verifyOTP, {
              state: { mobile: values.user_mobile, type: "login", authType },
            });
          } else {
            console.error("OTP request failed:", otpResponse);
            setErrors({ api: otpResponse?.msg || "OTP request failed" });
          }
        } else if (authType === "static_otp") {
          const staticLoginResponse = await loginUser(values.user_mobile);

        
          if (staticLoginResponse.status === "success") {
            localStorage.setItem("token", staticLoginResponse.token);
            login(staticLoginResponse.token);
            navigate(routes.auth.verifyOTP, {
              state: { mobile: values.user_mobile, type: "login", authType },
            });
          } else {
            setErrors({ api: staticLoginResponse.msg || "Invalid Static OTP" });
          }
        }
      } catch (error) {
        console.error("Error during login/OTP request:", error);
        setErrors({
          api: error.response?.data?.msg || "Login failed. Please try again.",
        });
      }
      setSubmitting(false);
    },
  });

  // if (loading) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center text-white vh-100">
  //       Loading...
  //     </div>
  //   );
  // }

  const handleSafeSubmit = async (e) => {
    e.preventDefault();

    if (submitLock) return; // ✅ Block duplicate submits
    setSubmitLock(true);

    try {
      await formik.handleSubmit(); // ✅ Let Formik do its job
    } finally {
      setSubmitLock(false); // ✅ Release the lock after response
    }
  };

  return (
    <section className="container vh-100 position-relative overflow-hidden black-red">
      <div className="">
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

        <div className="p-3 d-flex justify-content-start flex-column card-log">
          {giftNotice && (
            <div className="alert alert-light border border-warning shadow-sm d-flex align-items-center gap-0 py-0 px-1">
              <span style={{ fontSize: "2rem" }}>🎁</span>
              <span>
                <span style={{ fontWeight: "700", color: "#109607ff" }}>
                  You got a gift!
                </span>
               
              </span>
            </div>
          )}
          <div class="py-2 pt-0">
            <h4 class="fw-bold text-black">Hi, Welcome Back! 👋</h4>
            <p class="text-muted mb-2 text-gray">
              Hello again, you’ve been missed!
            </p>
          </div>
          <div className="form">
            {authType === "default" ? (
              <form onSubmit={handleSafeSubmit}>
                {formik.errors.api && (
                  <p className="text-danger">{formik.errors.api}</p>
                )}

                {/* Mobile Input */}
                <div className="input-groups mb-3">
                  <label htmlFor="user_mobile" className="form-label text-gray">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    id="user_mobile"
                    name="user_mobile"
                    className="form-control login-card__form-control"
                    value={formik.values.user_mobile}
                    inputMode="numeric" // mobile shows number keypad
                    pattern="[0-9]*" // soft hint for numeric
                    autoComplete="tel"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, ""); // keep only 0-9
                      formik.setFieldValue("user_mobile", digits);
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = (
                        e.clipboardData || window.clipboardData
                      ).getData("text");
                      const digits = pasted.replace(/\D/g, "");
                      formik.setFieldValue("user_mobile", digits.slice(0, 10));
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.user_mobile && formik.errors.user_mobile && (
                    <p className="text-danger">{formik.errors.user_mobile}</p>
                  )}
                </div>

                {/* Password Input (Only for Default Auth Type) */}
                <div className="input-groups mb-3">
                  <label
                    htmlFor="user_password"
                    className="form-label text-gray"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control login-card__form-control"
                    id="user_password"
                    name="user_password"
                    value={formik.values.user_password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.user_password &&
                    formik.errors.user_password && (
                      <p className="text-danger">
                        {formik.errors.user_password}
                      </p>
                    )}
                  {/* Forgot Password Link */}
                  <div className="text-end mt-2">
                    <Link
                      to={routes.auth.forgotPassword}
                      className="link fs-14 text-red"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-login w-100 mt-2"
                  disabled={formik.isSubmitting} // ✅ disable when submitting
                >
                  {formik.isSubmitting
                    ? "Logging in ..."
                    : authType === "otp"
                    ? "Request OTP"
                    : "Login"}
                </button>
                {/* Register Link */}
                <div className="text-center mt-3">
                  <p className="text-gray ">
                    <span className="text-gray "> New to {APP_NAME}? </span>
                    <Link
                      to={routes.auth.register}
                      className="link ms-2 fs-16 text-red z-2"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </form>
            ) : authType === "otp" ? (
              <form onSubmit={formik.handleSubmit}>
                {/* Mobile Input */}
                <div className="input-groups mb-4">
                  <label
                    htmlFor="user_mobile"
                    className="form-label text-white"
                  >
                    Mobile
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="user_mobile"
                    name="user_mobile"
                    value={formik.values.user_mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.user_mobile && formik.errors.user_mobile && (
                    <p className="text-danger">{formik.errors.user_mobile}</p>
                  )}
                </div>

                {/* Error Messages */}
                {formik.errors.api && (
                  <p className="text-danger">{formik.errors.api}</p>
                )}

                {/* Submit Button */}
                <button type="submit" className="btn btn-login w-100 mt-4">
                  {formik.isSubmitting
                    ? "Logging in ..."
                    : authType === "otp"
                    ? "Request OTP"
                    : "Login"}
                </button>

                <div class="login-card__divider">Or With</div>

                {/* Register Link */}
                <div className="text-center text-gray mt-3">
                  <span className="text-gray">
                    Don’t have an account?{" "}
                    <Link to="/register" className="link ms-2 fs-16 text-red">
                      Create Account
                    </Link>
                  </span>
                </div>
              </form>
            ) : authType === "static_otp" ? (
              <form onSubmit={formik.handleSubmit}>
                {/* Mobile Input */}
                <div className="input-groups mb-4">
                  <label
                    htmlFor="user_mobile"
                    className="form-label text-white"
                  >
                    Mobile
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="user_mobile"
                    name="user_mobile"
                    value={formik.values.user_mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.user_mobile && formik.errors.user_mobile && (
                    <p className="text-danger">{formik.errors.user_mobile}</p>
                  )}
                </div>

                {/* Error Messages */}
                {formik.errors.api && (
                  <p className="text-danger">{formik.errors.api}</p>
                )}

                {/* Submit Button */}
                <button type="submit" className="btn btn-login w-100 mt-4">
                  {formik.isSubmitting
                    ? "Logging in ..."
                    : authType === "otp"
                    ? "Request OTP"
                    : "Login"}
                </button>

                {/* Register Link */}
                <div className="text-center mt-3">
                  <p className="text-gray ">
                    New to Jibooma?{" "}
                    <Link to="/register" className="link ms-2 fs-16 text-red">
                      Create Account
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <p className="text-white">Invalid auth type: {authType}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
