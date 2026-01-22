import React, {useState} from "react";
import WithdrawSelectAmount from "./WithdrawSelectAmount";
import BankDetails from "./BankDetails_Namibia";
import WithdrawAmountRequest from "./WithdrawAmountRequest";
// import StickyHeader from "../../../../layouts/Header/Header";
import StickyHeader from "../../../Home/Components/Header/Header";
// import Sidebar from "../../../../layouts/Header/Sidebar";
import Sidebar from "../../../Home/Components/Header/Sidebar";

const WithdrawIndex = () => {
    const [activeStep, setActiveStep] = useState("step1");
    const [selectedAmount, setSelectedAmount] = useState(""); // 🟣 Add this line
    const [paymentSelectedMethod, setPaymentSelectedMethod] = useState(""); // 🟣 Add this line
    const [selectedBankId, setSelectedBankId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAmountValid, setIsAmountValid] = useState(false);
    const [depositFormData, setDepositFormData] = useState({
        amount: "", // selected in Step 1
        paymentSelectedMethod: "", // selected in Step 2
        utr_number: "",
        payment_screenshot: null,
    });

    const steps = [
        {
            id: "step1",
            icon: "fas fa-folder-open",
            title: "Step 1",
            content: () => (
                <WithdrawSelectAmount
                    amount={selectedAmount}
                    setAmount={setSelectedAmount}
                    count={4}
                    onValidityChange={setIsAmountValid}
                />
            ),
        },
        {
            id: "step2",
            icon: "fas fa-briefcase",
            title: "Step 2",
            content: () => (
                <BankDetails
                    selectedBankId={selectedBankId}
                    setSelectedBankId={setSelectedBankId}
                    paymentSelectedMethod={paymentSelectedMethod}
                    setPaymentSelectedMethod={setPaymentSelectedMethod}
                    formData={depositFormData}
                    setFormData={setDepositFormData}
                />
            ),
        },
        // {
        //   id: "step3",
        //   icon: "fas fa-star",
        //   title: "Step 3",
        //   content: () => (
        //     <WithdrawAmountRequest
        //       amount={selectedAmount}
        //       bankId={selectedBankId}
        //       paymentSelectedMethod={paymentSelectedMethod}
        //     />
        //   ), // 🟣 Pass amount here
        // },

        {
            id: "step3",
            icon: "fas fa-star",
            title: "Step 3",
            content: () => (
                <WithdrawAmountRequest
                    amount={selectedAmount}
                    bankId={selectedBankId} // ✅ this will no longer be null
                    paymentSelectedMethod={paymentSelectedMethod}
                />
            ),
        },
    ];

    const goNext = () => {
        const currentIndex = steps.findIndex((step) => step.id === activeStep);
        if (currentIndex < steps.length - 1) {
            setActiveStep(steps[currentIndex + 1].id);
        }
    };

    const goPrevious = () => {
        const currentIndex = steps.findIndex((step) => step.id === activeStep);
        if (currentIndex > 0) {
            setActiveStep(steps[currentIndex - 1].id);
        }
    };
    return (
        <>
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}

            <section className="container-fluid page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}
                <div className="main-panel overflow-hidden">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                <div className="pt-3 pb-2">
                                    <div className="row px-2">
                                        {/* header Starts */}
                                        <div className="d-flex align-items-center justify-content-between position-relative  px-0">
                                            {/* Back Button on Left */}
                                            <div className="d-flex justify-content-between align-items-center px-2">
                                                <button
                                                    className="go_back_btn bg-grey"
                                                    onClick={() => window.history.back()}
                                                >
                                                    <i className="ri-arrow-left-s-line text-white fs-20" />
                                                </button>
                                            </div>

                                            {/* Centered Title */}
                                            <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16 text-center">
                                                Direct Withdraw / Instant EFT
                                            </h5>
                                        </div>
                                        {/* header Ends */}

                                        {/* test Starts */}
                                        <div className="container mt-4 px-2">
                                            <div className="wizard my-5">
                                                <ul className="nav nav-tabs justify-content-center">
                                                    {steps.map((step, index) => (
                                                        <li
                                                            key={step.id}
                                                            className="nav-item flex-fill"
                                                            role="presentation"
                                                        >
                                                            <span
                                                                className="text-white position-absolute start-50 translate-middle-x"
                                                                style={{top: "-30px"}}
                                                            >
                                                                {step.title}
                                                            </span>

                                                            <a
                                                                href={`#${step.id}`}
                                                                className={`nav-link rounded-circle mx-auto d-flex align-items-center justify-content-center ${
                                                                    activeStep === step.id ? "active" : ""
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    // optional: block jumping ahead without required data
                                                                    if (step.id === "step2" && !selectedAmount) return;
                                                                    if (
                                                                        step.id === "step3" &&
                                                                        (!selectedAmount || !paymentSelectedMethod)
                                                                    )
                                                                        return;
                                                                    setActiveStep(step.id);
                                                                }}
                                                            >
                                                                <i className={step.icon} />
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Navigation Tabs */}

                                                {/* Single Tab Content (keep just this one) */}
                                                <div className="tab-content">
                                                    {steps.map((step, index) => {
                                                        const isActive = activeStep === step.id;

                                                        const hasBack = index > 0;
                                                        const hasNext = index < steps.length - 1;

                                                        const justifyClass =
                                                            hasBack && hasNext
                                                                ? "justify-content-between"
                                                                : hasNext
                                                                ? "justify-content-end" // only Continue → right end
                                                                : "justify-content-start"; // only Back → left start

                                                        const nextDisabled =
                                                            (step.id === "step1" && !selectedAmount) ||
                                                            (step.id === "step2" && !paymentSelectedMethod);

                                                        return (
                                                            <div
                                                                key={step.id}
                                                                className={`tab-pane fade ${
                                                                    isActive ? "show active" : ""
                                                                }`}
                                                                id={step.id}
                                                            >
                                                                {step.content()}

                                                                <div className={`d-flex ${justifyClass} mt-3`}>
                                                                    {hasBack && (
                                                                        <button
                                                                            className="btn btn-secondary previous"
                                                                            onClick={goPrevious}
                                                                        >
                                                                            <i className="fas fa-angle-left" /> Back
                                                                        </button>
                                                                    )}

                                                                    {hasNext && (
                                                                        // <button
                                                                        //   className="btn btn-light next"
                                                                        //   onClick={goNext}
                                                                        //   disabled={nextDisabled}
                                                                        // >
                                                                        //   Continue{" "}
                                                                        //   <i className="fas fa-angle-right" />
                                                                        // </button>

                                                                        <button
                                                                            className="btn btn-light next"
                                                                            onClick={goNext}
                                                                            disabled={
                                                                                (step.id === "step1" &&
                                                                                    !isAmountValid) ||
                                                                                (step.id === "step2" &&
                                                                                    !paymentSelectedMethod)
                                                                            }
                                                                        >
                                                                            Continue{" "}
                                                                            <i className="fas fa-angle-right" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {/* end .tab-content */}
                                            </div>
                                        </div>
                                        {/* test Ends */}
                                        {/* <Footer /> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default WithdrawIndex;
