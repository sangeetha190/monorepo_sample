import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CountryRestrict = () => {
  // const handleClose = () => {
  //   window.close(); // Or navigate to another page if needed
  // };

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isRedirected = sessionStorage.getItem("restricted_redirect");

    if (isRedirected === "true") {
      setShowModal(true); // ✅ show modal
      sessionStorage.removeItem("restricted_redirect");
    } else {
      navigate("/"); // ❌ prevent manual access
    }
  }, [navigate]);
  return (
    <div
      className="modal fade show"
      aria-labelledby="countryRestrictLabel"
      aria-modal="true"
      role="dialog"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content text-center"
          style={{
            background: "#1c1c1c",
            border: "none",
            borderRadius: "20px",
            padding: "40px 20px",
            color: "#fff",
          }}
        >
          <div className="d-flex justify-content-center">
            <img
              // src="https://png.pngtree.com/png-vector/20220812/ourmid/pngtree-incorrect-error-3d-icon-png-image_6108006.png"
              src="https://pngimg.com/d/attention_PNG63.png"
              alt="Restricted Icon"
              style={{ width: "80px", marginBottom: "20px" }}
            />
          </div>

          <h4 style={{ fontWeight: "bold", fontSize: "24px" }}>
            Access Denied
          </h4>
          {/* <p style={{ fontSize: "16px", color: "#ccc" }}>
            Sorry, this app is not available in your country.
          </p> */}
          <p style={{ fontSize: "16px", color: "#ccc" }}>
            Unfortunately, this service is not accessible in your region due to
            licensing or regulatory restrictions.
          </p>
          {/* <p style={{ fontSize: "14px", color: "#999" }}>
            We’re working to expand access globally. Stay tuned or check back
            later for updates. 💜
          </p> */}
          {/* <button
            className="btn-close-custom"
            onClick={handleClose}
            style={{
              border: "none",
              background: "#e53935",
              color: "white",
              borderRadius: "50px",
              padding: "10px 30px",
              fontSize: "16px",
              marginTop: "20px",
            }}
          > bbbb
            Close
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CountryRestrict;
