import React, {useContext, useState} from "react";
import {Link, Links, useNavigate} from "react-router-dom";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import routes from "../routes/route";
import routes from "../../routes/routes";
import {toast, ToastContainer} from "react-toastify";
// import {verifyToken} from "../../API/authAPI";
import {verifyToken} from "@core/api/authAPI";
// import BASE_URL from "../../API/api";
import BASE_URL from "@core/api/baseUrl";

import axios from "axios";
const AccountDashboard = () => {
    const [loading, setLoading] = useState(false);

    const {profile, isLoading, logout, authType, user, avatar, portalSettings, loginVerify, setAvatar, portalAllData} =
        useContext(AuthContext);
    const [displayName, setDisplayName] = useState(avatar?.displayName || "");
    const navigate = useNavigate();
    // useNavigate hook for redirection
    if (isLoading || loginVerify === null) return <p>Loading account settings...</p>;
    // console.log("authType", authType, profile, avatar);
    // console.log("avatar", avatar);
    // console.log("profile==============", profile);
    // console.log("loginVerify==============", loginVerify);
    // console.log("authType==============", authType);
    // console.log("user==============", user);
    // console.log("portalAllData==============", portalAllData);

    // const handleSecureRoute = async (route) => {
    //   const token = user?.token;
    //   if (!token) {
    //     toast.error("Session expired.");
    //     logout(navigate);
    //     return;
    //   }

    //   setLoading(true);
    //   try {
    //     const res = await verifyToken(token);
    //     if (res.status === "success") {
    //       navigate(route);
    //     } else {
    //       toast.error("Invalid session.");
    //       logout(navigate);
    //     }
    //   } catch {
    //     toast.error("Token check failed.");
    //     logout(navigate);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // Update
    const handleUpdateName = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        // if (!token) {
        //   toast.error("Login session expired.");
        //   return;
        // }

        try {
            const response = await axios.get(`${BASE_URL}/player/update-profile`, {
                params: {displayName},
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status === "success") {
                toast.success("Name updated successfully!");

                // ✅ Reactively update avatar name
                setAvatar((prev) => ({
                    ...prev,
                    displayName: displayName,
                }));

                // ✅ Close modal
                const modalElement = document.getElementById("Edit_bank_pop_up");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
            } else {
                toast.error(response.data.message || "Update failed.");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Something went wrong.");
        }
    };
    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />
            <div>
                <div className="container position-relative" style={{left: 0}}>
                    <div className="offcanvas-header py-3">
                        {/* Back Button */}

                        <Link to={routes.home}>
                            <div>
                                {/* Navigates back */}
                                <div className="back_icon">
                                    <i className="ri-arrow-left-s-line text-white" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="h-25 w-100 bg-red-gradient position-absolute" style={{left: 0, top: 0}}></div>
                    <div className="offcanvas-body overflow-hidden">
                        <div className="text-white mt-3 pt-5 d-flex align-items-center mb-3">
                            {/* <Link to={routes.profile.avatar}>
                <div className="pe-2">
                  <img src="assets/img/icons/man.png" alt="profile_icon" />
                  <img src={avatar?.image} alt={avatar?.displayName} />
                </div>
              </Link> */}
                            <Link to={routes.profile.avatar}>
                                <div className="pe-2">
                                    <img
                                        src={
                                            // string URL on user.avatar
                                            (typeof user?.avatar === "string" && user.avatar) ||
                                            // object form: { image: "..." }
                                            user?.avatar?.image ||
                                            // fallback in /public
                                            "/assets/img/icons/man.png"
                                        }
                                        alt={user?.avatar?.name || "Profile"}
                                        className="w-100"
                                        style={{
                                            borderRadius: "10%",
                                            width: 36,
                                            height: 36,
                                            objectFit: "cover",
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/assets/img/icons/man.png";
                                        }}
                                    />
                                </div>
                            </Link>
                            <div data-bs-toggle="modal" data-bs-target="#Edit_bank_pop_up">
                                <h4 className="mb-0">{avatar?.displayName || avatar?.playername}</h4>
                                <h5>
                                    {/* <span className="text-grey fs-14">
                    {avatar?.chips}
                  </span> */}
                                    {/* <span className="text-grey fs-14">ID: {profile?.id}</span> */}
                                    <span className="text-grey fs-14"> {avatar?.playername}</span>
                                </h5>
                            </div>
                            <div className="ms-auto" data-bs-toggle="modal" data-bs-target="#Edit_bank_pop_up">
                                <i className="ri-arrow-right-s-line text-white fs-20" />
                            </div>
                        </div>

                        {/* Total Balance */}
                        <div className="d-flex justify-content-between">
                            <div>
                                <h5 className="mb-0">
                                    <img src="assets/img/footer/coins.png" alt="money" width="30px" /> Total Balance
                                </h5>
                            </div>
                            <div>
                                <h4>{profile?.chips}</h4>
                            </div>
                        </div>

                        {/* Deposit & Withdraw Buttons */}
                        <div className="card bg_light_grey account_input-textbox-container mt-3">
                            <div className="card-body px-2">
                                <div className="bonus_bottom_btn">
                                    {/* <Link to={routes.transactions.deposit} className="w-100"> */}
                                    {portalSettings?.auto_deposit === 1 ? (
                                        <button
                                            className="btn btn-outline-light w-100"
                                            onClick={() => navigate(routes.transactions.paymentMethod)}
                                            // onClick={() =>
                                            //   handleSecureRoute(routes.transactions.deposit)
                                            // }
                                        >
                                            Deposit
                                        </button>
                                    ) : (
                                        ""
                                    )}

                                    {portalSettings?.auto_withdraw === 1 ? (
                                        <button
                                            className="btn btn-outline-light w-100"
                                            // onClick={() =>
                                            //   handleSecureRoute(routes.transactions.withdraw)
                                            // }
                                            onClick={() => navigate(routes.transactions.withdrawMethod)}
                                        >
                                            Withdraw
                                        </button>
                                    ) : (
                                        ""
                                    )}
                                </div>

                                {/* Icons Section */}

                                <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
                                    <div
                                        className="text-center"
                                        // onClick={() =>
                                        //   handleSecureRoute(routes.transactions.depositHistory)
                                        // }
                                        onClick={() => navigate(routes.transactions.all_depositHistory)}
                                    >
                                        <img src="assets/img/icons/rupee_2.png" alt="deposit" width="27px" />
                                        <p className="mb-0 small">Deposit History</p>
                                    </div>

                                    <div
                                        className="text-center"
                                        onClick={() => navigate(routes.transactions.all_withdrawHistory)}
                                        // onClick={() =>
                                        //   handleSecureRoute(routes.transactions.withdrawHistory)
                                        // }
                                    >
                                        <img src="assets/img/icons/rupee_2.png" alt="withdraw" width="27px" />
                                        <p className="mb-0 small">Withdraw History</p>
                                    </div>
                                    <div
                                        className="text-center"
                                        onClick={() => navigate(routes.games.history)}
                                        // onClick={() => handleSecureRoute(routes.games.history)}
                                    >
                                        <img src="assets/img/icons/history.png" alt="bet_history" width="27px" />
                                        <p className="mb-0 small"> Transaction History</p>
                                    </div>
                                    {/* <div
                    className="text-center"
                    onClick={() => navigate(routes.games.bonus)}
                  >
                    <img
                      src="assets/img/icons/gift.png"
                      alt="bonus"
                      width="27px"
                    />
                    <p className="mb-0 small">Get Bonus</p>
                  </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Referral & Earn */}
                        {/* <div className="card bg_light_grey account_input-textbox-container mt-3">
              <div className="card-body px-3">
                <div className="d-flex justify-content-between align-items-center referral_earn_box">
                  <div>
                    <img
                      src="https://static.vecteezy.com/system/resources/thumbnails/035/566/895/small/red-gift-box-and-gold-ribbon-chinese-new-year-elements-icon-3d-rendering-png.png"
                      alt="gift"
                      width="80px"
                    />
                  </div>
                  <div className="w-100">
                    <p className="font-semibold text-white">
                      <span>Referral &amp; get 500 + 25% reward</span>
                    </p>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        className="input2"
                        defaultValue="https://jiboomba.com"
                        readOnly
                      />
                      <button className="Subscribe-btn">Copy</button>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

                        {/* Notification & Other Options */}
                        <div className="card bg_light_grey account_input-textbox-container mt-3">
                            <div className="card-body px-3 pt-0">
                                {/* <Link to={routes.games.bonus}>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="mb-0 fs-16">
                      <i className="fa-solid fa-gift pe-2" /> Get Bonus
                    </p>
                    <i className="ri-arrow-right-s-line text-white" />
                  </div>
                </Link> */}
                                {/* <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0 fs-16">
                    <i className="ri-group-fill pe-2" /> Notification
                  </p>
                  <i className="ri-arrow-right-s-line text-white" />
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0 fs-16">
                    <i className="ri-group-fill pe-2" /> Refer and Earn
                  </p>
                  <i className="ri-arrow-right-s-line text-white" />
                </div> */}

                                {/* <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="mb-0 fs-16">
                    <i className="ri-chat-unread-fill pe-2" /> Chat
                  </p>
                  <i className="ri-arrow-right-s-line text-white" />
                </div> */}

                                {/* {authType === "default" && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Link to={routes.profile.changePassword}>
                      <p className="mb-0 fs-16">
                        <i className="ri-lock-fill pe-2" /> Change Password
                      </p>
                    </Link>
                    <i className="ri-arrow-right-s-line text-white" />
                  </div>
                )} */}
                                {/* {authType.type == "default" ? ( */}
                                <Link to={routes.profile.changePassword}>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <p className="mb-0 fs-16">
                                            <i className="ri-lock-fill pe-2" /> Change Password
                                        </p>
                                        <i className="ri-arrow-right-s-line text-white" />
                                    </div>
                                </Link>
                                {/* ) : authType === null ? (
                  <p className="text-white fs-14">Checking login type...</p>
                ) : null} */}
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="d-flex justify-content-center align-items-center white mt-3">
                            <p className="fs-17" onClick={() => logout(navigate)}>
                                <img
                                    src="assets/img/icons/sign-out.png"
                                    alt="sign_Out_image"
                                    width="25px"
                                    className="pe-2"
                                />
                                Sign Out
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <div
                    className="modal fade"
                    id="Edit_bank_pop_up"
                    tabIndex={-1}
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered Edit_bank_pop_up">
                        <div className="modal-content" style={{backgroundColor: "#2a2a2a"}}>
                            <div className="modal-header">
                                <h2 className="modal-title fs-5 py-2" id="exampleModalLabel">
                                    Edit Profile Details
                                </h2>
                                <button
                                    type="button"
                                    className="btn-close modal_edit_pop-up me-1 bg-white rounded"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <i className="ri-close-large-line text-white fs-16" />
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                {/* Edit Profile Starts */}
                                <div className="card bg_light_grey account_input-textbox-container">
                                    <div className="card-body">
                                        {/* <div className="">
                      <div className="avatar-upload">
                        <div
                          onClick={() => {
                            const modal = window.bootstrap.Modal.getInstance(
                              document.getElementById("Edit_bank_pop_up")
                            );
                            if (modal) modal.hide();
                            window.location.href = routes.profile.avatar; // or use navigate()
                          }}
                          className="avatar-edit"
                          id="avatar-upload-image"
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className="ri-pencil-fill position-relative"
                            style={{ left: 8, top: 3 }}
                          />
                        </div>
                        <div className="avatar-preview">
                          <div
                            id="imagePreview"
                            style={{
                              backgroundImage: `url(${
                                avatar?.avatar?.image ||
                                "assets/img/icons/man.png"
                              })`,
                            }}
                          />
                        </div>
                      </div>
                    </div> */}
                                        <form className="form-control_container" onSubmit={handleUpdateName}>
                                            <div className="input-field">
                                                <input
                                                    required
                                                    className="input"
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                />
                                                <label className="label" htmlFor="input">
                                                    Name
                                                </label>
                                            </div>
                                            {/* <div className="input-field">
                        <input required="" className="input" type="text" />
                        <label className="label" htmlFor="input">
                          Enter Email
                        </label>
                      </div> */}
                                            {/* <div className="input-field">
                        <input required="" className="input" type="text" />
                        <label className="label" htmlFor="input">
                          Mobile Number
                        </label>
                      </div> */}
                                            <div className="d-flex justify-content-center align-items-center">
                                                <button className="btn btn-red w-50 mb-3 mt-3">Update Data</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                {/* Edit Profile Ends */}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Add Bank Details POP-UP Ends */}
            </div>
        </>
    );
    // AccountDasboardDestop
};

export default AccountDashboard;
