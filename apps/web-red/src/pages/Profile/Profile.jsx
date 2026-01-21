import React, {useContext, useEffect, useState} from "react";
// import BASE_URL from "../../API/api";
// import axios from "axios";
// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
//  import { getUserProfile } from "../../API/authAPI";
import {getUserProfile} from "@core/api/authAPI";

function Profile() {
    // # 1️⃣ Define State Variables
    const [player, setPlayer] = useState(null); //# Store player data
    const [error, setError] = useState(null); //# Store error messages
    const [loading, setLoading] = useState(true); // # Track loading state

    // # 2️⃣ Get User Token from AuthContext
    const {user} = useContext(AuthContext);
    const token = user?.token; // # Extract token

    // # 4️⃣ Fetch Profile When Token is Available
    useEffect(() => {
        // if (!token) return; //# Ensure token exists

        const fetchProfile = async () => {
            try {
                const playerData = await getUserProfile(token); //# ✅ Fetch data
                setPlayer(playerData); //# ✅ Store in state
            } catch (err) {
                setError(err.message); //# ✅ Store error if API fails
            } finally {
                setLoading(false); //# ✅ Set loading to false when complete
            }
        };

        fetchProfile();
    }, [token]); //# ✅ Runs when token changes

    return (
        <div>
            <section className="container">
                <div className="h-100">
                    <div className="pt-3 pb-2">
                        <div className="container px-1">
                            <div className="card bg_light_grey account_input-textbox-container my-3">
                                <div className="p-1 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                    <h5 className="text-center mb-0">Profile Details</h5>
                                </div>

                                <div className="card-body px-2">
                                    {loading ? (
                                        <p className="text-center">🔄 Loading profile...</p> //   Added loading state UI
                                    ) : error ? (
                                        <p className="text-center text-danger">{error}</p> //   Display error message
                                    ) : (
                                        <>
                                            <div className="py-2">
                                                <div className="avatar-upload">
                                                    <div className="avatar-preview">
                                                        <div
                                                            id="imagePreview"
                                                            style={{
                                                                backgroundImage: 'url("assets/img/icons/man (1).png")',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-center my-4">
                                                    <button
                                                        className="Btn"
                                                        type="button"
                                                        data-bs-toggle="offcanvas"
                                                        data-bs-target="#offcanvasBottom"
                                                        aria-controls="offcanvasBottom"
                                                    >
                                                        Edit
                                                        <svg className="svg" viewBox="0 0 512 512">
                                                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="text-center text-white">
                                                    <h2 className="fs-22 mb-1">
                                                        {player?.playername || "Unknown User"} {/*   Fixed display */}
                                                    </h2>
                                                    <h6 className="fs-15">
                                                        <span>
                                                            User Id : <span>{player?.id || "N/A"}</span>
                                                            <br /> Chips :{" "}
                                                            <span className="mt-3">{player?.chips || "N/A"}</span>{" "}
                                                            {/*   Display player ID */}
                                                        </span>
                                                    </h6>
                                                </div>
                                            </div>
                                            {/* Profile Details */}
                                            <div className="py-4">
                                                <div className="d-flex justify-content-start my-2">
                                                    <div className="profile_icons">
                                                        <i className="ri-phone-line text-white fs-20" />
                                                    </div>
                                                    <div>
                                                        <p className="mb-1">Mobile Phone</p>
                                                        <h5 className="fs-16 text-white">
                                                            {player?.mobile || "-"}
                                                        </h5>{" "}
                                                        {/*   Display player phone */}
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-start my-2">
                                                    <div className="profile_icons">
                                                        <i className="ri-mail-send-line text-white fs-20" />
                                                    </div>
                                                    <div>
                                                        <p className="mb-1">Email Address</p>
                                                        <h5 className="fs-16 text-white">
                                                            {player?.email || "-"}
                                                        </h5>{" "}
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-start">
                                                    <div className="profile_icons">
                                                        <i className="ri-focus-3-line text-white fs-20" />
                                                    </div>
                                                    <div>
                                                        <p className="mb-1">Address</p>
                                                        <p className="text-capitalize">{player?.address || "-"}</p>{" "}
                                                        {/*   Display player address */}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Profile;
