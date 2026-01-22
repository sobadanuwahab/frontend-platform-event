import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, LogOut, Trophy, Menu, X, Loader } from "lucide-react"; // Tambahkan Loader
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth(); // Tambahkan loading dari useAuth
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationTimeoutRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navItems = [
    {
      to: "/",
      label: "Beranda",
      roles: ["user", "juri", "admin"],
    },
    {
      to: "/voting",
      label: "Voting",
      roles: ["user"],
    },
    {
      to: "/ticket",
      label: "Ticket",
      roles: ["user"],
    },
    {
      to: "/judging",
      label: "Penjurian",
      roles: ["juri"],
    },
    {
      to: "/results",
      label: "Hasil",
      roles: ["user", "juri"],
    },
    // {
    //   to: "/admin",
    //   label: "Admin",
    //   roles: ["admin"],
    // },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Debug: Log when user changes
  useEffect(() => {
    console.log("Header - User updated:", user);
    console.log("Header - Loading:", loading);
  }, [user, loading]);

  // Gunakan loading state untuk menentukan currentRole
  const currentRole = (() => {
    if (loading) {
      console.log("Header - Still loading, using guest role temporarily");
      return "guest";
    }
    return user?.role ?? "guest";
  })();

  console.log("Header - Final currentRole:", currentRole);

  const handleNavigation = (to) => {
    if (location.pathname === to) {
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      return;
    }

    setIsNavigating(true);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);

    setTimeout(() => {
      navigate(to);
      setIsNavigating(false);
    }, 200);
  };

  const handleLogin = () => {
    handleNavigation("/auth/login");
  };

  const handleLogout = () => {
    logout();
    handleNavigation("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileNavItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  // Jika masih loading, tampilkan header sederhana
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-2 sm:py-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative rounded-lg sm:rounded-2xl p-2 sm:p-3 bg-red-600">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm sm:text-base md:text-xl">
                  Lomba Paskibra 2026
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <Loader className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 transition-all duration-300 w-full
          ${scrolled ? "bg-white shadow-md" : "bg-red-700"}
          ${isMobileMenuOpen ? "bg-white" : ""}
        `}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-2 sm:py-3">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation("/")}
                className={`
                  relative rounded-lg sm:rounded-2xl p-2 sm:p-3 transition-all duration-300 cursor-pointer
                  ${scrolled ? "bg-red-600" : "bg-white"}
                  ${isMobileMenuOpen ? "bg-red-600" : ""}
                `}>
                <Trophy
                  size={scrolled || isMobileMenuOpen ? 24 : 28}
                  className={`
                    ${scrolled ? "text-white" : "text-red-600"}
                    ${isMobileMenuOpen ? "text-white" : ""}
                    sm:size-6 md:size-8
                  `}
                />
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              </motion.div>
              <div className="max-w-[140px] sm:max-w-none">
                <motion.h1
                  whileHover={{ x: 5 }}
                  onClick={() => handleNavigation("/")}
                  className={`
                    font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl
                    ${scrolled ? "text-gray-900" : "text-white"}
                    ${isMobileMenuOpen ? "text-gray-900" : ""}
                  `}>
                  Lomba Paskibra 2026
                </motion.h1>
                <p
                  className={`
                    text-xs sm:text-sm transition-all duration-300 hidden sm:block
                    ${scrolled ? "text-gray-600" : "text-red-100"}
                    ${isMobileMenuOpen ? "text-gray-600" : ""}
                  `}>
                  Kreasi • Prestasi • Kebanggaan
                </p>
              </div>
            </div>

            {/* Desktop Navigation + User Section */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {/* Navigation */}
              <nav className="flex items-center space-x-1">
                {navItems
                  .filter((item) => item.roles.includes(currentRole))
                  .map((item, index) => (
                    <motion.div key={item.to} whileHover={{ scale: 1.05 }}>
                      <NavLink
                        to={item.to}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(item.to);
                        }}
                        onMouseEnter={() => setHoveredNav(index)}
                        onMouseLeave={() => setHoveredNav(null)}
                        className={({ isActive }) => `
                          relative px-3 lg:px-4 py-2 font-medium transition-all duration-300
                          ${
                            scrolled
                              ? isActive
                                ? "text-red-600"
                                : "text-gray-800 hover:text-gray-900"
                              : isActive
                                ? "text-white"
                                : "text-white/90 hover:text-white"
                          }
                        `}>
                        {item.label}
                      </NavLink>
                    </motion.div>
                  ))}
              </nav>

              {/* User Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="h-6 lg:h-8 w-px bg-gray-300"></motion.div>

              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2 lg:space-x-3">
                  <div className="text-right hidden lg:block">
                    <p
                      className={`font-medium text-xs lg:text-sm transition-all duration-300 ${
                        scrolled ? "text-gray-900" : "text-white"
                      }`}>
                      {user.name}
                    </p>
                    <p
                      className={`text-xs transition-all duration-300 ${
                        scrolled ? "text-gray-500" : "text-red-100"
                      }`}>
                      {user.role}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-red-600 flex items-center justify-center text-white font-semibold shadow-md text-xs lg:text-sm">
                      {user.avatar || <User size={14} className="lg:size-5" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="group relative overflow-hidden rounded-lg lg:rounded-xl px-2 py-2 lg:px-3 lg:py-2 bg-white/20 hover:bg-red-500/30 transition-all duration-300"
                    title="Logout">
                    <LogOut
                      size={14}
                      className={`
                        ${
                          scrolled
                            ? "text-gray-600 group-hover:text-red-600"
                            : "text-white group-hover:text-red-200"
                        }
                        lg:size-5
                      `}
                    />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className="group relative overflow-hidden rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 bg-white text-red-600 font-medium hover:bg-red-50 hover:shadow-lg transition-all duration-300 border border-red-600 text-xs lg:text-sm">
                  <span className="relative flex items-center space-x-1 lg:space-x-2">
                    <User size={14} className="lg:size-4" />
                    <span>Login</span>
                  </span>
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className={`
                md:hidden p-2 rounded-lg transition-all duration-300
                ${
                  scrolled
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-white/20 hover:bg-white/30"
                }
                ${isMobileMenuOpen ? "bg-gray-200" : ""}
              `}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? (
                <X
                  size={20}
                  className={
                    scrolled || isMobileMenuOpen
                      ? "text-gray-700"
                      : "text-white"
                  }
                />
              ) : (
                <Menu
                  size={20}
                  className={scrolled ? "text-gray-700" : "text-white"}
                />
              )}
            </motion.button>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/50 md:hidden z-40 mt-16"
                />

                {/* Mobile Menu */}
                <motion.div
                  ref={mobileMenuRef}
                  variants={mobileMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="fixed top-16 left-0 right-0 bg-white shadow-lg md:hidden z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
                  <div className="px-4 py-4">
                    {/* Mobile Navigation Items */}
                    <nav className="space-y-1 mb-6">
                      {navItems
                        .filter((item) => item.roles.includes(currentRole))
                        .map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(item.to);
                            }}
                            className={({ isActive }) => `
                              flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 font-medium
                              ${
                                isActive
                                  ? "bg-red-600 text-white"
                                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                              }
                            `}>
                            <span>{item.label}</span>
                          </NavLink>
                        ))}
                    </nav>

                    {/* Mobile User Section */}
                    {user ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-semibold shadow-md">
                              {user.avatar || (
                                <User size={20} className="sm:size-6" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                              {user.name}
                            </p>
                            <p className="text-gray-500 text-xs sm:text-sm truncate">
                              {user.role}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl bg-gray-100 hover:bg-red-500/10 transition-colors flex-shrink-0"
                            title="Logout">
                            <LogOut size={18} className="text-gray-600" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-center space-x-2 text-sm sm:text-base">
                          <User size={18} className="sm:size-5" />
                          <span>Login / Daftar</span>
                        </div>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;
