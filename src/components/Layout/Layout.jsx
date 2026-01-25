import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getRedirectPathByRole } = useAuth();

  // AUTO-REDIRECT LOGIC: Cegah user yang sudah login mengakses home
  useEffect(() => {
    if (user) {
      const currentPath = location.pathname;
      const redirectPath = getRedirectPathByRole(user.role);

      // Hanya redirect jika user mengakses homepage ("/" atau "/home")
      // dan role-nya seharusnya tidak di homepage
      if (
        (currentPath === "/" || currentPath === "/home") &&
        redirectPath !== "/"
      ) {
        console.log(
          `Layout - Redirecting ${user.role} from ${currentPath} to ${redirectPath}`,
        );
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, location.pathname, navigate, getRedirectPathByRole]);

  // Handle page transition
  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Add transition class to body
    document.body.classList.add("page-transition-active");
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
          className="flex-grow relative z-10">
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Layout;
