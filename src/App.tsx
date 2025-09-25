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
  return (
    <main className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      <NavBar />
      <Hero />
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
