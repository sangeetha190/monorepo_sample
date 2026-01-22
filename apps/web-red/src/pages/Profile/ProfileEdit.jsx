import React from "react";

const ProfileEdit = () => {
    return (
        <div>
            <section className="container vh-100">
                <div className="h-100">
                    {/* Nav starts */}
                    {/* Nav Ends */}
                    {/* ======================================================================= */}
                    {/* Header 2 buttons Starts */}
                    <div className="pt-3 pb-2">
                        <div className="container">
                            {/* card 1 Starts */}
                            <div className="card bg_light_grey br-grey account_input-textbox-container my-3">
                                <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                    <h5 className="text-center mb-0">Profile Details</h5>
                                </div>
                                <div className="card-body">
                                    <div className="">
                                        <div className="avatar-upload">
                                            <div className="avatar-edit">
                                                <input type="file" id="imageUpload" accept=".png, .jpg, .jpeg" />
                                                <label htmlFor="imageUpload">
                                                    <i
                                                        className="ri-pencil-fill position-relative"
                                                        style={{left: 8, top: 3}}
                                                    />
                                                </label>
                                            </div>
                                            <div className="avatar-preview">
                                                <div
                                                    id="imagePreview"
                                                    style={{
                                                        backgroundImage:
                                                            'url("https://img.freepik.com/free-photo/cartoon-man-wearing-glasses_23-2151136831.jpg?semt=ais_hybrid")',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <form className="form-control_container" action="">
                                        <div className="input-field">
                                            <input required="" className="input" type="text" />
                                            <label className="label" htmlFor="input">
                                                Name
                                            </label>
                                        </div>
                                        <div className="input-field">
                                            <input required="" className="input" type="text" />
                                            <label className="label" htmlFor="input">
                                                Enter Email
                                            </label>
                                        </div>
                                        <div className="input-field">
                                            <input required="" className="input" type="text" />
                                            <label className="label" htmlFor="input">
                                                Mobile Number
                                            </label>
                                        </div>
                                        <button className="btn btn-login w-100 mb-3 mt-3">Update Data</button>
                                    </form>
                                </div>
                            </div>
                            {/* Card 1 Ends */}
                            {/* card 1 Starts */}
                            <div className="card bg_light_grey br-grey account_input-textbox-container my-3">
                                <div className="p-3 red-gradient rounded-top d-flex justify-content-center align-items-center">
                                    <h5 className="text-center mb-0">Change Password</h5>
                                </div>
                                <div className="card-body">
                                    <form className="form-control_container" action="">
                                        <div className="input-field">
                                            <input
                                                required=""
                                                className="input position-relative"
                                                type="password"
                                                id="oldPassword"
                                            />
                                            <i
                                                className="position-absolute top-60 translate-middle-y end-0 pe-3 text-white cursor-pointer ri-eye-off-line togglePassword"
                                                style={{fontSize: "1.5rem", cursor: "pointer"}}
                                            />
                                            <label className="label" htmlFor="oldPassword">
                                                Old Password
                                            </label>
                                        </div>
                                        <div className="input-field">
                                            <input
                                                required=""
                                                className="input position-relative"
                                                type="password"
                                                id="newPassword"
                                            />
                                            <i
                                                className="position-absolute top-60 translate-middle-y end-0 pe-3 text-white cursor-pointer ri-eye-off-line togglePassword"
                                                style={{fontSize: "1.5rem", cursor: "pointer"}}
                                            />
                                            <label className="label" htmlFor="newPassword">
                                                New Password
                                            </label>
                                        </div>
                                        <div className="input-field">
                                            <input
                                                required=""
                                                className="input position-relative"
                                                type="password"
                                                id="repeatPassword"
                                            />
                                            <i
                                                className="position-absolute top-60 translate-middle-y end-0 pe-3 text-white cursor-pointer ri-eye-off-line togglePassword"
                                                style={{fontSize: "1.5rem", cursor: "pointer"}}
                                            />
                                            <label className="label" htmlFor="repeatPassword">
                                                Repeat Password
                                            </label>
                                        </div>
                                        <button className="btn btn-login w-100 mb-3 mt-3">Change Password</button>
                                    </form>
                                </div>
                            </div>
                            {/* Card 1 Ends */}
                        </div>
                    </div>
                    {/* Header  Ends */}
                </div>
            </section>
        </div>
    );
};

export default ProfileEdit;
