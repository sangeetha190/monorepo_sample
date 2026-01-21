import {useContext, useEffect, useMemo, useState} from "react";
// import AuthContext from "../../../../Auth/AuthContext";
import AuthContext from "@core/auth/AuthContext";
import {toast, ToastContainer} from "react-toastify";
// import StickyHeader from "../../../layouts/Header/Header";
import StickyHeader from "../../Home/Components/Header/Header";
// import Sidebar from "../../../layouts/Header/Sidebar";
import Sidebar from "../../Home/Components/Header/Sidebar";
// import { CURRENCY_SYMBOL } from "../../../../constants";
import {CURRENCY_SYMBOL} from "@core/constants";
import {useLocation, useNavigate} from "react-router-dom";
// import { IoClose } from "react-icons/io5";
import {useQuery, useQueryClient, keepPreviousData} from "@tanstack/react-query";
// import {fetchDepositDetails, fetchDepositHistory} from "../../../../API/depositAPI";
import {fetchDepositDetails, fetchDepositHistory} from "@core/api/depositAPI";

const ITEMS_PER_PAGE = 10;

const DepositHistory = () => {
    const {user} = useContext(AuthContext);
    const token = user?.token;

    const [selectedTab, setSelectedTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // use composite open key: `${id}:${type}`
    const [openKey, setOpenKey] = useState(null);
    const toggleOpen = (key) => setOpenKey((v) => (v === key ? null : key));

    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const qc = useQueryClient();

    const {data, isLoading, isError, error, isFetching} = useQuery({
        queryKey: ["depositHistory", {page: currentPage, perPage: ITEMS_PER_PAGE, tab: selectedTab, token}],
        queryFn: () =>
            fetchDepositHistory({
                page: currentPage,
                perPage: ITEMS_PER_PAGE,
                token,
            }),
        placeholderData: keepPreviousData,
        retry: 1,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        enabled: !!token, // 👈 add this

        onError: (e) => {
            toast.error(`${(e && e.message) || "Request failed"}. Please log in again to continue.`, {
                toastId: "unauthorized-toast",
                onClose: () => navigate(location.pathname, {replace: true, state: {}}),
            });
        },
    });

    const PREFETCH = false;

    useEffect(() => {
        if (!PREFETCH || !data) return;
        const next = (data.current_page || 1) + 1;
        const prev = (data.current_page || 1) - 1;

        if (next <= (data.last_page || 1)) {
            qc.prefetchQuery({
                queryKey: ["depositHistory", {page: next, perPage: ITEMS_PER_PAGE, tab: selectedTab, token}],
                queryFn: () => fetchDepositHistory({page: next, perPage: ITEMS_PER_PAGE, token}),
                staleTime: 5 * 60 * 1000,
            });
        }
        if (prev >= 1) {
            qc.prefetchQuery({
                queryKey: ["depositHistory", {page: prev, perPage: ITEMS_PER_PAGE, tab: selectedTab, token}],
                queryFn: () => fetchDepositHistory({page: prev, perPage: ITEMS_PER_PAGE, token}),
                staleTime: 5 * 60 * 1000,
            });
        }
    }, [data, qc, selectedTab, token]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab]);

    const rows = (data && data.data) || [];
    const meta = {
        current_page: (data && data.current_page) || currentPage,
        last_page: (data && data.last_page) || 1,
        per_page: (data && data.per_page) || ITEMS_PER_PAGE,
        total: (data && data.total) || rows.length,
    };

    const displayRows = useMemo(() => {
        if (selectedTab === "all") return rows;
        return rows.filter((b) => (b.status || "").toLowerCase() === selectedTab);
    }, [rows, selectedTab]);

    const statusBadge = (s) => {
        const v = (s || "").toString().trim().toLowerCase();
        if (!v) return "badge bg-secondary";
        if (["success", "paid", "completed", "verified"].includes(v)) return "history_badge success_badge";
        if (["failed", "rejected", "error", "cancelled", "canceled"].includes(v)) return "history_badge text-danger";
        if (["processing", "created", "pending", "initiated"].includes(v)) return "history_badge pending_badge";
        return "badge bg-secondary";
    };

    const renderPagination = () => {
        const items = [];
        const curr = meta.current_page || 1;
        const last = meta.last_page || 1;
        const addPage = (p) => items.push({type: "page", value: p});
        const addDots = () => items.push({type: "dots"});

        if (last <= 7) {
            for (let i = 1; i <= last; i++) addPage(i);
        } else {
            const left = Math.max(2, curr - 1);
            const right = Math.min(last - 1, curr + 1);
            addPage(1);
            if (left > 2) addDots();
            for (let p = left; p <= right; p++) addPage(p);
            if (right < last - 1) addDots();
            addPage(last);
        }

        return items.map((it, idx) =>
            it.type === "dots" ? (
                <li key={`dots-${idx}`} className="page-item disabled">
                    <span className="page-link">…</span>
                </li>
            ) : (
                <li key={`p-${it.value}`} className={`page-item ${meta.current_page === it.value ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(it.value)}>
                        {it.value}
                    </button>
                </li>
            )
        );
    };

    const prefetchPage = (p) => {
        if (!p) return;
        qc.prefetchQuery({
            queryKey: ["depositHistory", {page: p, perPage: ITEMS_PER_PAGE, tab: selectedTab, token}],
            queryFn: () => fetchDepositHistory({page: p, perPage: ITEMS_PER_PAGE, token}),
            staleTime: 5 * 60 * 1000,
        });
    };

    const prefetchDetails = (id, type) => {
        if (!id) return;
        qc.prefetchQuery({
            queryKey: ["depositDetails", {id, type, token}],
            queryFn: () => fetchDepositDetails({id, type, token}),
            staleTime: 5 * 60 * 1000,
        });
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} theme="dark" />

            <StickyHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <section className="page-body-wrapper">
                <Sidebar />

                <div className="main-panel overflow-hidden">
                    <div className="content-wrapper">
                        <div className="max-1250 mx-auto">
                            <div className="h-100">
                                <div className="pt-3 pb-2">
                                    <div className="row px-2">
                                        {/* Header */}
                                        <div className="d-flex align-items-center justify-content-between position-relative px-2">
                                            <div className="d-flex justify-content-between align-items-center px-1">
                                                <button
                                                    className="go_back_btn bg-grey"
                                                    onClick={() => window.history.back()}
                                                >
                                                    <i className="ri-arrow-left-s-line text-white fs-20" />
                                                </button>
                                            </div>

                                            <h5 className="m-0 text-white fs-16 text-center">All Deposit History</h5>

                                            <div className="d-flex justify-content-between align-items-center px-1">
                                                {/* Manual refresh: invalidates cache & refetches */}
                                                <button
                                                    className="go_back_btn bg-grey"
                                                    onClick={() =>
                                                        qc.invalidateQueries({
                                                            queryKey: ["depositHistory"],
                                                        })
                                                    }
                                                    title="Refresh"
                                                >
                                                    <i className="fa-solid fa-arrows-rotate text-white fs-16"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tabs (only 'all' now) */}
                                        <div className="overflow-auto px-3 mt-4">
                                            <div
                                                className="nav nav-pills flex-nowrap gap-2 scroll-hidden rounded-2"
                                                id="latest-bet-tabs"
                                                style={{overflowX: "auto", whiteSpace: "nowrap"}}
                                            >
                                                {["all"].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        className={`nav-link latest_bet_btn ${
                                                            selectedTab === tab ? "active" : ""
                                                        }`}
                                                        style={{padding: "2px 12px"}}
                                                        onClick={() => setSelectedTab(tab)}
                                                    >
                                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="tab-content px-3 mt-2 mb-3">
                                            {isLoading ? (
                                                <p className="text-white text-center mt-4">Loading…</p>
                                            ) : isError ? (
                                                <p className="text-danger text-center mt-3">
                                                    {String((error && error.message) || "Failed")}
                                                </p>
                                            ) : displayRows && displayRows.length > 0 ? (
                                                displayRows.map((bet) => {
                                                    const rowKey = `${bet.id}:${bet.type}`; // composite key
                                                    return (
                                                        <DepositRow
                                                            key={rowKey}
                                                            rowKey={rowKey}
                                                            bet={bet}
                                                            token={token}
                                                            isOpen={openKey === rowKey}
                                                            onToggle={toggleOpen} // pass handler (expects composite key)
                                                            prefetchDetails={prefetchDetails}
                                                            statusBadge={statusBadge}
                                                        />
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center mt-4">
                                                    <p className="text-white text-center">No Deposit History Found</p>
                                                </div>
                                            )}

                                            {/* Pagination */}
                                            {meta.last_page > 1 && (
                                                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 my-3">
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                        disabled={meta.current_page <= 1}
                                                    >
                                                        ⬅ Prev
                                                    </button>
                                                    <ul className="pagination mb-0">{renderPagination()}</ul>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onMouseEnter={() => prefetchPage(meta.current_page + 1)}
                                                        onClick={() =>
                                                            setCurrentPage((p) => Math.min(meta.last_page, p + 1))
                                                        }
                                                        disabled={meta.current_page >= meta.last_page}
                                                    >
                                                        Next ➡
                                                    </button>
                                                </div>
                                            )}

                                            {/* Hint while background fetching */}
                                            {isFetching && <div className="text-center text-grey small">Updating…</div>}

                                            <div className="text-center text-grey small">
                                                Page {meta.current_page} of {meta.last_page} • Total {meta.total}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DepositHistory;

function DepositRow({rowKey, bet, token, isOpen, onToggle, prefetchDetails, statusBadge}) {
    const [viewerOpen, setViewerOpen] = useState(false);

    // Close on ESC + lock scroll when modal open
    useEffect(() => {
        if (!viewerOpen) return;
        const onKey = (e) => e.key === "Escape" && setViewerOpen(false);
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [viewerOpen]);

    // details query is keyed by id+type+token and only enabled when open
    const {
        data: details,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["depositDetails", {id: bet.id, type: bet.type, token}],
        queryFn: () => fetchDepositDetails({id: bet.id, type: bet.type, token}),
        enabled: isOpen && !!token, // 👈
        staleTime: 0,
        refetchOnMount: "always",
        retry: 1,
    });

    const onHeaderClick = () => onToggle(rowKey); // <- use composite key
    const onPrefetch = () => prefetchDetails(bet.id, bet.type);

    return (
        <div className="dh-card">
            {/* Row header */}
            <button
                className={`dh-row ${isOpen ? "is-open" : ""}`}
                onClick={onHeaderClick}
                onMouseEnter={onPrefetch}
                onFocus={onPrefetch}
                aria-expanded={isOpen}
                aria-controls={`row-${rowKey}-details`}
            >
                <div className="dh-row__left ">
                    <div className="dh-icon">
                        <i className="fa-solid fa-arrow-down" style={{transform: "rotate(45deg)"}} />
                    </div>

                    <div>
                        <div className="dh-eyebrow">Payment Method</div>
                        <div className="dh-title">{bet.type}</div>
                        <div className="dh-subtle">
                            {new Date(bet.created_at).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}{" "}
                            •{" "}
                            {new Date(bet.created_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </div>
                    </div>
                </div>

                <div className="dh-row__right d-flex align-items-end flex-column">
                    <div className="dh-amount">
                        {CURRENCY_SYMBOL} {Number(bet?.deposit_amount || 0).toFixed(2)}
                    </div>
                    <span className={statusBadge(bet.status)}>{bet.status}</span>
                    <div className="dh-chevron" aria-hidden>
                        <i className="fa-solid fa-chevron-down text-white" />
                    </div>
                </div>
            </button>

            {/* Details */}
            <div id={`row-${rowKey}-details`} className={`dh-details ${isOpen ? "open" : ""}`}>
                <div className="dh-details__inner">
                    {isLoading && (
                        <div className="skeleton">
                            <div className="skeleton-line" />
                            <div className="skeleton-line w-75" />
                            <div className="skeleton-line w-50" />
                        </div>
                    )}

                    {isError && (
                        <div className="alert alert-danger py-2 px-3">
                            {String(error?.message || "Failed to load details")}
                        </div>
                    )}

                    {!isLoading &&
                        !isError &&
                        details &&
                        (() => {
                            const d = details?.depositDetail ?? details; // normalize
                            if (!d) return null;

                            return (
                                <div className="dh-grid">
                                    {/* UTR only if present */}
                                    {d.utr ? (
                                        <div className="dh-field">
                                            <div className="dh-label">UTR / Reference</div>
                                            <div className="dh-value">{d.utr}</div>
                                        </div>
                                    ) : null}

                                    {d.remarks ? (
                                        <div className="dh-field">
                                            <div className="dh-label">Remarks</div>
                                            <div className="dh-value">{d.remarks}</div>
                                        </div>
                                    ) : null}

                                    {d.bonus ? (
                                        <div className="dh-field">
                                            <div className="dh-label">Bonus</div>
                                            <div className="dh-value">{d.bonus}</div>
                                        </div>
                                    ) : null}

                                    {/* Proof image → click to open viewer */}
                                    {d.image_url ? (
                                        <div className="dh-field" style={{gridColumn: "1 / -1"}}>
                                            <img
                                                src={d.image_url}
                                                alt="Payment proof"
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                                title="Click to view"
                                                style={{
                                                    maxWidth: "100%",
                                                    height: "300px",
                                                    borderRadius: 8,
                                                    display: "block",
                                                    cursor: "zoom-in",
                                                    objectFit: "cover",
                                                }}
                                                onClick={() => setViewerOpen(true)}
                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                            />
                                        </div>
                                    ) : null}

                                    {/* Lightbox */}
                                    {viewerOpen && d.image_url && (
                                        <div
                                            className="img-modal"
                                            role="dialog"
                                            aria-modal="true"
                                            aria-label="Image viewer"
                                            onClick={() => setViewerOpen(false)}
                                        >
                                            <div className="img-modal__inner" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="img-modal__close"
                                                    onClick={() => setViewerOpen(false)}
                                                    aria-label="Close"
                                                >
                                                    ×
                                                </button>

                                                <button
                                                    className="img-modal__close"
                                                    aria-label="Close"
                                                    onClick={() => setViewerOpen(false)}
                                                >
                                                    <i className="fa-solid fa-xmark" />
                                                </button>

                                                {/* <a
                          href={d.image_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open in new tab"
                        > */}
                                                <img
                                                    src={d.image_url}
                                                    alt="Payment proof full size"
                                                    referrerPolicy="no-referrer"
                                                />
                                                {/* </a> */}
                                                {/* 
                        <div className="img-modal__actions">
                          <a
                            className="btn btn-sm btn-light"
                            href={d.image_url}
                            download
                          >
                            Download
                          </a>
                          <a
                            className="btn btn-sm btn-outline-light"
                            href={d.image_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open in new tab
                          </a>
                        </div> */}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                </div>
            </div>
        </div>
    );
}
