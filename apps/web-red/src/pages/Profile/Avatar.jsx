import React, {useEffect, useState, useContext, useMemo, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-toastify";

// import AuthContext from "../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
// import routes from "../routes/route";
import routes from "../../routes/routes";
// import axiosInstance from "../../API/axiosConfig";
import {axiosInstance} from "@core/api/axiosConfig";
// import BASE_URL from "../../API/api";
import {BASE_URL} from "@core/api/baseUrl";
// import BASE_URL from "@core/api/baseUrl";

// used for profile/update endpoint (can also use axiosInstance)

// ---------- Component ----------
const Avatar = () => {
    const {user, avatar, setAvatar} = useContext(AuthContext);
    const token = user?.token;

    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ✅ Pre-select the current avatar from context when page opens
    useEffect(() => {
        if (avatar?.avatar?.id) {
            setSelectedAvatarId(avatar.avatar.id);
        }
    }, [avatar]);

    // ✅ Fetch avatar tree (cached per session via token)
    const {
        data: avatarTree = [],
        isLoading: avatarsLoading,
        isError: avatarsError,
        error: avatarsErr,
    } = useQuery({
        queryKey: ["avatarTree", token],
        enabled: !!token,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 min cache
        gcTime: 30 * 60 * 1000,
        retry: 0,
        queryFn: async () => {
            const res = await axiosInstance.get(`/player/get-avatar`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            // console.log(res);

            if (res.data?.status !== "success") {
                throw new Error(res.data?.msg || "Failed to load avatars.");
            }
            return res.data.avatar ?? [];
        },
        onError: () => {
            toast.error("Failed to load avatars.");
        },
    });
    const isEmpty = !avatarsLoading && !avatarsError && Array.isArray(avatarTree) && avatarTree.length === 0;

    // ✅ Optional: a quick, flat list of all avatars for a top “grid” preview
    const flatAvatars = useMemo(() => {
        if (!Array.isArray(avatarTree)) return [];
        // Expecting: topLevel.children[].children[].avatars[]
        return avatarTree.flatMap((top) =>
            (top.children ?? []).flatMap((cat) => (cat.children ?? []).flatMap((sub) => sub.avatars ?? []))
        );
    }, [avatarTree]);

    // ✅ Submit selected avatar to backend and refresh profile in context
    const handleAvatarSubmit = async () => {
        if (!selectedAvatarId) {
            toast.warn("Please select an avatar");
            return;
        }

        try {
            // Update avatar
            const response = await axiosInstance.get(`/player/update-profile`, {
                params: {avatar_id: selectedAvatarId},
                headers: {Authorization: `Bearer ${token}`},
            });

            if (response.data.status !== "success") {
                toast.error(response.data.message || "Failed to update avatar.");
                return;
            }

            toast.success("Avatar updated successfully!");

            // Refresh profile and update context
            const profileRes = await axiosInstance.get(`/player/profile`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            setAvatar(profileRes.data.player);
            // Optionally invalidate any cached avatar/profile queries if you have them
            queryClient.invalidateQueries({queryKey: ["avatarTree"]});

            navigate("/account-dashboard");
        } catch (error) {
            console.error("Avatar update error:", error);
            toast.error("Something went wrong while updating avatar.");
        }
    };

    return (
        <section className="container position-relative">
            <div className="h-100">
                <div className="pt-3 pb-2">
                    <div className="row px-2">
                        {/* Header */}
                        <div className="d-flex align-items-center justify-content-between position-relative px-0">
                            <div className="d-flex align-items-center px-0">
                                <Link to={routes.account.dashboard}>
                                    <button className="go_back_btn bg-grey">
                                        <i className="ri-arrow-left-s-line text-white fs-20" />
                                    </button>
                                </Link>
                            </div>

                            {!isEmpty && (
                                <h5 className="position-absolute start-50 translate-middle-x m-0 text-white fs-16">
                                    Choose Your Avatar
                                </h5>
                            )}
                        </div>

                        {/* test testing */}

                        {/* Loading / Error */}
                        {avatarsLoading && <p className="text-muted mt-3">Loading avatars…</p>}
                        {avatarsError && (
                            <p className="text-danger mt-3">{avatarsErr?.message || "Error loading avatars"}</p>
                        )}

                        {/* Quick flat grid preview (optional) */}
                        {!avatarsLoading && !avatarsError && flatAvatars.length > 0 && (
                            <ul className="avatar-grid d-flex flex-wrap gap-2 mt-3">
                                {flatAvatars.map((a) => (
                                    <li key={a.id} style={{listStyle: "none"}}>
                                        <button
                                            className={`border-0 p-0 bg-transparent ${
                                                selectedAvatarId === a.id ? "active" : ""
                                            }`}
                                            onClick={() => setSelectedAvatarId(a.id)}
                                            title={a.name || "Avatar"}
                                        >
                                            <img
                                                src={a.image}
                                                alt={a.name || "Avatar"}
                                                className="img-fluid avatar-circle"
                                                style={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    outline: selectedAvatarId === a.id ? "3px solid #e74c3c" : "none",
                                                }}
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Full nested tree (category -> subcategory -> avatars) */}
                        {!avatarsLoading && !avatarsError && (
                            <div className="container mt-4">
                                {Array.isArray(avatarTree) &&
                                    avatarTree.map((category) => (
                                        <CategorySection
                                            key={category.id}
                                            node={category}
                                            selectedAvatarId={selectedAvatarId}
                                            setSelectedAvatarId={setSelectedAvatarId}
                                        />
                                    ))}
                            </div>
                            // <div className="container mt-4">
                            //   {Array.isArray(avatarTree) &&
                            //     avatarTree.map((topLevel) =>
                            //       (topLevel.children ?? []).map((category) => {
                            //         const subcategoriesWithAvatars = (
                            //           category.children ?? []
                            //         ).filter(
                            //           (child) =>
                            //             Array.isArray(child.avatars) &&
                            //             child.avatars.length > 0
                            //         );

                            //         if (subcategoriesWithAvatars.length === 0) return null;

                            //         return (
                            //           <div key={category.id}>
                            //             <div className="mb-4">
                            //               <h5 className="text-white mb-2">
                            //                 {category.category_name}
                            //               </h5>

                            //               {subcategoriesWithAvatars.map((sub) => (
                            //                 <div key={sub.id} className="mb-3 ps-2">
                            //                   <h6 className="text-light">
                            //                     {sub.category_name}
                            //                   </h6>
                            //                   <div className="d-flex flex-wrap">
                            //                     {sub.avatars.map((av) => (
                            //                       <div
                            //                         key={av.id}
                            //                         className={`avatar-container ${
                            //                           selectedAvatarId === av.id
                            //                             ? "selected-avatar"
                            //                             : ""
                            //                         }`}
                            //                         onClick={() => setSelectedAvatarId(av.id)}
                            //                         style={{
                            //                           cursor: "pointer",
                            //                           marginRight: "10px",
                            //                         }}
                            //                       >
                            //                         <img
                            //                           src={av.image}
                            //                           alt={av.name}
                            //                           className="img-fluid avatar-circle"
                            //                           style={{
                            //                             width: 72,
                            //                             height: 72,
                            //                             borderRadius: "50%",
                            //                             objectFit: "cover",
                            //                             outline:
                            //                               selectedAvatarId === av.id
                            //                                 ? "3px solid #e74c3c"
                            //                                 : "none",
                            //                           }}
                            //                           onError={(e) =>
                            //                             (e.currentTarget.style.display =
                            //                               "none")
                            //                           }
                            //                         />
                            //                       </div>
                            //                     ))}
                            //                   </div>
                            //                 </div>
                            //               ))}
                            //             </div>
                            //           </div>
                            //         );
                            //       })
                            //     )}
                            // </div>
                        )}

                        {isEmpty && (
                            <div className="text-center text-muted py-5">
                                <p className="mb-2">No avatars found right now.</p>
                                {/* <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["avatarTree"] })
                  }
                >
                  Reload
                </button> */}
                            </div>
                        )}

                        {!isEmpty && (
                            <div className="d-flex justify-content-center mt-4 mb-3">
                                <button
                                    type="button"
                                    className="btn btn-login w-50 text-capitalize"
                                    onClick={handleAvatarSubmit}
                                    disabled={!selectedAvatarId}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                        {/* Submit */}
                        {/* <div className="d-flex justify-content-center mt-4 mb-3">
              <button
                type="button"
                className="btn btn-login w-50 text-capitalize"
                onClick={handleAvatarSubmit}
                disabled={!selectedAvatarId}
              >
                Submit
              </button>
            </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Avatar;
function CategorySection({node, selectedAvatarId, setSelectedAvatarId}) {
    const hasAvatars = Array.isArray(node.avatars) && node.avatars.length > 0;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const noData = !hasAvatars && !hasChildren;

    return (
        <div className="mb-4">
            {/* current category name */}
            {node.category_name && <h5 className="text-white mb-2 text-capitalize">{node.category_name}</h5>}

            {/* avatars directly under this category */}
            {hasAvatars && (
                <div className="d-flex flex-wrap mb-2">
                    {node.avatars.map((av) => (
                        <div
                            key={av.id}
                            className={`avatar-container ${selectedAvatarId === av.id ? "selected-avatar" : ""}`}
                            onClick={() => setSelectedAvatarId(av.id)}
                            style={{cursor: "pointer", marginRight: 10}}
                        >
                            <img
                                src={av.image}
                                alt={av.name}
                                className="img-fluid avatar-circle"
                                style={{
                                    width: 72,
                                    height: 54,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    outline: selectedAvatarId === av.id ? "3px solid #e74c3c" : "none",
                                }}
                                onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* recurse into children */}
            {hasChildren &&
                node.children.map((child) => (
                    <div key={child.id} className="ps-2">
                        {child.category_name && <h6 className="text-light">{child.category_name}</h6>}
                        <CategorySection
                            node={child}
                            selectedAvatarId={selectedAvatarId}
                            setSelectedAvatarId={setSelectedAvatarId}
                        />
                    </div>
                ))}

            {/* show fallback if no avatars and no children */}
            {noData && <p className="text-muted fst-italic">No avatars available</p>}
        </div>
    );
}
