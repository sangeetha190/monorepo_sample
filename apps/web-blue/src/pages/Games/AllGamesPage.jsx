import Sidebar from "../Home/Components/Header/Sidebar";
import StickyHeader from "../Home/Components/Header/Header";
import { AllGamesView } from "@repo/frontend-core";
import Footer from "../Home/Components/Footer/Footer";

export default function AllGamesPage() {
  return (
    <>
      <StickyHeader />
      <div className="container-fluid page-body-wrapper">
        <Sidebar />
        <div className="main-panel overflow-hidden">
          <div className="content-wrapper new">
            <AllGamesView/>
            <div style={{ marginTop: "100px" }} />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
