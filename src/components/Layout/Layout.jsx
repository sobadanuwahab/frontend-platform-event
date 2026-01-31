import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Cek apakah user boleh menggunakan layout ini
  useEffect(() => {
    if (!loading) {
      // Jika user memiliki role yang menggunakan dashboard khusus
      const specialRoles = ["admin", "juri", "organizer"];

      if (user && specialRoles.includes(user.role)) {
        // User dengan role khusus, redirect ke dashboard mereka
        const redirectPaths = {
          admin: "/admin/dashboard",
          juri: "/judging",
          organizer: "/organizer",
        };

        const redirectPath = redirectPaths[user.role] || "/";
        console.log(`Layout - Redirecting ${user.role} to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
        setShouldRender(false);
      } else {
        // Guest atau user biasa, boleh render layout
        setShouldRender(true);
      }

      setIsChecking(false);
    }
  }, [user, loading, navigate]);

  // Handle page transition hanya untuk route yang diizinkan
  useEffect(() => {
    if (shouldRender && location.pathname) {
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Add transition class to body
      document.body.classList.add("page-transition-active");
    }
  }, [location.pathname, shouldRender]);

  // Loading animation dengan tema Bariskreasi hijau
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

  // Tampilkan loading selama pengecekan
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">
            Memuat Bariskreasi...
          </p>
          <p className="text-green-600 text-sm mt-2">
            Wadah Kreasi Baris Berbaris Indonesia
          </p>
        </div>
      </div>
    );
  }

  // Jika user dengan role khusus, jangan render layout ini
  if (!shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">
            Mengarahkan ke dashboard...
          </p>
          <p className="text-green-600 text-sm mt-2">
            Anda akan diarahkan ke panel khusus {user?.role}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />

      {/* Main Content */}
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
