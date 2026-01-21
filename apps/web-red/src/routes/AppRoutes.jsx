import {lazy, Suspense} from "react";
import {Routes, Route} from "react-router-dom";
import routes from "../routes/routes";
// ✅ Lazy imports
const Home = lazy(() => import("../pages/Home/Home"));
const About = lazy(() => import("../pages/About"));

// Auth
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ForgotOTP = lazy(() => import("../pages/Auth/ForgotOTP"));
const VerifyOTP = lazy(() => import("../pages/Auth/VerifyOTP"));
const NewPassword = lazy(() => import("../pages/Auth/NewPassword"));

const AllGamesPage = lazy(() => import("../pages/Games/AllGamesPage"));

const FilteredGamesPage = lazy(() => import("../pages/Games/FilteredGamesPage"));
const ProvidersPage = lazy(() => import("../pages/Games/ProvidersPage"));
// const SearchTopGames = lazy(() => import("../pages/Games/SearchTopGames"));
const TurboGame = lazy(() => import("../pages/Games/TurboGame"));
const SpribeGame = lazy(() => import("../pages/Games/SpribeGame"));
const FilteredProviderGamesPage = lazy(() => import("../pages/Games/FilteredProviderGamesPage"));

const HowToPlay = lazy(() => import("../pages/StaticPages/HowToPlay"));
const TermsCondition = lazy(() => import("../pages/StaticPages/TermsCondition"));
const PrivacyPolicy = lazy(() => import("../pages/StaticPages/PrivacyPolicy"));

const Envelope = lazy(() => import("../pages/Envelope/Envelope"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const ProfileEdit = lazy(() => import("../pages/Profile/ProfileEdit"));
const AccountDashboard = lazy(() => import("../pages/Profile/AccountDashboard"));
const AccountDashboardDesktop = lazy(() => import("../pages/Profile/AccountDasboardDesktop"));
const ChangePassword = lazy(() => import("../pages/Profile/ChangePassword"));
const Avatar = lazy(() => import("../pages/Profile/Avatar"));
const WithdrawMethod = lazy(() => import("../pages/Transactions/Withdraw_Methods/WithdrawMethod"));
const Deposit = lazy(() => import("../pages/Transactions/Deposit/Deposit"));

// deposite and withdraw
const KazangHowtodeposit = lazy(() => import("../pages/Transactions/kazang/Deposit_kazang/HowToDeposit"));
const DepositNamibia = lazy(() => import("../pages/Transactions/Namibia/Deposit_Namibia_Manual/Deposit_Namibia"));

const DepositHistory = lazy(() => import("../pages/Transactions/Deposit/DepositHistory"));
// import DepositMethod from "../pages/Transactions/Deposit/DepositMethod";
const DepositMethod = lazy(() => import("../pages/Transactions/Deposit/DepositMethod"));

const DepositNamibiaEwallet = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_Ewallet/Deposit_Namibia_Ewallet")
);
// import DepositStatic from "../pages/Transactions/Deposit copy/Deposit_static";
const DepositStatic = lazy(() => import("../pages/Transactions/Deposit_copy/Deposit_static"));

const DepositManualNamibiaHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_Manual/DepositHistory")
);
const DepositEwalletNamibiaHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_Ewallet/DepositHistory")
);
const AllMethodDepositHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_Ewallet/AllDepositHistoryMEE")
);
const DepositIndexKazang = lazy(() => import("../pages/Transactions/kazang/Deposit_kazang/DepositKazang"));
const DepositKazangNamibiaHistory = lazy(() => import("../pages/Transactions/kazang/Deposit_kazang/DepositHistory"));
const DepositNamibiaEasyWallet = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_Easy/Deposit_Namibia_Easy_wallet")
);
const DepositEwalletEasyWalletHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_Easy/DepositHistory")
);

// Blue wallet
const DepositNamibiaBlueWallet = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_BlueWallet/DepositNamibiaBlueWallet")
);
const DepositEwalletBlueWalletHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_BlueWallet/DepositHistory")
);

// nedBank Wallet
const DepositNamibiaNedBankWallet = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_NedbankWallet/DepositNamibiaAccessMoneyBankWallet")
);
const DepositNamibiaNedBankWalletHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_NedbankWallet/DepositHistory")
);

// AccessMoneyBank Wallet
const DepositNamibiaAccessMoneyWallet = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_AccessMoneyWallet/DepositNamibiaAccessMoneyWallet")
);
const DepositNamibiaAccessMoneyWalletHistory = lazy(() =>
    import("../pages/Transactions/Namibia/Deposit_Namibia_AccessMoneyWallet/DepositHistory")
);
const GlobalDepositHistory = lazy(() => import("../pages/Transactions/Deposit/AllHistory"));
const DepositIndexIndia = lazy(() => import("../pages/Transactions/India/Deposit_India_Manual/DepositIndia"));

// all_withdrawHistory

const WithdrawHistory = lazy(() => import("../pages/Transactions/Withdraw/WithdrawHistory"));
const WithdrawIndex = lazy(() => import("../pages/Transactions/Withdraw/WithdrawIndex"));

const WithdrawMethodIndex = lazy(() => import("../pages/Transactions/Withdraw_Methods/WithdrawIndex"));

const WithdrawIndexNamibia = lazy(() => import("../pages/Transactions/Namibia/Withdraw_Namibia/WithdrawIndex"));

const WithdrawHistoryNamibia = lazy(() => import("../pages/Transactions/Namibia/Withdraw_Namibia/WithdrawHistory"));
const AllWithdrawHistory = lazy(() => import("../pages/Transactions/Withdraw_Methods/AllHistory"));

const WithdrawIndexIndia = lazy(() => import("../pages/Transactions/India/WithdrawIndia_Manual/WithdrawIndex"));
const AddBank = lazy(() => import("../pages/Layouts/AddBank"));

const BetHistory = lazy(() => import("../pages/Layouts/BetHistory"));
const Menu = lazy(() => import("../pages/Menu"));

export default function AppRoutes() {
    return (
        // <Suspense fallback={<div style={{padding: 20}}></div>}>
        <Suspense fallback={<div style={{padding: 20}}>Loading...</div>}>
            <Routes>
                <Route path={routes.home} element={<Home />} />
                <Route path={routes.about} element={<About />} />

                {/* all Games */}
                <Route path={routes.games.all} element={<AllGamesPage />} />

                <Route path={routes.games.filteredGames} element={<FilteredGamesPage />} />
                <Route path={routes.games.providers} element={<ProvidersPage />} />
                <Route path={routes.games.topGames} element={<AllGamesPage />} />
                {/* <Route path={routes.games.topGames} element={<SearchTopGames />} /> */}
                <Route path={routes.games.turbo} element={<TurboGame />} />
                <Route path={routes.games.spribe} element={<SpribeGame />} />
                <Route path={routes.games.filteredProviderGames} element={<FilteredProviderGamesPage />} />
                <Route path={routes.pages.howToPlay} element={<HowToPlay />} />
                <Route path={routes.pages.terms} element={<TermsCondition />} />
                <Route path={routes.pages.privacyPolicy} element={<PrivacyPolicy />} />

                {/* Auth */}
                <Route path={routes.auth.login} element={<LoginPage />} />
                <Route path={routes.auth.register} element={<Register />} />
                <Route path={routes.auth.forgotPassword} element={<ForgotPassword />} />
                <Route path={routes.auth.forgotOTP} element={<ForgotOTP />} />
                <Route path={routes.auth.verifyOTP} element={<VerifyOTP />} />
                <Route path={routes.auth.newPassword} element={<NewPassword />} />

                <Route path={routes.transactions.kazang_how_to_deposit} element={<KazangHowtodeposit />} />
                <Route path={routes.transactions.deposit_namibia} element={<DepositNamibia />} />
                <Route path={routes.transactions.deposit} element={<Deposit />} />
                <Route path={routes.transactions.depositHistory} element={<DepositHistory />} />
                <Route path={routes.transactions.paymentMethod} element={<DepositMethod />} />
                <Route path={routes.transactions.ewallet_deposit_namibia} element={<DepositNamibiaEwallet />} />
                <Route path={routes.transactions.deposit_static} element={<DepositStatic />} />
                <Route path={routes.transactions.manual_deposit_history} element={<DepositManualNamibiaHistory />} />
                <Route path={routes.transactions.ewallet_deposit_history} element={<DepositEwalletNamibiaHistory />} />
                <Route path={routes.transactions.all_deposit_history} element={<AllMethodDepositHistory />} />
                <Route path={routes.transactions.kazang_deposit_voucher} element={<DepositIndexKazang />} />
                <Route path={routes.transactions.kazang_deposit_history} element={<DepositKazangNamibiaHistory />} />
                <Route path={routes.transactions.easy_wallet_deposit} element={<DepositNamibiaEasyWallet />} />
                {/* easy_wallet */}
                <Route path={routes.transactions.easy_wallet_history} element={<DepositEwalletEasyWalletHistory />} />
                {/* blue_wallet */}
                <Route path={routes.transactions.blue_wallet_deposit} element={<DepositNamibiaBlueWallet />} />
                <Route path={routes.transactions.blue_wallet_history} element={<DepositEwalletBlueWalletHistory />} />
                {/* nedBank_wallet */}
                <Route path={routes.transactions.nedbank_wallet_deposit} element={<DepositNamibiaNedBankWallet />} />
                <Route
                    path={routes.transactions.nedbank_wallet_history}
                    element={<DepositNamibiaNedBankWalletHistory />}
                />
                {/* AccessMoney_wallet */}
                <Route
                    path={routes.transactions.access_money_wallet_deposit}
                    element={<DepositNamibiaAccessMoneyWallet />}
                />
                <Route
                    path={routes.transactions.access_money_wallet_history}
                    element={<DepositNamibiaAccessMoneyWalletHistory />}
                />
                {/* India  */}
                <Route path={routes.transactions.manual_deposit_India} element={<DepositIndexIndia />} />

                {/* Protected Routes */}
                <Route path={routes.games.history} element={<BetHistory />} />
                {/* <Route element={<ProtectedRoute />}>
                 */}
                <Route path={routes.transactions.withdrawHistory} element={<WithdrawHistory />} />

                <Route path={routes.transactions.withdrawMethod} element={<WithdrawMethod />} />

                <Route path={routes.transactions.addBank} element={<AddBank />} />
                {/* ================================================================ */}
                {/* <Route path={routes.transactions.withdraw} element={<Withdraw />} /> */}
                <Route path={routes.games.gift_envelope} element={<Envelope />} />

                <Route path={routes.transactions.withdraw} element={<WithdrawIndex />} />
                <Route path={routes.transactions.withdrawWallet} element={<WithdrawMethodIndex />} />

                <Route path={routes.transactions.manual_withdraw_namibia} element={<WithdrawIndexNamibia />} />

                <Route path={routes.transactions.all_depositHistory} element={<GlobalDepositHistory />} />
                <Route path={routes.transactions.all_withdrawHistory} element={<AllWithdrawHistory />} />

                {/* WithdrawHistoryNamibia */}
                <Route
                    path={routes.transactions.manual_withdraw_Namibia_history}
                    element={<WithdrawHistoryNamibia />}
                />
                <Route path={routes.transactions.manual_withdraw_india} element={<WithdrawIndexIndia />} />
                <Route path={routes.profile.main} element={<Profile />} />
                <Route path={routes.profile.edit} element={<ProfileEdit />} />
                <Route path={routes.profile.changePassword} element={<ChangePassword />} />
                <Route path={routes.profile.avatar} element={<Avatar />} />
                <Route path={routes.account.dashboard} element={<AccountDashboard />} />
                <Route path={routes.account.dashboard_desktop} element={<AccountDashboardDesktop />} />
                {/* 404 */}
                <Route path="*" element={<div style={{padding: 20}}>404 - Not Found</div>} />
                <Route path={routes.pages.menu} element={<Menu />} />
            </Routes>
        </Suspense>
    );
}
