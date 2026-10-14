import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import DetailPage from "./pages/DetailPage";
import ListPage from "./pages/ListPage";
import PortfolioPage from "./pages/PortfolioPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/startups/:id" element={<DetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
