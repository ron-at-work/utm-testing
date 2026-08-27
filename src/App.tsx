import { BrowserRouter, Routes, Route } from "react-router-dom";
import GoogleAds from "./pages/GoogleAds";
import College from "./pages/College";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GoogleAds />} />
        <Route path="/college" element={<College />} />
      </Routes>
    </BrowserRouter>
  );
}
