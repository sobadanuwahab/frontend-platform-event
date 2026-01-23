import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Sparkles } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Handle page transition
  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Show loading state briefly for smooth transition
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    // Add transition class to body
    document.body.classList.add("page-transition-active");

    // Remove class after transition
    const cleanupTimer = setTimeout(() => {
      document.body.classList.remove("page-transition-active");
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
    };
  }, [location.pathname]);

  // Loading animation
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
      y: 20,
    },
    in: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      scale: 1.02,
      y: -20,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-black to-black">
      {/* Background decorative elements - DI BAWAH header */}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md z-[9999] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full mx-auto"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Trophy className="text-red-500" size={32} />
                  </motion.div>
                </div>
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{ y: [0, -10, 0], rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="text-yellow-500" size={20} />
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4"
                  animate={{ y: [0, 10, 0], rotate: [0, -360] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                >
                  <Sparkles className="text-purple-500" size={16} />
                </motion.div>
              </div>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-gray-300 font-medium text-lg"
              >
                Memuat halaman...
              </motion.p>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-gray-500 text-sm"
              >
                Siapkan diri untuk pengalaman luar biasa!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* Main Content - tanpa pt-16 di sini, biar komponen handle sendiri */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={pageTransition}
          className="flex-grow relative z-10"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Layout;
