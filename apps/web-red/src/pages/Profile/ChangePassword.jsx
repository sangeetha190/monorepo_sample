import axios from "axios";
import {useFormik} from "formik";
import React, {useContext} from "react";
import * as Yup from "yup";
// import BASE_URL from "../../API/api";
// import AuthContext from "../../Auth/AuthContext";
import BASE_URL from "@core/api/api";
import AuthContext from "@core/auth/AuthContext";

// import {verifyToken} from "@core/api/authAPI";
import {useNavigate} from "react-router-dom";
// import routes from "../routes/route";
import routes from "../../routes/routes";

const ChangePassword = () => {
    const navigate = useNavigate(); // Navigation function
    const {user, profile} = useContext(AuthContext);
    const token = user?.token;

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            oldPassword: Yup.string().required("Old password is required"),
            newPassword: Yup.string()
            .min(6, "New password must be at least 6 characters")
            .required("New password is required"),
            confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
            .required("Confirm password is required"),
        }),
        onSubmit: async (values, {setSubmitting, setErrors, resetForm}) => {
            // console.log("user data", user, profile.mobile);

            try {
                const response = await axios.post(
                    `${BASE_URL}/player/change-password`,
                    {
                        mobile: profile.mobile,
                        old_password: values.oldPassword,
                        password: values.newPassword,
                        password_confirmation: values.confirmPassword,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                // console.log(response);
                alert("Password changed successfully!");
                resetForm(); // ✅ Reset form after success
                navigate(routes.account.dashboard);
            } catch (error) {
                setErrors({
                    submit: error.response?.data?.msg || "Something went wrong",
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <section className="container position-relative">
            <div className="h-100">
                <div className="pt-3 pb-2">
                    <div className="row px-2">
                        <div className="d-flex justify-content-between align-items-center px-0 ">
                            <button className="go_back_btn" onClick={() => window.history.back()}>
                                <i className="ri-arrow-left-s-line text-white fs-24" />
                            </button>
                        </div>
                        <div className="card bg_light_grey account_input-textbox-container mt-4">
                            <div className="card-body py-4 pb-5">
                                <h5 className="mb-3">Change Password</h5>
                                <form className="form-control_container" onSubmit={formik.handleSubmit}>
                                    <div className="input-field mb-3">
                                        <input
                                            className="input"
                                            type="password"
                                            name="oldPassword"
                                            onChange={formik.handleChange}
                                            value={formik.values.oldPassword}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="label" htmlFor="oldPassword">
                                            Old Password
                                        </label>
                                        {formik.touched.oldPassword && formik.errors.oldPassword && (
                                            <div className="error text-danger">{formik.errors.oldPassword}</div>
                                        )}
                                    </div>
                                    <div className="input-field mb-3">
                                        <input
                                            className="input"
                                            type="password"
                                            name="newPassword"
                                            onChange={formik.handleChange}
                                            value={formik.values.newPassword}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="label" htmlFor="newPassword">
                                            New Password
                                        </label>
                                        {formik.touched.newPassword && formik.errors.newPassword && (
                                            <div className="error text-danger">{formik.errors.newPassword}</div>
                                        )}
                                    </div>
                                    <div className="input-field mb-3">
                                        <input
                                            className="input"
                                            type="password"
                                            name="confirmPassword"
                                            onChange={formik.handleChange}
                                            value={formik.values.confirmPassword}
                                            onBlur={formik.handleBlur}
                                        />
                                        <label className="label" htmlFor="confirmPassword">
                                            Confirm Password
                                        </label>
                                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                            <div className="error text-danger">{formik.errors.confirmPassword}</div>
                                        )}
                                    </div>
                                    {formik.errors.submit && (
                                        <div className="error text-danger">{formik.errors.submit}</div>
                                    )}
                                    <div className="d-flex justify-content-center">
                                        <button
                                            type="submit"
                                            className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                                            disabled={formik.isSubmitting}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChangePassword;
