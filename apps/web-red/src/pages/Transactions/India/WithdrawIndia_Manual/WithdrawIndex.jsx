import React, { useState } from "react";
import WithdrawSelectAmount from "./WithdrawSelectAmount";
import BankDetails from "./BankDetailsIndia";
import WithdrawAmountRequest from "./WithdrawAmountRequest";
import StickyHeader from "../../../../layouts/Header/Header";
import Sidebar from "../../../../layouts/Header/Sidebar";

const WithdrawIndex = () => {
  const [activeStep, setActiveStep] = useState("step1");
  const [selectedAmount, setSelectedAmount] = useState(""); // 🟣 Add this line
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        />
      ),
    },
    {
      id: "step3",
      icon: "fas fa-star",
      title: "Step 3",
      content: () => (
        <WithdrawAmountRequest
          amount={selectedAmount}
          bankId={selectedBankId}
        />
      ), // 🟣 Pass amount here
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
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="max-1250 mx-auto">
              <div className="h-100">
                <div className="pt-3 pb-2">
                  <div className="row px-2">
                    {/* <div className="d-flex justify-content-between align-items-center px-0 ">
                <button
                  className="go_back_btn"
                  onClick={() => window.history.back()}
                >
                  <i className="ri-arrow-left-s-line text-white fs-24" />
                </button>
              </div> */}
                    {/* header Starts */}
                    <div className="d-flex align-items-center justify-content-between position-relative  px-0">
                      {/* Back Button on Left */}
                      <div className="d-flex justify-content-between align-items-center px-0">
                        <button
                          className="go_back_btn bg-grey"
                          onClick={() => window.history.back()}
                        >
                          <i className="ri-arrow-left-s-line text-white fs-20" />
                        </button>
                      </div>

                      {/* Centered Title */}
                      <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16">
                        Manual Withdraw India
                      </h5>
                    </div>
                    {/* header Ends */}

                    {/* test Starts */}
                    <div className="container mt-4 px-0">
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
                                style={{ top: "-30px" }}
                              >
                                {step.title}
                              </span>

                              <a
                                className={`nav-link rounded-circle mx-auto d-flex align-items-center justify-content-center ${
                                  activeStep === step.id ? "active" : ""
                                }`}
                                href={`#${step.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveStep(step.id);
                                }}
                              >
                                <i className={step.icon}></i>
                              </a>
                            </li>
                          ))}
                        </ul>

                        {/* Navigation Tabs */}
                        <div className="tab-content">
                          {steps.map((step, index) => (
                            <div
                              key={step.id}
                              className={`tab-pane fade ${
                                activeStep === step.id ? "show active" : ""
                              }`}
                              id={step.id}
                            >
                              {step.content()} {/* ✅ FIX: Call the function */}
                            </div>
                          ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                          {steps.map((step, index) => (
                            <div
                              key={step.id}
                              className={`tab-pane fade ${
                                activeStep === step.id ? "show active" : ""
                              }`}
                              id={step.id}
                            >
                              <p>{step.content}</p>
                              <div className="d-flex justify-content-between">
                                {index > 0 && (
                                  <button
                                    className="btn btn-secondary previous"
                                    onClick={goPrevious}
                                  >
                                    <i className="fas fa-angle-left"></i> Back
                                  </button>
                                )}
                                {index < steps.length - 1 ? (
                                  <button
                                    className="btn btn-light next"
                                    onClick={goNext}
                                  >
                                    Continue{" "}
                                    <i className="fas fa-angle-right"></i>
                                  </button>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
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
