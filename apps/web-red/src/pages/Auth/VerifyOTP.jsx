import React, {useContext, useEffect, useRef, useState} from "react";
// import axios from "axios";
import {loginUser, registerUser, verifyOTP} from "@core/api/authAPI";
import {Link, useLocation, useNavigate} from "react-router-dom";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import routes from "../../routes/routes";
import {toast, ToastContainer} from "react-toastify";
// import {Images} from "../layouts/Header/constants/images";
import {Images} from "@core/constants/images";

const VerifyOTP = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // AuthContext
    const {login} = useContext(AuthContext);
    const location = useLocation();

    // const [timeLeft, setTimeLeft] = useState(60); // 1 minutes = 60 seconds
    // const timerRef = useRef(null); // store timer ID
    const [timeLeft, setTimeLeft] = useState(null); // Start as null
    const timerRef = useRef(null);

    // Step 1: Load from localStorage
    useEffect(() => {
        const savedTime = localStorage.getItem("otpTimer");

        if (savedTime) {
            const timePassed = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
            const newTimeLeft = 60 - timePassed;

            if (newTimeLeft > 0) {
                setTimeLeft(newTimeLeft);
            } else {
                setTimeLeft(0);
            }
        } else {
            setTimeLeft(60); // If no saved time, start from 60
            localStorage.setItem("otpTimer", Date.now().toString());
        }
    }, []);

    // Step 2: Start timer only after timeLeft is set
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [timeLeft]);

    // Navigate
    const navigate = useNavigate();
    const {player_name, mobile, type, otp, authType} = location.state || {};
    const otp1Ref = useRef();
    const otp2Ref = useRef();
    const otp3Ref = useRef();
    const otp4Ref = useRef();

    const handleInput = (e, nextRef) => {
        const value = e.target.value;
        if (value.length === 1 && nextRef) {
            nextRef.current.focus();
        }
    };

    // console.log("authType from the login", authType);

    const handleBackspace = (e, prevRef) => {
        if (e.key === "Backspace" && e.target.value === "" && prevRef) {
            prevRef.current.focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").trim();
        if (/^\d{4}$/.test(paste)) {
            otp1Ref.current.value = paste[0];
            otp2Ref.current.value = paste[1];
            otp3Ref.current.value = paste[2];
            otp4Ref.current.value = paste[3];
            otp4Ref.current.focus();
            e.preventDefault();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const otp = otp1Ref.current.value + otp2Ref.current.value + otp3Ref.current.value + otp4Ref.current.value;

        if (otp.length !== 4) {
            setError("Please enter a valid 4-digit OTP.");
            setSuccess("");
            return;
        }
        try {
            const res = await verifyOTP({otp, mobile, type});
            // console.log(res);

            if (res.status === "success") {
                setSuccess("OTP verified successfully! 🎉");
                setError("");
                login(res.token); //  ✨ Update global auth state
                localStorage.removeItem("otpTimer");
                navigate(routes.home); //  ✨ Redirect after login
            } else {
                setError(res.msg || "Invalid OTP.");
                setSuccess("");
            }
        } catch (err) {
            if (err.response?.data?.msg) {
                setError(err.response.data.msg || "Something went wrong while resending OTP.");
            }
            // setError("Something went wrong while verifying OTP.");
            setSuccess("");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            let res;

            if (type === "register") {
                res = await registerUser(player_name, mobile);
            } else if (type === "login") {
                res = await loginUser(mobile);
            }

            if (res?.status === "success") {
                toast.success(`${res.msg}`);
                // setSuccess(res.msg || "OTP resent successfully!");
                setError("");

                // setTimeLeft(60); // 🕒 Restart the timer!
                setTimeLeft(60);
                localStorage.setItem("otpTimer", Date.now().toString());

                if (res.otp) {
                    // alert("Your new OTP is: " + res.otp);
                    toast.success(`Your New OTP: ${res.otp}`);
                }
            } else {
                setError(res?.msg || "Failed to resend OTP.");
            }
        } catch (err) {
            if (err.response?.data?.msg) {
                setError(err.response.data.msg || "Something went wrong while resending OTP.");
            }

            setSuccess("");
            console.error(err);
        }

        otp1Ref.current.value = "";
        otp2Ref.current.value = "";
        otp3Ref.current.value = "";
        otp4Ref.current.value = "";
        otp1Ref.current.focus(); // Focus back to first box
    };

    const formatTime = (seconds) => {
        const min = String(Math.floor(seconds / 60)).padStart(2, "0");
        const sec = String(seconds % 60).padStart(2, "0");
        return `${min}:${sec}`;
    };
    return (
        <section className="container">
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            <div className="pt-3 pb-2">
                <Link to={routes.home}>
                    <div className="logo d-flex justify-content-center mb-2" style={{"max-width": "400px"}}>
                        <img src={Images.Favlogo} alt="Logo" width="50%" style={{objectFit: "contain"}} />
                    </div>
                </Link>
                <div className="p-3">
                    <div className="section-head">
                        <h3 className="title">Enter OTP</h3>

                        {authType == "static_otp" ? (
                            <p className="text-white">
                                Your static OTP is: <strong>1234</strong>.<br /> Please enter it below to verify your
                                account.
                            </p>
                        ) : (
                            <p className="text-white">
                                A 4-digit code has been sent to your mobile number. <br />
                                Enter it below to verify.
                            </p>
                        )}
                    </div>
                    {authType !== "static_otp" && (
                        <p className="text-center text-white">
                            OTP expires in: <strong>{formatTime(timeLeft)}</strong>
                        </p>
                    )}
                    {error && <p className="text-danger">{error}</p>}
                    {success && <p className="text-success">{success}</p>}

                    <form>
                        <div className="d-flex justify-content-center mb-4 otp-page" onPaste={handlePaste}>
                            <input
                                type="text"
                                className="form-control text-center otp-box"
                                maxLength={1}
                                ref={otp1Ref}
                                onChange={(e) => handleInput(e, otp2Ref)}
                                onKeyDown={(e) => handleBackspace(e, null)}
                            />
                            <input
                                type="text"
                                className="form-control text-center otp-box"
                                maxLength={1}
                                ref={otp2Ref}
                                onChange={(e) => handleInput(e, otp3Ref)}
                                onKeyDown={(e) => handleBackspace(e, otp1Ref)}
                            />
                            <input
                                type="text"
                                className="form-control text-center otp-box"
                                maxLength={1}
                                ref={otp3Ref}
                                onChange={(e) => handleInput(e, otp4Ref)}
                                onKeyDown={(e) => handleBackspace(e, otp2Ref)}
                            />
                            <input
                                type="text"
                                className="form-control text-center otp-box"
                                maxLength={1}
                                ref={otp4Ref}
                                onChange={(e) => handleInput(e, null)}
                                onKeyDown={(e) => handleBackspace(e, otp3Ref)}
                            />
                        </div>
                        {/* <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-login w-100 my-3"
            >
              Verify OTP <i className="ri-check-line text-white fs-20" />
            </button> */}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleSubmit}
                            className="btn btn-login w-100 my-3"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                    {authType !== "static_otp" && (
                        <div className="text-center">
                            <p className="text-white">
                                Didn't receive the OTP?{" "}
                                <span
                                    className={`fw-600 ${timeLeft === 0 ? "text-red" : "text-secondary"}`}
                                    style={{cursor: timeLeft === 0 ? "pointer" : "not-allowed"}}
                                    onClick={timeLeft === 0 ? handleResendOTP : null}
                                >
                                    Resend OTP
                                </span>
                            </p>
                        </div>
                    )}

                    {/* <p className="text-center text-white">
            OTP expires in:{" "}
            <strong>
              {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
            </strong>
          </p> */}
                </div>
            </div>
        </section>
    );
};

export default VerifyOTP;
