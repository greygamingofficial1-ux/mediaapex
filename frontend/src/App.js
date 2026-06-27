import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";

import LuxuryCursor from "@/components/LuxuryCursor";
import CinematicLoader from "@/components/CinematicLoader";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import Services from "@/sections/Services";
import Portfolio from "@/sections/Portfolio";
import Process from "@/sections/Process";
import Clients from "@/sections/Clients";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";
import ApexChat from "@/components/ApexChat";

function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <Process />
      <Clients />
      <Contact />
      <Footer />
    </main>
  );
}

function App() {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="App grain">
      <LuxuryCursor />
      <CinematicLoader onComplete={() => setLoaded(true)} />
      {loaded && (
        <SmoothScroll>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
            <ApexChat />
          </BrowserRouter>
        </SmoothScroll>
      )}
    </div>
  );
}

export default App;
