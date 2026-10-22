import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AccountProvider } from "./account";
import Footer from "./components/Footer";
import Header from "./components/Header";
import DetailPage from "./pages/DetailPage";
import HistoryPage from "./pages/HistoryPage";
import ListPage from "./pages/ListPage";
import PortfolioPage from "./pages/PortfolioPage";

export default function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <div className="app">
          <Header />
          <div className="content">
            <Routes>
              <Route path="/" element={<ListPage />} />
              <Route path="/startups/:id" element={<DetailPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AccountProvider>
    </BrowserRouter>
  );
}
