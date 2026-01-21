import {useContext, useEffect, useRef} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
// import axiosInstance from "../../../API/axiosConfig";
import axiosInstance from "@core/api/axiosConfig";
// import AuthContext from "../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";

const PENDING_CODE_KEY = "pendingGiftCode";
const FLASH_KEY = "giftFlash";

export default function GiftEnvelopeGate() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {user} = useContext(AuthContext);
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const raw = (searchParams.get("id") || "").trim();
        if (!raw) {
            navigate("/", {replace: true});
            return;
        }

        (async () => {
            // if (!user?.token) {
            //   localStorage.setItem(PENDING_CODE_KEY, raw);
            //   localStorage.setItem("giftNotice", "true"); // 👈 Add this
            //   navigate("/login?next=/", { replace: true });
            //   return;
            // }

            if (!user?.token) {
                // Save the current full URL for after login
                // localStorage.setItem(
                //   "redirectAfterLogin",
                //   window.location.pathname + window.location.search
                // );
                localStorage.setItem(PENDING_CODE_KEY, raw);
                localStorage.setItem("giftNotice", "true");

                // Just go to login (without changing the query link in address bar)
                navigate("/login", {replace: true});
                return;
            }

            // If already logged in, you can either:
            // A) do it right here (validate → claim) OR
            // B) let AuthProvider do it by saving pending and going home.
            // We'll do A for fastest UX (and no pending write).
            try {
                const upper = raw;

                await axiosInstance.get("/gift-envelope/validate", {
                    params: {id: upper},
                });
                const payload = {mobile: user?.mobile, code: upper};
                const claimRes = await axiosInstance.post("/gift-envelope/claim", payload);

                sessionStorage.setItem(
                    FLASH_KEY,
                    JSON.stringify({
                        type: "success",
                        message: claimRes?.data?.message || "Gift claimed successfully 🎉",
                        amount: claimRes?.data?.amount,
                    })
                );
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Gift link invalid, used, or claim failed.";
                sessionStorage.setItem(FLASH_KEY, JSON.stringify({type: "error", message: msg}));
            } finally {
                navigate("/", {replace: true});
            }
        })();
    }, [navigate, searchParams, user?.token, user?.mobile]);

    return null; // headless
}
