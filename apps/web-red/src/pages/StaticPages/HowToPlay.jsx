import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyHeader from "../Home/Components/Header/Header";
import Sidebar from "../Home/Components/Header/Sidebar";
import routes from "../../routes/routes";
import { APP_NAME } from "@repo/frontend-core";
import BottomFooter from "../Home/Components/Footer/BottomFooter";
import Footer from "../Home/Components/Footer/Footer";




const HowToPlay = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div style={{ overflowX: "hidden" }}>
      {/* header  */}
      <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {/* header end */}
      {/* <section className="container pt-40 text-white"> */}
      <div className="container-fluid page-body-wrapper">
        {/* Sidebar Nav Starts */}
        <Sidebar />
        {/* Sidebar Nav Ends */}
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="max-1250 mx-auto">
              <div className="h-100 d-flex justify-content-evenly flex-column">
                <div className="pt-3 pb-2 px-2">
                  <div className=" ">
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item text-white">
                          <Link to={routes.home} className="text-white fw-600 ">
                            Home
                          </Link>
                        </li>
                        <li
                          className="breadcrumb-item active  text-white"
                          aria-current="page"
                        >
                          How to play
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
                <section class="privacy-container px-2 m-0">
                  <h1 className="text-white">
                    Responsible Gaming & Player Protection Policy
                  </h1>
                  <p>
                    At <strong>{APP_NAME}.in</strong>, we are committed to
                    promoting responsible gaming and ensuring the safety of our
                    players. Our goal is to raise awareness about problem
                    gambling while providing effective tools for prevention,
                    intervention, and support.
                  </p>
                  <p>
                    Our Responsible Gaming Policy reflects our dedication to
                    reducing the risks associated with gambling and creating a
                    secure, enjoyable experience for every player.
                  </p>

                  <h2>Our Commitment</h2>
                  <p>
                    We strive to make sure that while you enjoy your gaming
                    experience on <strong>{APP_NAME}.in</strong>, you remain
                    fully aware of the potential{" "}
                    <strong>social and financial risks</strong> associated with
                    gambling.
                  </p>
                  <ul>
                    <li>Customer-driven deposit and loss limits.</li>
                    <li>
                      Self-exclusion options available through Customer Support.
                    </li>
                    <li>
                      Links to trusted support organizations such as SICAD,
                      GamCare, and Gambling Therapy.
                    </li>
                    <li>Self-protection and awareness resources.</li>
                    <li>
                      Strong account security measures to prevent underage or
                      unauthorized access.
                    </li>
                  </ul>

                  <h2>Temporary Account Closure / Self-Exclusion</h2>
                  <p>
                    You have the option to restrict access to your account or
                    exclude yourself from playing games temporarily or
                    permanently.
                  </p>
                  <p>
                    <strong>How to apply restrictions:</strong>
                  </p>
                  <ul>
                    <li>
                      Go to <strong>Profile &gt; Player Protection</strong> in
                      your account.
                    </li>
                    {/* <li>
                      Or contact our Customer Support team at{" "}
                      <a href="mailto:support@{APP_NAME}.in">
                        support@{APP_NAME}.in
                      </a>
                      .
                    </li> */}
                  </ul>
                  <p>
                    <strong>Important:</strong>
                  </p>
                  <ul>
                    <li>
                      All account blocking or self-exclusion requests take
                      effect <strong>immediately</strong>.
                    </li>
                    <li>
                      Revoking restrictions may take up to{" "}
                      <strong>7 days</strong> after your request and only once
                      the exclusion period has expired.
                    </li>
                  </ul>

                  <h2>Maintaining Control Over Gambling</h2>
                  <p>
                    While most players enjoy gaming within their limits, some
                    may face challenges. To stay in control:
                  </p>
                  <ul>
                    <li>
                      Treat gambling as <strong>entertainment</strong>, not
                      income.
                    </li>
                    <li>Never chase losses.</li>
                    <li>
                      Track your <strong>time and money</strong> spent.
                    </li>
                    <li>
                      Use the <strong>loss limit</strong> feature in your
                      profile settings.
                    </li>
                    <li>
                      Take breaks or use <strong>self-exclusion</strong> when
                      needed.
                    </li>
                    <li>
                      Reach out to professional organizations if gambling
                      becomes harmful.
                    </li>
                  </ul>
                  <div class="highlight-box text-black">
                    💡 You can monitor your deposits, withdrawals, and bets
                    under <strong>History &gt; Transactions</strong>. If you
                    notice unauthorized activity, contact{" "}
                    <a href="#">
                      support@{APP_NAME}.in
                    </a>{" "}
                    immediately and update your password.
                  </div>

                  <h2>Do You Think You Have a Problem?</h2>
                  <p>
                    If gambling is negatively impacting your life, ask yourself:
                  </p>
                  <ul>
                    <li>Do you skip school/work to gamble?</li>
                    <li>Do you gamble out of boredom?</li>
                    <li>Do you spend long hours gambling alone?</li>
                    <li>Have people criticized your gambling habits?</li>
                    <li>
                      Do you neglect family, friends, or hobbies due to
                      gambling?
                    </li>
                    <li>Have you borrowed or stolen money for gambling?</li>
                    <li>Do you gamble until all your money is gone?</li>
                    <li>Do you chase losses immediately after losing?</li>
                    <li>Do arguments or frustrations push you to gamble?</li>
                    <li>
                      Has gambling led to depression or suicidal thoughts?
                    </li>
                  </ul>
                  <p>
                    👉 If you answered <strong>yes</strong> to several of these
                    questions, we strongly encourage you to seek support from
                    trusted organizations like{" "}
                    <a href="#" target="_blank">
                      GamCare
                    </a>{" "}
                    or{" "}
                    <a href="#" target="_blank">
                      Gambling Therapy
                    </a>
                    .
                  </p>

                  <h2>Underage Gambling Policy</h2>
                  <p>
                    It is strictly prohibited for anyone{" "}
                    <strong>under the age of 18</strong> to register or gamble
                    on
                    <strong>{APP_NAME}.in</strong>.
                  </p>
                  <p>To prevent underage gambling, we enforce:</p>
                  <ul>
                    <li>Age verification checks for all users.</li>
                    <li>
                      Random checks on accounts linked to payment methods.
                    </li>
                    <li>
                      Immediate account closure and forfeiture of winnings for
                      underage users.
                    </li>
                    <li>Possible reporting to authorities for violations.</li>
                  </ul>

                  <h2>Our Promise</h2>
                  <p>
                    At <strong>{APP_NAME}.in</strong>, we are dedicated to
                    providing a safe, fair, and enjoyable gaming environment. We
                    strongly encourage players to stay informed, play
                    responsibly, and seek help if needed.
                  </p>
                  <p>
                    📧 For questions or support, contact us anytime at
                    <a href="mailto:support@{APP_NAME}.in">
                      {" "}
                      support{APP_NAME}.in
                    </a>
                    .
                  </p>
                </section>
              </div>
            </div>
          </div>
          <BottomFooter />
          <div className="h-100 w-100 mb-5"></div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
