// components/Layout/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const Layout = () => {
  const location = useLocation();

  // Handle page transition
  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);

    // Add transition class to body
    document.body.classList.add("page-transition-active");

    // Remove class after transition
    const timer = setTimeout(() => {
      document.body.classList.remove("page-transition-active");
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Main Content with Smooth Transition */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="flex-grow">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <Outlet />
          </div>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Layout;
