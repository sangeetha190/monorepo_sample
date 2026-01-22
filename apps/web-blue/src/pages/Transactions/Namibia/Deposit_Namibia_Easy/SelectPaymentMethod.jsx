import {useContext, useEffect, useRef, useState} from "react";
// import AuthContext from "../../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import {toast, ToastContainer} from "react-toastify";
// import {getDepositMethodsNamibiaEasywallet} from "../../../../../API/depositAPI";
import {getDepositMethodsNamibiaEasywallet} from "@core/api/depositAPI";

const SelectPaymentMethod = ({setPaymentSelectedMethod}) => {
    const {user} = useContext(AuthContext);
    const token = user?.token;

    const [details, setDetails] = useState(null);
    const [methodsLoading, setMethodsLoading] = useState(false);
    const [error, setError] = useState(null);

    // copy refs + flags
    const inputRef1 = useRef(null); // holder
    const inputRef2 = useRef(null); // bank name
    const [copied1, setCopied1] = useState(false);
    const [copied2, setCopied2] = useState(false);

    const handleCopy = async (ref, setCopied) => {
        if (!ref?.current) return;
        const text = ref.current.value ?? "";
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            // console.error("Clipboard failed", e);
            toast.error("Copy failed. Try manually.");
        }
    };

    useEffect(() => {
        if (!token) return;
        let alive = true;
        (async () => {
            setMethodsLoading(true);
            setError(null);
            try {
                const res = await getDepositMethodsNamibiaEasywallet(token);
                // Accept either an object or an array from API
                const data = Array.isArray(res) ? res[0] : res;

                if (!data || typeof data !== "object") {
                    throw new Error("Invalid payment details format");
                }

                if (alive) {
                    setDetails(data);
                    // Push label up to parent (optional)
                    setPaymentSelectedMethod?.(data.id);
                }
            } catch (err) {
                // console.error(err);
                if (alive) {
                    const msg = err?.message || "Failed to load payment methods";
                    setError(msg);
                    toast.error(msg, {toastId: "deposit-method-error"});
                }
            } finally {
                if (alive) setMethodsLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [token, setPaymentSelectedMethod]);

    if (methodsLoading) {
        return (
            <div className="bg_light_grey rounded-2 py-3">
                <div className="mx-3">
                    <h5 className="mb-3">Select Payment Method</h5>
                    <p>Loading payment methods...</p>
                </div>
                <ToastContainer position="top-right" autoClose={5000} theme="dark" className="success-toaster my-3" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg_light_grey rounded-2 py-3">
                <div className="mx-3">
                    <h5 className="mb-3">Select Payment Method</h5>
                    <p className="text-danger">{error}</p>
                </div>
                <ToastContainer position="top-right" autoClose={5000} theme="dark" className="success-toaster my-3" />
            </div>
        );
    }

    if (!details) return null;

    const {phone_number, name} = details;

    return (
        <div className="bg_light_grey rounded-2 py-3">
            <div className="mx-3">
                <h5 className="mb-3">Ewallet Details</h5>
            </div>

            <div className="tab-content mt-3" id="myTabContent">
                <div>
                    <div className="card account_input-textbox-container border-0">
                        <div className="card-body pt-0 py-0">
                            {/* <h5 className="text-center mb-0">Ewallet Details</h5> */}

                            <div className="form-control_container">
                                {/* Account Holder Name */}
                                <div className="input-field mb-3 position-relative">
                                    <label className="text_grey_color">Phone Number</label>
                                    <input
                                        required
                                        className="input mt-1"
                                        type="text"
                                        value={phone_number || ""}
                                        readOnly
                                        ref={inputRef1}
                                    />
                                    <div
                                        className="position-absolute copy-text"
                                        style={{
                                            right: 10,
                                            top: "69%",
                                            transform: "translateY(-50%)",
                                        }}
                                    >
                                        <button type="button" onClick={() => handleCopy(inputRef1, setCopied1)}>
                                            <i className="fa-solid fa-copy text-white fs-5"></i>
                                        </button>
                                        {copied1 && <span className="copied-tooltip">Copied</span>}
                                    </div>
                                </div>

                                {/* Bank Name */}
                                <div className="input-field mb-3 position-relative">
                                    <label className="text_grey_color">Name</label>
                                    <input
                                        required
                                        className="input mt-1"
                                        type="text"
                                        value={name || ""}
                                        readOnly
                                        ref={inputRef2}
                                    />
                                    <div
                                        className="position-absolute copy-text"
                                        style={{
                                            right: 10,
                                            top: "69%",
                                            transform: "translateY(-50%)",
                                        }}
                                    >
                                        <button type="button" onClick={() => handleCopy(inputRef2, setCopied2)}>
                                            <i className="fa-solid fa-copy text-white fs-5"></i>
                                        </button>
                                        {copied2 && <span className="copied-tooltip">Copied</span>}
                                    </div>
                                </div>
                            </div>

                            <small className="text-muted">
                                After transfer, upload the payment screenshot and reference/UTR number in the next step.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={5000} theme="dark" className="success-toaster my-3" />
        </div>
    );
};

export default SelectPaymentMethod;
