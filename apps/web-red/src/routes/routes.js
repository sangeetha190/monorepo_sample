// ✅ path constants (your object)

const routes = {
  home: "/",
  about: "/about",
  games: {
    all: "/all-games",
    topGames: "/top-games",
    turbo: "/turbo-games",
    spribe: "/spribe-games",
    providers: "/providers",
    history: "/transaction-history",
    bonus: "/bonus",
    filteredGames: "/filtered-games",
    filteredProviderGames: "/filtered-provider-games",
    // filteredAllGames: "/all-games",
    envelope: "/claim-bonus",
    gift_envelope: "/gift_envelope",
  },
  transactions: {
    withdraw: "/withdraw",
    deposit: "/deposit",
    paymentMethod: "/payment-method",

    withdrawWallet: "/withdraw-wallet",

    withdrawMethod: "/withdraw-method",
    deposit_static: "/deposit_static",
    withdrawHistory: "/withdraw-history",
    depositHistory: "/deposit-history",
    addBank: "/add-bank",
// AllWithdrawHistory
    // namibia
    deposit_namibia: "/deposit-namibia/manual-deposit/get-payment-details",

    manual_withdraw_namibia: "/manual-withdraw-namibia",

    manual_withdraw_india: "/manual-withdraw-india",

    manual_deposit_history: "/deposit-namibia-manual-history",

    ewallet_deposit_namibia:
      "/deposit-namibia/ewallet-deposit/get-payment-details",
    ewallet_deposit_history: "/deposit-namibia-ewallet-history",

    all_deposit_history: "/deposit_history",
    all_depositHistory: "/all_deposit_history",

    all_withdrawHistory: "/all_withdraw_history",

    // Kazang
    kazang_deposit_voucher: "/deposit-namibia-kazang",
    kazang_deposit_history: "/Voucher-Deposit-History",
    kazang_how_to_deposit: "/How-to-deposit",

    // India
    manual_deposit_India: "/manual-deposit-india",
    manual_withdraw_India: "/manual-withdraw-india",
    manual_withdraw_Namibia_history:
      "/withdraw-namibia/manual-withdraw/history",

    // easy-wallet
    easy_wallet_deposit:
      "/deposit-namibia/easy-wallet-deposit/get-payment-details",
    easy_wallet_history: "/deposit-namibia-easy-wallet-history",

    // blue-wallet
    blue_wallet_deposit:
      "/deposit-namibia/blue-wallet-deposit/get-payment-details",
    blue_wallet_history: "/deposit-namibia/blue-wallet-history",

    // nedBank-wallet
    nedbank_wallet_deposit:
      "/deposit-namibia/nedbank-wallet-deposit/get-payment-details",
    nedbank_wallet_history: "/deposit-namibia/nedbank-wallet-history",

    // Access-wallet
    access_money_wallet_deposit:
      "/deposit-namibia/access-money-wallet-deposit/get-payment-details",
    access_money_wallet_history: "/deposit-namibia/access-money-wallet-history",
  },
  account: {
    dashboard: "/account-dashboard",
    dashboard_desktop: "/account/manager",
  },
  profile: {
    main: "/profile",
    edit: "/profile-edit",
    changePassword: "/change-password",
    avatar: "/select-avatar",
  },
  auth: {
    starting: "/starting-page",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    forgotOTP: "/forgototp",
    verifyOTP: "/verify-otp",
    newPassword: "/enter-new-password",
  },
  pages: {
    privacyPolicy: "/privacy-policy",
    terms: "/terms-conditions",
    howToPlay: "/how-to-play",
    referEarn: "/refer-earn",
    slider: "/starting-slider",
    userEnter: "/user-enter",
    menu: "/menu",
    provider: "/provider",
    privacy: "/privacy",
    responsiblegame: "/responsiblegame",
    Restrict: "/restricted",
    // This is the new route for your "Testing app" badge
    testinginfo: "/testinginfo", // ✔ Route path
  },
};

export default routes;


