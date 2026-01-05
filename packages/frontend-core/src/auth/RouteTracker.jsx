// import { useEffect, useContext } from "react";
// import { useLocation } from "react-router-dom";
// import AuthContext from "./AuthContext";

// const RouteTracker = ({ children }) => {
//   const location = useLocation();
//   const { fetchUser } = useContext(AuthContext);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       console.log("🔄 Route changed, verifying token...");
//       fetchUser(token); // ✅ Will now work on each route change
//     }
//   }, [location.pathname, fetchUser]); // ✅ include fetchUser too

//   return <>{children}</>;
// };

// export default RouteTracker;

import { useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "./AuthContext";

const RouteTracker = ({ children }) => {
  const location = useLocation();
  const { fetchUser } = useContext(AuthContext);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false; // skip first run
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔄 Route changed, verifying token...");
      fetchUser(token);
    }
  }, [location.pathname, fetchUser]);

  return <>{children}</>;
};

export default RouteTracker;
