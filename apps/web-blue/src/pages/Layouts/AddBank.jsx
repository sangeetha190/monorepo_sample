import React, {useState, useEffect, useCallback} from "react";
import axios from "axios";
// import BASE_URL from "../../API/api";
import {BASE_URL} from "@core/api/api";
import {useNavigate} from "react-router-dom";

function AddBank() {
    const [paymentMethod, setPaymentMethod] = useState("2"); // Default: UPI (2), Bank (1)
    const [bankDetails, setBankDetails] = useState({
        payment_method_id: "2", // Default to UPI
        upi_id: "",
        bank_name: "",
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
    });

    const [bankList, setBankList] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Get token from local storage
    const token = localStorage.getItem("token");

    // useEffect(() => {
    //   if (!token) {
    //     alert("Session expired. Please login again.");
    //     navigate("/login");
    //     return;
    //   }
    //   fetchBankDetails();
    // }, []);

    const fetchBankDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/player/get-bank`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            setBankList(response.data.data || []);
        } catch (error) {
            console.error("Error fetching bank details:", error.response?.data || error.message);
            setBankList([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            alert("Session expired. Please login again.");
            navigate("/login");
            return;
        }
        fetchBankDetails();
    }, [token, navigate, fetchBankDetails]);

    const handleChange = (e) => {
        setBankDetails({...bankDetails, [e.target.name]: e.target.value});
    };

    const handlePaymentMethodChange = (e) => {
        const selectedMethod = e.target.value;
        setPaymentMethod(selectedMethod);
        setBankDetails({
            payment_method_id: selectedMethod,
            upi_id: selectedMethod === "2" ? "" : bankDetails.upi_id,
            bank_name: selectedMethod === "1" ? "" : bankDetails.bank_name,
            account_holder_name: selectedMethod === "1" ? "" : bankDetails.account_holder_name,
            account_number: selectedMethod === "1" ? "" : bankDetails.account_number,
            ifsc_code: selectedMethod === "1" ? "" : bankDetails.ifsc_code,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("Unauthorized request. Please login.");
            navigate("/login");
            return;
        }

        try {
            // const response = await axios.post(
            //   `${BASE_URL}/player/store-bank`,
            //   bankDetails,
            //   {
            //     headers: {
            //       Authorization: `Bearer ${token}`,
            //       "Content-Type": "application/json",
            //     },
            //   }
            // );
            const response = await axios.post(`${BASE_URL}/player/store-bank`, bankDetails, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            alert("Payment method added successfully!");
            setBankDetails({
                payment_method_id: paymentMethod,
                upi_id: "",
                bank_name: "",
                account_holder_name: "",
                account_number: "",
                ifsc_code: "",
            });

            fetchBankDetails(); // Refresh the list
        } catch (error) {
            console.error("Error adding payment method:", error.response?.data || error.message);
            // alert(`Failed to add: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div>
            {/* Payment Method Selection */}
            <div className="card bg_light_grey account_input-textbox-container">
                <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                    <h5 className="text-center mb-0">Add Payment Method</h5>
                </div>
                <div className="card-body">
                    <form className="form-control_container" onSubmit={handleSubmit}>
                        {/* Select Payment Method */}
                        <select
                            className="form-select mb-3"
                            value={paymentMethod}
                            onChange={handlePaymentMethodChange}
                            required
                            style={{
                                background: "#202223",
                                color: "#cecdc8",
                                height: "42px",
                            }}
                        >
                            <option value="2">UPI</option>
                            <option value="1">Bank</option>
                        </select>

                        {/* UPI Input Field (Only Show If UPI is Selected) */}
                        {paymentMethod === "2" && (
                            <div className="input-field mb-3">
                                <input
                                    required
                                    className="input"
                                    type="text"
                                    name="upi_id"
                                    value={bankDetails.upi_id}
                                    onChange={handleChange}
                                    placeholder="Enter UPI ID (e.g., test@upi)"
                                />
                                <label className="label">UPI ID</label>
                            </div>
                        )}

                        {/* Bank Details (Only Show If Bank is Selected) */}
                        {paymentMethod === "1" && (
                            <>
                                <select
                                    className="form-select mb-3"
                                    name="bank_name"
                                    value={bankDetails.bank_name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        background: "#202223",
                                        color: "#cecdc8",
                                        height: "42px",
                                    }}
                                >
                                    <option value="">Select Bank Name</option>
                                    <option value="HDFC">HDFC</option>
                                    <option value="ICICI">ICICI</option>
                                    <option value="SBI">SBI</option>
                                </select>
                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="account_holder_name"
                                        value={bankDetails.account_holder_name}
                                        onChange={handleChange}
                                    />
                                    <label className="label">A/C Name</label>
                                </div>
                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="number"
                                        name="account_number"
                                        value={bankDetails.account_number}
                                        onChange={handleChange}
                                    />
                                    <label className="label">A/C No</label>
                                </div>
                                <div className="input-field mb-3">
                                    <input
                                        required
                                        className="input"
                                        type="text"
                                        name="ifsc_code"
                                        value={bankDetails.ifsc_code}
                                        onChange={handleChange}
                                    />
                                    <label className="label">IFSC</label>
                                </div>
                            </>
                        )}

                        <div className="d-flex justify-content-center">
                            <button type="submit" className="btn btn-login w-50 mt-4 mb-3 text-capitalize">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Display Added Payment Methods */}
            <div className="mt-4">
                <h5 className="text-center mb-3">Saved Payment Methods</h5>
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : bankList.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-dark table-bordered text-center">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Payment Method</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bankList.map((bank, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{bank.payment_method_id === "2" ? "UPI" : "Bank"}</td>
                                        <td>
                                            {bank.payment_method_id === "2"
                                                ? bank.upi_id
                                                : `${bank.bank_name} - ${bank.account_number}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center">No payment methods added yet.</p>
                )}
            </div>
        </div>
    );
}

export default AddBank;
