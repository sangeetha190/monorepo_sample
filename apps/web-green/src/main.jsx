import App from "./App.jsx";

function RootApp() {
    const {portalStatus, portalErrorMsg} = useContext(AuthContext);

    if (portalStatus === "loading") {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center text-white">Loading portal...</div>
        );
    }

    if (portalStatus === "forbidden") return <ForbiddenPage />;

    return <App />;
}

createRoot(document.getElementById("root")).render(
    // StrictMode can cause dev-only double effects (same as you noted)
    <>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouteTracker>
                        <RootApp />
                    </RouteTracker>
                </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </>
);
