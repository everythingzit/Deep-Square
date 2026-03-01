import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Game from './components/Game.jsx'
import Play from './pages/Play.jsx'
import History from './pages/History.jsx'
import Analytics from './pages/Analytics.jsx'
import Wiki from './pages/Wiki.jsx'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import "./main.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Play />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/wiki" element={<Wiki />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>
)