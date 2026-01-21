import React, { useEffect, useState } from "react";
import BASE_URL from "../../../API/api";
import axios from "axios";
import BottomFooter from "../../layouts/footer/BottomFooter";
import Footer from "../../layouts/footer/Footer";

function Withdraw() {
  const [bankDetails, setbankDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    const fetchWithdrawHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/player/get-bank`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log(response.data);

        // console.log(response.data.withdrawHistory)

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.playerBank)
        ) {
          setbankDetails(response.data.playerBank);
        } else {
          setError(response.data.msg || "Failed to load withdraw history.");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawHistory();
  }, []);

  // Toggle Bank Status
  const toggleBankStatus = async (bank_id, currentStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    const newStatus = currentStatus === "1" ? "0" : "1"; // Toggle status
    const payload = {
      bank_id: bank_id, // Ensure correct key name
      status: newStatus, // Ensure correct value
    };

    // console.log("Sending payload:", payload);

    try {
      // const response = await axios.get(
      //   `${BASE_URL}/player/change-bank-status`,
      //   payload,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      const response = await axios.get(
        `${BASE_URL}/player/change-bank-status`,
        {
          params: { bank_id, status: newStatus }, // <-- Pass data as query parameters
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log("API Response:", response.data);

      if (response.data.status === "success") {
        setbankDetails((prevDetails) =>
          prevDetails.map((bank) =>
            bank.id === bank_id ? { ...bank, status: newStatus } : bank
          )
        );
      } else {
        alert(response.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(
        "API Error:",
        err.response ? err.response.data : err.message
      );
      alert(
        `Error: ${
          err.response ? err.response.data.message : "Failed to update status"
        }`
      );
    }
  };

  return (
    <div>
      {/* hedaer-end */}
      <section className="container vh-100 pt-30">
        <div className="h-100">
          {/* ======================================================================= */}
          {/* 2 button starts */}

          {/* 2 button Ends */}
          {/* Header 2 buttons Starts */}
          <div className="pt-3 pb-2">
            <div className="container-fluid p-0">
              <h5 className="mb-3">Select Payment Method</h5>
              <nav className="nav nav-pills d-flex justify-content-between tab_red_active">
                <button
                  className="nav-link btn-color text-white active w-150"
                  id="upi-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#Bank_details"
                  type="button"
                  role="tab"
                  aria-controls="Bank_details"
                  aria-selected="true"
                >
                  <img
                    src="assets/img/icons/add_account.png"
                    alt="add_account"
                    width="22px"
                  />
                  Bank Details
                </button>
                <button
                  className="nav-link btn-color text-white w-150"
                  id="profile-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#profile"
                  type="button"
                  role="tab"
                  aria-controls="profile"
                  aria-selected="false"
                >
                  <img
                    src="assets/img/icons/add_account.png"
                    alt="add_account"
                    width="22px"
                  />
                  Add Bank
                </button>
              </nav>
              <div className="tab-content mt-3" id="myTabContent">
                {/* tab 1 */}
                <div
                  className="tab-pane fade show active"
                  id="Bank_details"
                  role="tabpanel"
                  aria-labelledby="upi-tab"
                >
                  {/* Select Amount Starts */}
                  <div className="card bg_light_grey account_input-textbox-container mt-3">
                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                      <h5 className="text-center mb-0">Select Amount</h5>
                    </div>
                    <div className="card-body">
                      <form className="form-control_container" action>
                        <div className="input-field mb-3">
                          <input required className="input" type="number" />
                          <label className="label" htmlFor="input">
                            Enter the Amount
                          </label>
                        </div>
                        <div className="recharge-amount-container button">
                          <button type="button" className="btn">
                            10
                          </button>
                          <button type="button" className="btn">
                            20
                          </button>
                          <button type="button" className="btn">
                            50
                          </button>
                          <button type="button" className="btn">
                            100
                          </button>
                          <button type="button" className="btn">
                            1000
                          </button>
                          <button type="button" className="btn">
                            10000
                          </button>
                          <button type="button" className="btn">
                            100
                          </button>
                          <button type="button" className="btn">
                            1000
                          </button>
                          <button type="button" className="btn">
                            10000
                          </button>
                        </div>
                        <div className="d-flex justify-content-center">
                          <button
                            type="button"
                            className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                          >
                            Sumbit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  {/* Select Amount Ends */}
                  {/* card 1 Starts */}
                  <div className="card bg_light_grey br-grey account_input-textbox-container my-3">
                    {/* <div
              class="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center"
            >
              <h5 class="text-center mb-0">Added Bank Details</h5>
            </div> */}
                    <div className="card-body p-2">
                      {/*  Details Starts */}
                      <div className>
                        {loading ? (
                          <p className="text-white">Loading...</p>
                        ) : error ? (
                          <p className="text-danger">{error}</p>
                        ) : bankDetails.length > 0 ? (
                          bankDetails.map((bank) => (
                            <div className="bet-card" key={bank.id}>
                              {/* card 1 Starts */}
                              <div className="d-flex justify-content-between border rounded mt-2 py-2 px-2">
                                <div className="d-flex">
                                  {/* input icon starts */}
                                  <div className="px-2 py-1">
                                    <div className="form-check px-3">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="flexRadioDefault"
                                        id="flexRadioDefault1"
                                      />
                                    </div>
                                  </div>
                                  {/* bank Details Starts */}
                                  <div>
                                    {/* <div>
                                <p className="mb-0 text-grey">Bank Name</p>
                                <h6>{bank.bank_name || "N/A"}</h6>
                              </div>
                              <div>
                                <p className="mb-0 text-grey">Account Holder:</p>
                                <h6> {bank.account_holder_name || "N/A"}</h6>
                              </div>
                              <div>
                                <p className="mb-0 text-grey">Account Number:</p>
                                <h6>{bank.account_number || "N/A"}</h6>
                              </div>
                              <div>
                                <p className="mb-0 text-grey">IFSC Code</p>
                                <h6>{bank.ifsc_code || "N/A"}</h6>
                              </div> */}

                                    <h6>
                                      Payment Method:{" "}
                                      {bank.payment_method?.name || "N/A"}
                                    </h6>
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
                                            {" "}
                                            {bank.account_holder_name || "N/A"}
                                          </h6>
                                        </div>
                                        <div>
                                          <p className="mb-0 text-grey">
                                            Account Number:
                                          </p>
                                          <h6>
                                            {bank.account_number || "N/A"}
                                          </h6>
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
                                <div className>
                                  {/* <i class="ri-edit-box-fill fs-1 text-blue"></i> */}
                                  {/* <i
                              className="ri-file-edit-line fs-1 text-white"
                              data-bs-toggle="modal"
                              data-bs-target="#Edit_bank_pop_up"
                            />
                            <i
                              className="ri-delete-bin-6-fill fs-1 text-danger"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_pop_up"
                            /> */}

                                  {/* Status Button */}
                                  <button
                                    className={`btn ${
                                      bank.status === "1"
                                        ? "btn-success"
                                        : "btn-danger"
                                    }`}
                                    onClick={() =>
                                      toggleBankStatus(bank.id, bank.status)
                                    }
                                  >
                                    {bank.status === "1"
                                      ? "Active"
                                      : "Inactive"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-white">
                            No Withdraw History Found
                          </p>
                        )}
                      </div>
                      {/*  Details ends */}

                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                        >
                          Processed
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Card 1 Ends */}
                  {/* card 3 Starts */}
                  <div
                    className="card bg-transparent account_input-textbox-container mt-3"
                    style={{ "margin-bottom": "20px" }}
                  >
                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                      <h5 className="text-center mb-0">Rules</h5>
                    </div>
                    <div
                      className="card-body"
                      style={{ border: "1px solid white" }}
                    >
                      <ul className="list-unstyled">
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          Transfer the amount through our safe payment gateway
                        </li>
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          The amount will be deposited to your account intantly
                        </li>
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          Transfer the amount through our safe payment gateway
                        </li>
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          Transfer the amount through our safe payment gateway
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* card 3 Starts */}
                </div>
                {/* tab 2 */}
                <div
                  className="tab-pane fade"
                  id="profile"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                >
                  {/* card 2*/}
                  <div className="card bg_light_grey account_input-textbox-container">
                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                      <h5 className="text-center mb-0">Bank Details</h5>
                    </div>
                    <div className="card-body">
                      <form className="form-control_container" action>
                        <select
                          className="form-select mb-3"
                          aria-label="Default select example"
                          style={{
                            background: "#202223",
                            color: "#cecdc8",
                            height: "42px",
                          }}
                        >
                          <option selected>Select Bank Name</option>
                          <option value={1}>One</option>
                          <option value={2}>Two</option>
                          <option value={3}>Three</option>
                        </select>
                        <div className="input-field mb-3">
                          <input required className="input" type="text" />
                          <label className="label" htmlFor="input">
                            A/C Name
                          </label>
                        </div>
                        <div className="input-field mb-3">
                          <input required className="input" type="number" />
                          <label className="label" htmlFor="input">
                            A/C No
                          </label>
                        </div>
                        <div className="input-field mb-3">
                          <input required className="input" type="number" />
                          <label className="label" htmlFor="input">
                            IFSC
                          </label>
                        </div>
                        <div className="d-flex justify-content-center">
                          <button
                            type="button"
                            className="btn btn-login w-50 mt-4 mb-3 text-capitalize"
                          >
                            Add
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  {/* card 2*/}
                  {/* card 3 Starts */}
                  <div className="card bg-transparent account_input-textbox-container mt-3">
                    <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                      <h5 className="text-center mb-0">Rules</h5>
                    </div>
                    <div
                      className="card-body"
                      style={{ border: "1px solid white" }}
                    >
                      <ul className="list-unstyled">
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          Transfer the amount through our safe payment gateway
                        </li>
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          The amount will be deposited to your account intantly
                        </li>
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          Transfer the amount through our safe payment gateway
                        </li>
                        <li className="text-white fs-14 mb-2">
                          <img
                            src="assets/img/icons/tick.png"
                            alt="tick"
                            width="20px"
                          />
                          Transfer the amount through our safe payment gateway
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* card 3 Starts */}
                </div>
              </div>

              <BottomFooter />
              <Footer />
            </div>
          </div>

          {/* Header  Ends */}
        </div>
      </section>
    </div>
  );
}

export default Withdraw;
