import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  LogOut,
  Trophy,
  Menu,
  X,
  Loader,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  const navItems = [
    {
      to: "/",
      label: "Home",
      roles: ["user", "juri", "guest"],
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
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      roles: ["admin"],
    },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    // Set initial state
    setScrolled(window.scrollY > 0);
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

  const currentRole = user?.role ?? "guest";

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

  // Jika masih loading, tampilkan header sederhana
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative rounded-lg sm:rounded-2xl p-2 sm:p-3 bg-gradient-to-r from-red-600 to-pink-600">
                <Trophy size={24} className="text-white" />
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-white text-sm sm:text-base md:text-xl">
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
          bg-gray-900
          ${scrolled ? "bg-gray-900/95 backdrop-blur-md border-b border-gray-800" : "border-b border-gray-900"}
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation("/")}
                className={`
                  relative rounded-lg sm:rounded-2xl p-2 sm:p-3 transition-all duration-300 cursor-pointer
                  bg-gradient-to-r from-red-600 to-pink-600
                  hover:from-red-700 hover:to-pink-700
                  shadow-lg hover:shadow-xl
                `}
              >
                <Trophy size={24} className="text-white" />
                {/* Live Badge */}
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              </motion.div>
              <div className="max-w-[140px] sm:max-w-none">
                <motion.h1
                  whileHover={{ x: 5 }}
                  onClick={() => handleNavigation("/")}
                  className={`
                    font-bold transition-all duration-300 cursor-pointer text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl
                    bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300
                    hover:from-red-400 hover:to-pink-400
                  `}
                >
                  Paskibra Championship 2026
                </motion.h1>
                <p
                  className={`
                    text-xs sm:text-sm transition-all duration-300 hidden sm:block
                    text-gray-300
                  `}
                >
                  Platform Voting Nasional • Real-time • Terpercaya
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
                      <div className="relative">
                        <NavLink
                          to={item.to}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigation(item.to);
                          }}
                          className={({ isActive }) => `
                            relative px-3 lg:px-4 py-2 font-medium transition-all duration-300 rounded-lg
                            ${
                              isActive
                                ? "text-white bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30"
                                : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                            }
                            group
                          `}
                        >
                          {({ isActive }) => (
                            <>
                              {item.label}
                              {isActive && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                              )}
                            </>
                          )}
                        </NavLink>
                      </div>
                    </motion.div>
                  ))}
              </nav>

              {/* User Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="h-6 lg:h-8 w-px bg-gray-700"
              ></motion.div>

              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2 lg:space-x-3"
                >
                  <div className="text-right hidden lg:block">
                    <p className="font-medium text-white text-xs lg:text-sm">
                      {user.name}
                    </p>
                    <p className="text-gray-400 text-xs">Role: {user.role}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-md text-xs lg:text-sm">
                      <User size={14} className="lg:size-5" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-gray-900 group-hover:border-red-500 transition-colors"></div>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="group relative overflow-hidden rounded-lg lg:rounded-xl px-2 py-2 lg:px-3 lg:py-2 bg-gray-800 hover:bg-red-600/30 transition-all duration-300 border border-gray-700 hover:border-red-500"
                    title="Logout"
                  >
                    <LogOut
                      size={14}
                      className="text-gray-400 group-hover:text-red-400 lg:size-5"
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
                  className="group relative overflow-hidden rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium hover:from-red-700 hover:to-pink-700 hover:shadow-lg transition-all duration-300 text-xs lg:text-sm"
                >
                  <span className="relative flex items-center space-x-1 lg:space-x-2">
                    <Zap size={14} className="lg:size-4" />
                    <span>Login / Register</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className={`
                md:hidden p-2 rounded-lg transition-all duration-300
                bg-gray-800 hover:bg-gray-700 border border-gray-700
                ${isMobileMenuOpen ? "bg-gray-700" : ""}
              `}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-gray-300" />
              ) : (
                <Menu size={20} className="text-gray-300" />
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
                  className="fixed inset-0 bg-black/70 md:hidden z-40 mt-16 backdrop-blur-sm"
                />

                {/* Mobile Menu */}
                <motion.div
                  ref={mobileMenuRef}
                  variants={mobileMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="fixed top-16 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl md:hidden z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
                >
                  <div className="px-4 py-6">
                    {/* Mobile Navigation Items */}
                    <nav className="space-y-2 mb-8">
                      {navItems
                        .filter((item) => item.roles.includes(currentRole))
                        .map((item) => (
                          <motion.div
                            key={item.to}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <NavLink
                              to={item.to}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavigation(item.to);
                              }}
                              className={({ isActive }) => `
                                flex items-center justify-between p-4 rounded-xl transition-all duration-300 font-medium
                                ${
                                  isActive
                                    ? "bg-gradient-to-r from-red-600/30 to-pink-600/30 text-white border border-red-500/30"
                                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }
                              `}
                            >
                              {({ isActive }) => (
                                <>
                                  <span>{item.label}</span>
                                  {isActive && (
                                    <Sparkles
                                      size={16}
                                      className="text-yellow-400"
                                    />
                                  )}
                                </>
                              )}
                            </NavLink>
                          </motion.div>
                        ))}
                    </nav>

                    {/* Mobile User Section */}
                    {user ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-lg">
                              <User size={24} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-lg">
                              {user.name}
                            </p>
                            <p className="text-gray-400 text-sm">{user.role}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="p-3 rounded-xl bg-gray-700 hover:bg-red-600/20 transition-colors border border-gray-600 hover:border-red-500"
                            title="Logout"
                          >
                            <LogOut
                              size={20}
                              className="text-gray-300 hover:text-red-400"
                            />
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
                        className="w-full py-4 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 hover:shadow-xl transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-center space-x-3 text-lg">
                          <Zap
                            size={24}
                            className="group-hover:rotate-12 transition-transform"
                          />
                          <span>Login / Register</span>
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
