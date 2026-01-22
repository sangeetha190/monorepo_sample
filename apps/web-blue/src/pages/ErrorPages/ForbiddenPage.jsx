import React from "react";
import AuthContext from "@core/auth/AuthContext";

const ForbiddenPage = () => {

  const { portalErrorMsg } = React.useContext(AuthContext);
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
      <img
        src="https://cdn3d.iconscout.com/3d/premium/thumb/error-403-3d-icon-download-in-png-blend-fbx-gltf-file-formats--website-web-webpage-development-pack-design-icons-10820809.png?f=webp"
        alt=""
        width={"200px"}
      />
      <h1 className="display-4">Forbidden</h1>
      <p className="lead">
        {portalErrorMsg || "You are not authorized to access this portal."}
      </p>
    </div> 
  );
};

export default ForbiddenPage;