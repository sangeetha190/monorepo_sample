import {useState} from "react";
import StickyHeader from "../Home/Components/Header/Header";
import Sidebar from "../Home/Components/Header/Sidebar";
import routes from "../../routes/routes";
import BottomFooter from "../Home/Components/Footer/BottomFooter";
import Footer from "../Home/Components/Footer/Footer";
import {Link} from "react-router-dom";

function TermsCondition() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Constants based on the Terms document
    const COMPANY_NAME = "Betwise Namibia";
    const WEBSITE_URL = "https://betwise.com.na";
    const MIN_STAKE = "N$10";
    const GOVERNING_LAW = "Republic of Namibia";

    return (
        <div style={{overflowX: "hidden"}}>
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto px-2">
                            <div className="h-100 d-flex justify-content-evenly flex-column">
                                {/* Breadcrumb Section */}
                                <div className="pt-3 pb-2 ">
                                    <div className="breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb">
                                                <li className="breadcrumb-item text-white">
                                                    <Link to={routes.home} className="text-white fw-600 ">
                                                        Home
                                                    </Link>
                                                </li>
                                                <li className="breadcrumb-item active text-white" aria-current="page">
                                                    Terms and Conditions
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>

                                {/* Terms and Conditions Content Section */}
                                <section className="privacy-container px-2 m-0 pt-0">
                                    <h1 className="text-white">Terms & Conditions</h1>

                                    {/* 1) Interpretation & Definitions */}
                                    <h2>1) Interpretation & Definitions</h2>
                                    <ul>
                                        <li>
                                            <strong>Company:</strong> {COMPANY_NAME} (Betwise, “we”, “us”, “our”).
                                        </li>
                                        <li>
                                            <strong>Website/Service:</strong>{" "}
                                            <a href="https://betwise.com.na" target="_blank" rel="noopener noreferrer">
                                                {WEBSITE_URL}
                                            </a>{" "}
                                            and related services.
                                        </li>
                                        <li>
                                            <strong>You/Player:</strong> the natural person who registers and uses the
                                            Service.
                                        </li>
                                        <li>
                                            <strong>Device:</strong> any device that can access the Service.
                                        </li>
                                        <li>
                                            <strong>Account:</strong> your registered Betwise account.
                                        </li>
                                    </ul>

                                    {/* 2) Eligibility & Account */}
                                    <h2>2) Eligibility & Account</h2>
                                    <p>
                                        <strong>18+ only.</strong> Gambling under 18 is prohibited.
                                    </p>
                                    <p>One account per person. Duplicate or shared accounts are not allowed.</p>
                                    <p>You must provide accurate personal details and keep them updated.</p>
                                    <p>
                                        We may require KYC/AML verification at any time (ID, address, source of funds).
                                    </p>

                                    {/* 3) Responsible Play */}
                                    <h2>3) Responsible Play</h2>
                                    <p>
                                        Play within your limits. You may request deposit limits, cool-offs, or
                                        self-exclusion via Support.
                                    </p>
                                    <p>
                                        If you feel your gambling is problematic, please contact Support for help
                                        resources.
                                    </p>

                                    {/* 4) Bet Rules & Limits (Important) */}
                                    <h2>4) Bet Rules & Limits (Important)</h2>
                                    <p>
                                        <strong>Minimum Stake:</strong> The minimum stake is **{MIN_STAKE}** per bet.
                                        Bets below the minimum are invalid and may be voided with the stake returned.
                                    </p>
                                    <p>
                                        <strong>Bet Acceptance:</strong> A bet is accepted only when recorded on our
                                        servers and shown in your bet history.
                                    </p>
                                    <p>
                                        <strong>Payout & Limits:</strong> Payout limits may apply based on stake size,
                                        game, and provider rules. To protect fairness and stop “micro-bet farming”,
                                        small stakes have capped payouts and/or cool-down rules (see Schedule A –
                                        Limits).
                                    </p>
                                    <p>
                                        <strong>Errors:</strong> In case of obvious error (palpable error, technical
                                        fault, or incorrect odds), we may void or re-settle the bet to its correct
                                        terms.
                                    </p>

                                    {/* 5) Fair Play & Anti-Fraud */}
                                    <h2>5) Fair Play & Anti-Fraud</h2>
                                    <p>To protect all players, the following are strictly prohibited:</p>
                                    <ul>
                                        <li>Multiple accounts, identity/KYC mismatch, third-party accounts.</li>
                                        <li>Collusion, syndicate play, arbitrage/manipulation.</li>
                                        <li>Automated/bot/scripted play or device emulation.</li>
                                        <li>Bonus abuse, chip dumping, or attempting to bypass limits.</li>
                                    </ul>
                                    <p>
                                        <strong>Voiding of Bets:</strong> We may void any bet and withhold associated
                                        winnings if we reasonably determine it was placed in breach of these Terms.
                                        Where appropriate, original stakes may be returned. Accounts may be suspended or
                                        closed, and activity may be reported to relevant stakeholders. You may appeal
                                        via Support; we review with logs/evidence.
                                    </p>

                                    {/* 6) Deposits & Withdrawals */}
                                    <h2>6) Deposits & Withdrawals</h2>
                                    <p>
                                        <strong>Payments:</strong> We support EasyPay/Kazang vouchers, FNB eWallet, Bank
                                        Windhoek EasyWallet, and bank transfer (availability may vary).
                                    </p>
                                    <p>
                                        <strong>Withdrawal conditions:</strong>
                                    </p>
                                    <ul>
                                        <li>KYC must be completed before any payout.</li>
                                        <li>We may request Source-of-Funds documents for compliance.</li>
                                        <li>
                                            Payouts are made to the same method/name used for deposits where possible.
                                        </li>
                                        <li>Processing times depend on checks and provider availability.</li>
                                        <li>
                                            We may hold or reverse transactions while a risk review or chargeback/fraud
                                            investigation is in progress.
                                        </li>
                                    </ul>

                                    {/* 7) Promotions & Bonuses */}
                                    <h2>7) Promotions & Bonuses</h2>
                                    <p>Promotions have specific rules (wagering, eligible games, expiry, min stake).</p>
                                    <p>Sub-minimum bets do not qualify for promotions.</p>
                                    <p>
                                        If bonus abuse is suspected, related bets may be voided and the bonus removed.
                                    </p>

                                    {/* 8) Account Security & Privacy */}
                                    <h2>8) Account Security & Privacy</h2>
                                    <p>You are responsible for keeping your credentials secure.</p>
                                    <p>
                                        We process your data according to our{" "}
                                        {/* Assuming routes.pages.privacyPolicy is correct for the link */}
                                        <Link to={routes.pages.privacyPolicy}>Privacy Policy</Link>.
                                    </p>

                                    {/* 9) Suspension & Termination */}
                                    <h2>9) Suspension & Termination</h2>
                                    <p>
                                        We may suspend or terminate your access immediately for breach of these Terms,
                                        fraud/risk concerns, or legal/compliance reasons.
                                    </p>
                                    <p>
                                        Upon termination, your right to use the Service ceases immediately; balances are
                                        handled per applicable law and these Terms.
                                    </p>

                                    {/* 10) Liability */}
                                    <h2>10) Liability</h2>
                                    <p>
                                        The Service is provided “AS IS” and “AS AVAILABLE.” We disclaim all implied
                                        warranties to the fullest extent permitted by law.
                                    </p>
                                    <p>
                                        Our liability is limited to the amount you have paid to us in the 6 months
                                        preceding the claim, or N$2,000 if none. We are not liable for indirect or
                                        consequential losses, save as required by law.
                                    </p>

                                    {/* 11) Governing Law & Disputes */}
                                    <h2>11) Governing Law & Disputes</h2>
                                    <p>These Terms are governed by the laws of the **{GOVERNING_LAW}**.</p>
                                    <p>
                                        If you have a concern, please contact Support first; we aim to resolve disputes
                                        informally. If unresolved, you may escalate per applicable Namibian law.
                                    </p>

                                    {/* 12) Severability & Waiver */}
                                    <h2>12) Severability & Waiver</h2>
                                    <p>If any provision is held invalid, the remaining terms remain in force.</p>
                                    <p>Failure to enforce any right is not a waiver of that right.</p>

                                    {/* 13) Changes to These Terms */}
                                    <h2>13) Changes to These Terms</h2>
                                    <p>
                                        We may modify these Terms from time to time. Material changes will be notified
                                        on the Website; continued use after changes means you accept the new Terms.
                                    </p>

                                    {/* Schedule A - Limits */}
                                    <h2>Schedule A — Limits (to reduce “small-stake farming”)</h2>
                                    <p>
                                        These values are configurable by {COMPANY_NAME} and effective once published on
                                        the Website or Admin notice. If a number below changes in Admin, the latest
                                        published value prevails.
                                    </p>
                                    <ol>
                                        <li>
                                            <strong>Minimum Stake:</strong> {MIN_STAKE} (hard-enforced in UI/API).
                                        </li>
                                        <li>
                                            <strong>Payout Cap for Small Stakes:</strong> For stakes below N$20, the
                                            maximum payout per single bet is capped at [e.g., 150× stake].
                                        </li>
                                        <li>
                                            <strong>Daily Net Win Cap:</strong> [e.g., N$15,000] per account per day.
                                            Additional wins may be settled the next day subject to review.
                                        </li>
                                        <li>
                                            <strong>Big-Win Cool-down:</strong> After a single win $\geq$ [e.g.,
                                            N$5,000], a cool-down of [e.g., 30 minutes] applies for the same game.
                                        </li>
                                        <li>
                                            <strong>Concurrent Small Bets:</strong> Max [e.g., 1–2] concurrent
                                            small-stake bets per round where applicable.
                                        </li>
                                        <li>
                                            <strong>Risk Reviews:</strong> Bets may be temporarily held for review if
                                            risk signals trigger (multiple devices, IP anomalies, velocity, scripting).
                                            Confirmed breaches $\to$ voided bets per Section 5.
                                        </li>
                                    </ol>
                                </section>
                                {/* End Terms and Conditions Content Section */}
                            </div>
                        </div>
                    </div>
                    <BottomFooter />
                    <div className="h-100 w-100 mb-5 px-2"></div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default TermsCondition;
