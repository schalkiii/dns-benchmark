import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FileProvider } from "./contexts/FileContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Overview from "./pages/Overview";
import Analyze from "./components/Analyze";
import DnsSources from "./pages/DnsSources";

const App = () => {
  return (
    <BrowserRouter>
      <FileProvider>
        <div id="app" className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/sources" element={<DnsSources />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </FileProvider>
    </BrowserRouter>
  );
};

export default App;