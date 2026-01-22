import {useState} from "react";
import Footer from "../../../Home/Components/Footer/Footer";
import StickyHeader from "../../../Home/Components/Header/Header";
import Sidebar from "../../../Home/Components/Header/Sidebar";

export default function DepositMethods() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const methods = [
        {
            id: 1,
            title: "EasyPay Voucher (Kazang)",
            img: "/assets/img/footer_icon/1 (1).jpg",
            notice: (
                <div className="text-center my-3">
                    <p style={{fontSize: "20px", fontWeight: "bold", color: "#e4063b"}}>
                        EASYPAY VOUCHER NOW AVAILABLE AT KAZANG RETAILERS{" "}
                        {/* <a
              href="https://play.betwin.co.na/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#e4063b", textDecoration: "underline" }}
            >
              play.betwin.co.na
            </a> */}
                        .
                    </p>
                </div>
            ),
            steps: [
                {
                    title: "Step 1: Purchase an EasyPay Voucher",
                    description: `Visit any participating KAZANG retailer that sells EasyPay Vouchers. Request a voucher for your preferred amount and keep the receipt safe—it contains a unique 16-digit PIN.`,
                },
                {
                    title: "Step 2: Log into Your Account",
                    description: (
                        <>
                            Go to{" "}
                            <a
                                href="https://play.betwin.co.na/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: "#e4063b", textDecoration: "underline"}}
                            >
                                https://play.betwin.co.na/
                            </a>{" "}
                            on your browser and log in with your Username and Password.
                        </>
                    ),
                },
                {
                    title: "Step 3: Navigate to the Deposit Page",
                    description: (
                        <>
                            Once logged in, go to the Deposit section on{" "}
                            <a
                                href="https://play.betwin.co.na/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: "#e4063b", textDecoration: "underline"}}
                            >
                                play.betwin.co.na
                            </a>{" "}
                            and select EasyPay Voucher as your deposit method.
                        </>
                    ),
                },
                {
                    title: "Step 4: Enter Your EasyPay Voucher Details",
                    description: `Input the 16-digit PIN from your voucher and confirm the amount matches the voucher value.`,
                },
                {
                    title: "Step 5: Confirm and Complete Your Deposit",
                    description: (
                        <>
                            Click <strong>Submit</strong> or <strong>Confirm Deposit</strong> to process the
                            transaction. Your{" "}
                            <a
                                href="https://play.betwin.co.na/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: "#e4063b", textDecoration: "underline"}}
                            >
                                play.betwin.co.na
                            </a>{" "}
                            account will be credited instantly or within a few minutes.
                        </>
                    ),
                },
                {
                    title: "Step 6: Start Betting!",
                    description: (
                        <>
                            Once the deposit is successful, start placing bets on your favorite sports or casino games
                            at{" "}
                            <a
                                href="https://play.betwin.co.na/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{color: "#e4063b", textDecoration: "underline"}}
                            >
                                play.betwin.co.na
                            </a>
                            .
                        </>
                    ),
                },
            ],
        },
        {
            id: 2,
            title: "FNB USSD",
            img: "/assets/img/footer_icon/1 (2).jpg",
            notice: (
                <div className="text-center my-3">
                    <p>
                        Did you already make an FNB Ewallet deposit? Please <strong>login</strong> and fill out the
                        deposit confirmation form to let us know you sent money so our banking team can credit your
                        player wallet FAST!
                    </p>
                    <p style={{fontSize: "20px", fontWeight: "bold", color: "#e4063b"}}>
                        To Confirm an FNB eWallet deposit, you must be logged in.
                    </p>
                </div>
            ),
            steps: [
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step01.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step02.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step03.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step04.jpg",
                "/assets/img/pay.png",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step06.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step07.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbussd-step08.jpg",
            ],
        },
        {
            id: 3,
            title: "FNB App",
            img: "/assets/img/footer_icon/1 (3).jpg",
            notice: (
                <div className="text-center my-3">
                    <p>
                        Did you already make an FNB Ewallet deposit? Please <strong>login</strong> and fill out the
                        deposit confirmation form to let us know you sent money so our banking team can credit your
                        player wallet FAST!
                    </p>
                    <p style={{fontSize: "20px", fontWeight: "bold", color: "#e4063b"}}>
                        To Confirm an FNB eWallet deposit, you must be logged in.
                    </p>
                </div>
            ),
            steps: [
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbapp-step01.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbapp-step02.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbapp-step03.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_fnbapp-step04.jpg",
            ],
        },
        {
            id: 4,
            title: "Windhoek Easy Wallet",
            img: "/assets/img/footer_icon/1 (4).jpg",
            notice: (
                <div className="text-center my-3">
                    <p>
                        Did you already make a Bank Windhoek Easy Wallet deposit? Please <strong>login</strong> and fill
                        out the deposit confirmation form to let us know you sent money so our banking team can credit
                        your player wallet FAST!
                    </p>
                    <p style={{fontSize: "20px", fontWeight: "bold", color: "#e4063b"}}>
                        To Confirm a Bank Windhoek Easy Wallet deposit, you must be logged in.
                    </p>
                </div>
            ),
            steps: [
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_windhoek-step01.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_windhoek-step02.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_windhoek-step03.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_windhoek-step04.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_windhoek-step06.jpg",
                "https://m.castlebet.com.na/custom_content/translated/en-EN/img/dep_windhoek-step07.jpg",
            ],
        },
    ];

    const [activeMethod, setActiveMethod] = useState(methods[0].id);

    return (
        <>
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="container py-5">
                            <h3 className="text-center mb-5 fw-600 text-white ">How to Deposit</h3>

                            {/* --- Method Cards --- */}
                            <div className="row g-4 justify-content-center mb-5">
                                {methods.map((method) => (
                                    <div key={method.id} className="col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2 ">
                                        <div
                                            className={`card h-100 text-center border-0 shadow-lg bg-clr ${
                                                activeMethod === method.id ? "border-primary border-3 shadow-lg" : ""
                                            }`}
                                            onClick={() => setActiveMethod(method.id)}
                                            style={{
                                                cursor: "pointer",
                                                transition: "transform 0.3s, box-shadow 0.3s",
                                            }}
                                        >
                                            <img
                                                src={method.img}
                                                className="card-img-top rounded-top p-2"
                                                alt={method.title}
                                                style={{objectFit: "contain"}}
                                            />
                                            <div className="card-body p-2">
                                                <h5 className="card-title mb-0 text-white">{method.title}</h5>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- Notice + Steps --- */}
                            {methods.map(
                                (method) =>
                                    activeMethod === method.id && (
                                        <div key={method.id} className="mb-5 text-white">
                                            {method.notice}

                                            <div className="row g-4">
                                                {method.id === 1 ? (
                                                    <div className="col-12">
                                                        <ol className="list-group list-group-numbered bg-transparent">
                                                            {method.steps.map((step, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="list-group-item bg-dark text-white mb-3 rounded shadow-sm"
                                                                    style={{
                                                                        lineHeight: "1.6",
                                                                        fontSize: "16px",
                                                                        border: "1px solid #333",
                                                                    }}
                                                                >
                                                                    <strong>{step.title}</strong>
                                                                    <p className="mb-0 mt-2">{step.description}</p>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                ) : (
                                                    method.steps.map((img, index) => (
                                                        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                                            <div className="card h-100 bg-dark text-white shadow-sm p-2">
                                                                <div className="position-relative">
                                                                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                                                                        Step {index + 1}
                                                                    </span>
                                                                    <img
                                                                        src={img}
                                                                        alt={`Step ${index + 1}`}
                                                                        className="card-img-top rounded"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
