import React, {useState} from "react";
import {Link} from "react-router-dom";
import StickyHeader from "../Home/Components/Header/Header";
import Sidebar from "../Home/Components/Header/Sidebar";
import routes from "../../routes/routes";
import {APP_NAME} from "@repo/frontend-core";
import BottomFooter from "../Home/Components/Footer/BottomFooter";
import Footer from "../Home/Components/Footer/Footer";

function PrivacyPolicy() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div style={{overflowX: "hidden"}}>
            {/* header  */}
            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* header end */}
            {/* <section className="container pt-40 text-white"> */}
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar Nav Starts */}
                <Sidebar />
                {/* Sidebar Nav Ends */}
                <div className="main-panel">
                    <div className="content-wrapper new">
                        <div className="max-1250 mx-auto">
                            <div className="h-100 d-flex justify-content-evenly flex-column">
                                <div className="pt-3 pb-2  px-2">
                                    <div className="breadcrumb mb-0">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb">
                                                <li className="breadcrumb-item text-white">
                                                    <Link to={routes.home} className="text-white fw-600 ">
                                                        Home
                                                    </Link>
                                                </li>
                                                <li className="breadcrumb-item active  text-white" aria-current="page">
                                                    Privacy Policy
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>
                                <section class="privacy-container px-2 pt-0">
                                    <h1 className="text-white">Privacy Policy</h1>

                                    <p>
                                        This Privacy Policy describes Our policies and procedures on the collection, use
                                        and disclosure of Your information when You use the Service and tells You about
                                        Your privacy rights and how the law protects You.
                                    </p>
                                    <div class="highlight-box">
                                        <p>
                                            <strong>
                                                By using our Service, you agree to the collection and use of information
                                                in accordance with this Privacy Policy.
                                            </strong>
                                        </p>
                                    </div>

                                    <h2>Interpretation and Definitions</h2>
                                    <h3>Interpretation</h3>
                                    <p>
                                        Words with the initial letter capitalized have meanings defined under the
                                        following conditions. The following definitions shall apply regardless of
                                        singular or plural usage.
                                    </p>

                                    <h3>Definitions</h3>
                                    <ul>
                                        <li>
                                            <strong>Account:</strong> a unique account created for You to access our
                                            Service.
                                        </li>
                                        <li>
                                            <strong>Affiliate:</strong> an entity under common control or ownership.
                                        </li>
                                        <li>
                                            <strong>Company:</strong> {APP_NAME} (“We”, “Us”, “Our”).
                                        </li>
                                        <li>
                                            <strong>Cookies:</strong> small files stored on Your device to track
                                            browsing activity.
                                        </li>
                                        <li>
                                            <strong>Country:</strong> - .
                                        </li>
                                        <li>
                                            <strong>Device:</strong> any device such as a computer, phone, or tablet.
                                        </li>
                                        <li>
                                            <strong>Personal Data:</strong> information relating to an identified or
                                            identifiable individual.
                                        </li>
                                        <li>
                                            <strong>Service:</strong> the Website.
                                        </li>
                                        <li>
                                            <strong>Website:</strong> {APP_NAME}, accessible from anywhere.
                                            {/* <a href="#">https://{APP_NAME}.in/</a>. */}
                                        </li>
                                        <li>
                                            <strong>You:</strong> the individual using the Service, or a company/legal
                                            entity on whose behalf it is used.
                                        </li>
                                    </ul>

                                    <h2>Collecting and Using Your Personal Data</h2>
                                    <h3>Types of Data Collected</h3>
                                    <h4>1.Personal Data</h4>
                                    <p>We may collect personally identifiable information including:</p>
                                    <ul>
                                        <li>Email address</li>
                                        <li>Usage Data</li>
                                    </ul>

                                    <h4>2.Usage Data</h4>
                                    <p>
                                        Usage Data may include Your IP address, browser type, pages visited, time spent,
                                        device identifiers, and diagnostic data.
                                    </p>

                                    <h2>Tracking Technologies and Cookies</h2>
                                    <p>
                                        We use Cookies and similar tracking technologies for analytics and
                                        functionality:
                                    </p>
                                    <ul>
                                        <li>
                                            <strong>Essential Cookies:</strong> ensure core service features and prevent
                                            fraud.
                                        </li>
                                        <li>
                                            <strong>Notice Acceptance Cookies:</strong> record cookie acceptance.
                                        </li>
                                        <li>
                                            <strong>Functionality Cookies:</strong> remember login details and
                                            preferences.
                                        </li>
                                    </ul>

                                    <h2>Use of Your Personal Data</h2>
                                    <ul>
                                        <li>Provide and maintain the Service</li>
                                        <li>Manage Your Account</li>
                                        <li>Perform contracts and purchases</li>
                                        <li>Contact You via email, SMS, or push notifications</li>
                                        <li>Provide offers, news, and promotions</li>
                                        <li>Analytics and improvements</li>
                                        <li>Business transfers (mergers/acquisitions)</li>
                                    </ul>

                                    <h2>Retention & Transfer of Data</h2>
                                    <p>
                                        We retain Your Personal Data only as long as necessary and may transfer it
                                        securely outside Your jurisdiction with safeguards.
                                    </p>

                                    <h2>Delete Your Personal Data</h2>
                                    <p>
                                        You may request deletion of Your data anytime via account settings or contacting
                                        us directly.
                                    </p>

                                    <h2>Disclosure of Your Personal Data</h2>
                                    <ul>
                                        <li>
                                            <strong>Business Transactions:</strong> in mergers or acquisitions.
                                        </li>
                                        <li>
                                            <strong>Law Enforcement:</strong> when required by law.
                                        </li>
                                        <li>
                                            <strong>Legal Requirements:</strong> to comply, defend, or protect rights.
                                        </li>
                                    </ul>

                                    <h2>Children’s Privacy</h2>
                                    <p>
                                        Our Service does not target children under 13. If data is collected unknowingly,
                                        we will delete it immediately.
                                    </p>

                                    <h2>Changes to this Privacy Policy</h2>
                                    <p>
                                        We may update this policy periodically and notify You via email or a service
                                        notice.
                                    </p>

                                    {/* <h2>Contact Us</h2>
                  <p>If you have questions, contact us:</p>
                  <ul>
                    <li>
                      <strong>Email:</strong> {APP_NAME}@gmail.com
                    </li>
                  </ul> */}
                                </section>
                            </div>
                        </div>
                        <BottomFooter />
                        {/* <div className="h-100 w-100 mb-5"></div> */}
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
