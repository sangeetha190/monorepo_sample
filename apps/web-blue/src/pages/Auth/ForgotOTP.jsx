import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../routes/routes";
import BASE_URL from "@core/api/baseUrl";

const ForgotOTP = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Handle OTP input
  const handleInput = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        otpRefs[index + 1].current.focus();
      }
    }
  };

  // Handle backspace
  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{4}$/.test(pasteData)) {
      setOtp([...pasteData]);
      otpRefs[3].current.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    const mobile = localStorage.getItem("forgot_mobile");

    if (!mobile) {
      setError("Mobile number missing. Please restart the process.");
      return;
    }

    if (enteredOtp.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/forgot-password-otp-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: enteredOtp }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setSuccess("OTP verified successfully! Redirecting...");
        navigate(routes.auth.newPassword);
        setError("");
      } else {
        setError(data.msg || "Invalid OTP. Please try again.");
        setSuccess("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setSuccess("");
    }
  };
  // Add this inside your ForgotOTP component (above return)

  const handleResendOTP = async () => {
    const mobile = localStorage.getItem("forgot_mobile");

    if (!mobile) {
      setError("Mobile number missing. Please restart the process.");
      setSuccess("");
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/forgot-password-otp-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setSuccess(`OTP resent successfully to ${mobile}`);

        setError("");

        setOtp(["", "", "", ""]); // Optional: Clear the current OTP input

        otpRefs[0].current.focus(); // Focus first box
      } else {
        setError(data.msg || "Failed to resend OTP.");
        setSuccess("");
      }
    } catch (err) {
      setError("Network error while resending OTP.");
      setSuccess("");
    }
  };

  return (
    <section className="container black-red">
      <div className="pt-3 pb-2 card-log">
        {/* <div className="logo d-flex justify-content-center mb-2">
          <img src="assets/img/fav.png" alt="favicon" width="75%" />
        </div> */}
        <div className="">
          <div className="section-head">
            <h3 className="title text-black">Enter OTP</h3>
            <p className="text-gray">
              A 4-digit code has been sent to your mobile number. Enter it below
              to verify.
            </p>
          </div>

          {error && <p className="text-danger text-center">{error}</p>}
          {success && <p className="text-success text-center">{success}</p>}

          <form>
            <div
              className="d-flex justify-content-center mb-4 otp-page"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  className="form-control text-center otp-box text-dark"
                  maxLength={1}
                  value={digit}
                  ref={otpRefs[index]}
                  onChange={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-login w-100 my-3"
            >
              Verify OTP <i className="ri-check-line text-white fs-20 ms-2" />
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray">
              Didn't receive the OTP?{" "}
              <span
                className="text-red fw-600"
                style={{ cursor: "pointer" }}
                onClick={handleResendOTP}
              >
                Resend OTP
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotOTP;
