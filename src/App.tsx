import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
import { Menu } from './components/Menu';
import { Space } from './components/Space';
import { Experience } from './components/Experience';
import { Reservation } from './components/Reservation';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Admin } from './components/Admin';
<<<<<<< HEAD
import { ToastProvider } from './components/Toast';
=======
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}

function App() {
  const hash = useHashRoute();
  const isAdmin = hash.startsWith('#admin');

  const handleNav = (href: string) => {
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isAdmin) {
<<<<<<< HEAD
    return (
      <ToastProvider>
        <Admin />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Header onNav={handleNav} />
        <main>
          <Hero onNav={handleNav} />
          <Story />
          <Menu onNav={handleNav} />
          <Space />
          <Experience />
          <Reservation />
          <Contact />
        </main>
        <Footer onNav={handleNav} />
      </div>
    </ToastProvider>
=======
    return <Admin />;
  }

  return (
    <div className="min-h-screen">
      <Header onNav={handleNav} />
      <main>
        <Hero onNav={handleNav} />
        <Story />
        <Menu onNav={handleNav} />
        <Space />
        <Experience />
        <Reservation />
        <Contact />
      </main>
      <Footer onNav={handleNav} />
    </div>
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
  );
}

export default App;
