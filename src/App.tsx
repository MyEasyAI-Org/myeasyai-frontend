import { useState } from "react";
import "./App.css";
import { Courses } from "./components/Courses";
import { Features } from "./components/Features";
import { FinalCta } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { MidStats } from "./components/MidStats";
import NavBar from "./components/NavBar";
import { Preview } from "./components/Preview";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const openSignup = () => setIsSignupOpen(true);
  const closeSignup = () => setIsSignupOpen(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      <NavBar onLoginClick={openLogin} onSignupClick={openSignup} />
      <Hero
        isLoginOpen={isLoginOpen}
        onOpenLogin={openLogin}
        onCloseLogin={closeLogin}
        isSignupOpen={isSignupOpen}
        onOpenSignup={openSignup}
        onCloseSignup={closeSignup}
      />
      <Features />
      <Preview />
      <MidStats />
      <Courses />
      <FinalCta />
      <Footer />
    </main>
  );
}

export default App;
