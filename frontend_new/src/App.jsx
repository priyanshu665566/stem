import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CityView from "./pages/CityView";
import CityMapper from "./pages/CityMapper";


function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {!isHomePage && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/city/:slug' element={<CityView />} />
        <Route path='/city-mapper/:cityId' element={<CityMapper />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
