// SelectAmount.jsx
import React, {useEffect, useState, useCallback} from "react";
// import { getPortalSettings } from "../../../../API/depositAPI";
import {getPortalSettings} from "@core/api/depositAPI";
// import { CURRENCY_SYMBOL } from "../../../../constants";
import {CURRENCY_SYMBOL} from "@core/constants";

const SelectAmount = ({amount, setAmount, token, onValidityChange}) => {
    const [limits, setLimits] = useState({min: null, max: null});
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const settings = await getPortalSettings("withdraw", token);
                const min = Number(settings?.min_deposit);
                const maxRaw = Number(settings?.max_deposit);

                const minOk = Number.isFinite(min) && min > 0;
                const maxOk = Number.isFinite(maxRaw) && (!minOk || maxRaw > min);

                setLimits({
                    min: minOk ? min : null,
                    max: maxOk ? maxRaw : null,
                });
            } catch {
                setLimits({min: null, max: null});
            }
        })();
    }, [token]);

    const computeValidity = useCallback(() => {
        const num = Number(amount);
        const valid =
            amount !== "" &&
            Number.isFinite(num) &&
            (limits.min == null || num >= limits.min) &&
            (limits.max == null || num <= limits.max);
        onValidityChange?.(valid);
    }, [amount, limits.min, limits.max, onValidityChange]);

    useEffect(() => {
        computeValidity();
    }, [computeValidity]);

    const setErrorIfOutOfRange = (num) => {
        if (!Number.isFinite(num)) {
            setError("Enter a valid number");
            return;
        }
        if (limits.min != null && num < limits.min) {
            setError(`Minimum allowed is ${CURRENCY_SYMBOL} ${limits.min.toLocaleString("en-IN")}`);
            return;
        }
        if (limits.max != null && num > limits.max) {
            setError(`Maximum allowed is ${CURRENCY_SYMBOL} ${limits.max.toLocaleString("en-IN")}`);
            return;
        }
        setError("");
    };

    const handleSelectAmount = (value) => {
        setAmount(String(value));
        setErrorIfOutOfRange(Number(value));
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        setAmount(val);
        if (val === "") return setError("");
        setErrorIfOutOfRange(Number(val));
    };

    const handleAmountBlur = () => {
        const num = Number(amount);
        if (!Number.isFinite(num)) return;

        let v = num;
        if (limits.min != null && v < limits.min) v = limits.min;
        if (limits.max != null && v > limits.max) v = limits.max;

        if (v !== num) setAmount(String(v));
    };

    const showRange = amount !== "" && (limits.min != null || limits.max != null);

    return (
        <div className="card bg_light_grey account_input-textbox-container">
            <div className="card-body py-4 pb-5">
                <h5 className="mb-3">Select Amount</h5>

                <form className="form-control_container" onSubmit={(e) => e.preventDefault()}>
                    <div className="mb-3">
                        <label className="label text-grey" htmlFor="amount-input">
                            Enter the Amount or select the Amount
                        </label>
                        <input
                            required
                            id="amount-input"
                            className={`input ${error ? "is-invalid" : ""}`}
                            type="number"
                            value={amount}
                            min={limits.min ?? undefined}
                            max={limits.max ?? undefined}
                            onChange={handleAmountChange}
                            onBlur={handleAmountBlur}
                            inputMode="numeric"
                            aria-invalid={!!error}
                        />
                    </div>

                    {error && <small className="text-danger d-block mb-2">{error}</small>}

                    {showRange && (
                        <small className="text-danger d-block mb-3">
                            {limits.min != null && limits.max != null ? (
                                ""
                            ) : limits.min != null ? (
                                <>
                                    Minimum: {CURRENCY_SYMBOL} {limits.min.toLocaleString("en-IN")}
                                </>
                            ) : limits.max != null ? (
                                <>
                                    Maximum: {CURRENCY_SYMBOL} {limits.max.toLocaleString("en-IN")}
                                </>
                            ) : null}
                        </small>
                    )}

                    {/* Static quick-picks */}
                    <div className="recharge-amount-container button">
                        {[500, 1500, 500, 1000, 5000].map((amt) => (
                            <button
                                key={amt}
                                type="button"
                                className="btn"
                                onClick={() => handleSelectAmount(amt)}
                                title={`${CURRENCY_SYMBOL} ${amt.toLocaleString("en-IN")}`}
                            >
                                {amt.toLocaleString("en-IN")}
                            </button>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SelectAmount;
