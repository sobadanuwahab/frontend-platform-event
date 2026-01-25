import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Zap,
  ArrowLeft,
  Home,
  Vote,
  Ticket,
  Gavel,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LogoImage from "../../assets/images/logo.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  // Cek apakah di halaman auth
  const isAuthPage = location.pathname.includes("/auth");

  // DEBUG: Log user data untuk troubleshooting
  useEffect(() => {
    if (user) {
      console.log("=== HEADER DEBUG ===");
      console.log("User role:", user.role);
      console.log("Location:", location.pathname);
    }
  }, [user, location]);

  // Nav items berdasarkan role - DISESUAIKAN DENGAN PERMINTAAN
  const navItems = [
    // Role USER - tampilkan semua menu
    {
      to: "/",
      label: "Home",
      roles: ["user"],
      icon: Home,
    },
    {
      to: "/voting",
      label: "Voting",
      roles: ["user"],
      icon: Vote,
    },
    {
      to: "/ticket",
      label: "Ticket",
      roles: ["user"],
      icon: Ticket,
    },
    {
      to: "/results",
      label: "Hasil",
      roles: ["user"],
      icon: BarChart3,
    },

    // Role ORGANIZER - hanya home/back to dashboard
    {
      to: "/organizer",
      label: "Dashboard Organizer",
      roles: ["organizer"],
      icon: LayoutDashboard,
    },

    // Role JURI - hanya home dan judging
    {
      to: "/",
      label: "Home",
      roles: ["juri"],
      icon: Home,
    },
    {
      to: "/judging",
      label: "Penjurian",
      roles: ["juri"],
      icon: Gavel,
    },

    // Role ADMIN - hanya home dan admin dashboard
    {
      to: "/",
      label: "Home",
      roles: ["admin"],
      icon: Home,
    },
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      roles: ["admin"],
      icon: LayoutDashboard,
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

  // Normalize role
  const normalizeRole = (role) => {
    if (!role) return "guest";

    const roleLower = role.toLowerCase().trim();

    // Mapping yang konsisten dengan AuthContext
    const roleMap = {
      judge: "juri",
      juri: "juri",
      admin: "admin",
      user: "user",
      organizer: "organizer",
    };

    return roleMap[roleLower] || roleLower;
  };

  const currentRole = normalizeRole(user?.role);

  // Filter nav items berdasarkan role user
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(currentRole),
  );

  // Untuk role tertentu, kita mungkin hanya ingin menunjukkan 1-2 menu
  const shouldShowNavigation = () => {
    if (!user) return false;

    // Role user tampilkan semua navigation
    if (currentRole === "user") return true;

    // Role lain hanya tampilkan jika ada lebih dari 1 item
    return filteredNavItems.length > 0;
  };

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

  const handleRegister = () => {
    handleNavigation("/auth/register");
  };

  const handleLogout = () => {
    logout();
    handleNavigation("/");
  };

  const handleBackToHome = () => {
    handleNavigation("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  // Function untuk menentukan apakah user di halaman dashboard mereka
  const isOnDashboardPage = () => {
    if (!user) return false;

    switch (currentRole) {
      case "admin":
        return location.pathname === "/admin/dashboard";
      case "organizer":
        return location.pathname.startsWith("/organizer");
      case "juri":
        return location.pathname === "/judging";
      default:
        return false;
    }
  };

  // Function untuk mendapatkan label tombol "Back to Dashboard"
  const getDashboardLabel = () => {
    switch (currentRole) {
      case "admin":
        return "Dashboard Admin";
      case "organizer":
        return "Dashboard Organizer";
      case "juri":
        return "Penjurian";
      default:
        return "Dashboard";
    }
  };

  // Function untuk mendapatkan path dashboard
  const getDashboardPath = () => {
    switch (currentRole) {
      case "admin":
        return "/admin/dashboard";
      case "organizer":
        return "/organizer";
      case "juri":
        return "/judging";
      default:
        return "/";
    }
  };

  // Jika masih loading, tampilkan header sederhana
  // if (loading) {
  //   return (
  //     <header className="sticky top-0 z-50 bg-black border-b border-black">
  //       <div className="container mx-auto px-3 sm:px-4">
  //         <div className="flex items-center justify-between py-3">
  //           <div className="flex items-center space-x-2 sm:space-x-3">
  //             <div className="relative rounded-lg sm:rounded-2xl p-2 sm:p-3 bg-gradient-to-r from-teal-600 to-cyan-600">
  //               <Trophy size={24} className="text-white" />
  //               <div className="absolute -top-1 -right-1">
  //                 <div className="relative">
  //                   <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
  //                   <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
  //                 </div>
  //               </div>
  //             </div>
  //             <div>
  //               <h1 className="font-bold text-white text-sm sm:text-base md:text-xl">
  //                 Platform Voting & Tiket 2026
  //               </h1>
  //             </div>
  //           </div>
  //           <div className="flex items-center">
  //             <Loader className="w-5 h-5 animate-spin text-gray-400" />
  //           </div>
  //         </div>
  //       </div>
  //     </header>
  //   );
  // }

  // Function untuk display role yang user-friendly
  const getDisplayRole = (role) => {
    switch (role) {
      case "juri":
        return "Juri";
      case "admin":
        return "Admin";
      case "organizer":
        return "Organizer";
      case "user":
        return "User";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  // Function untuk mendapatkan warna berdasarkan role
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return {
          bg: "bg-gradient-to-r from-red-600 to-pink-600",
          dot: "bg-red-500",
        };
      case "juri":
        return {
          bg: "bg-gradient-to-r from-purple-600 to-violet-600",
          dot: "bg-purple-500",
        };
      case "organizer":
        return {
          bg: "bg-gradient-to-r from-blue-600 to-indigo-600",
          dot: "bg-blue-500",
        };
      case "user":
      default:
        return {
          bg: "bg-gradient-to-r from-teal-600 to-cyan-600",
          dot: "bg-orange-500",
        };
    }
  };

  const roleColors = getRoleColor(currentRole);

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 transition-all duration-300 w-full
          ${isAuthPage ? "bg-black" : "bg-black"}
          ${scrolled ? "bg-black backdrop-blur-md border-b border-black" : "border-b border-black"}
        `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo & Brand */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={
                isAuthPage ? handleBackToHome : () => handleNavigation("/")
              }
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              {/* Logo Container - dengan height yang match text */}
              <div className="relative flex items-center">
                <img
                  src={LogoImage}
                  alt="Votix Logo"
                  className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                  style={{ minHeight: "2.5rem" }}
                />
              </div>

              {/* Brand Text - dengan alignment yang tepat */}
              <div className="flex flex-col justify-center h-full py-0.5">
                <h1
                  className={`
                    font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl
                    tracking-wide leading-none
                    group-hover:scale-105 transition-transform duration-300
                    flex items-center
                  `}>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-200">
                    Vo
                  </span>
                  <span className="text-teal-400 drop-shadow-[0_0_4px_rgba(45,212,191,0.5)]">
                    t
                  </span>
                  <span className="relative text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]">
                    i
                  </span>
                  <span className="text-teal-400 drop-shadow-[0_0_4px_rgba(45,212,191,0.5)]">
                    x
                  </span>
                </h1>
                <p
                  className={`
                    text-xs sm:text-sm md:text-base mt-0.5
                    ${isAuthPage ? "text-gray-400" : "text-gray-300"}
                    transition-colors duration-300
                    leading-tight font-medium tracking-wide
                  `}>
                  One Platform for Voting & Event Tickets
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation + User Section */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {/* Jika di halaman auth, tampilkan tombol kembali ke home */}
              {isAuthPage ? (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToHome}
                  className="group relative overflow-hidden rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-medium hover:from-orange-700 hover:to-orange-700 hover:shadow-lg transition-all duration-300 text-xs lg:text-sm">
                  <span className="relative flex items-center space-x-1 lg:space-x-2">
                    <ArrowLeft size={14} className="lg:size-4" />
                    <span>Kembali ke Home</span>
                  </span>
                </motion.button>
              ) : (
                <>
                  {/* Navigation khusus untuk role USER */}
                  {user &&
                    currentRole === "user" &&
                    filteredNavItems.length > 0 && (
                      <nav className="flex items-center space-x-1">
                        {filteredNavItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <motion.div
                              key={item.to}
                              whileHover={{ scale: 1.05 }}>
                              <div className="relative">
                                <NavLink
                                  to={item.to}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigation(item.to);
                                  }}
                                  className={({ isActive }) => `
                                  relative px-3 lg:px-4 py-2 font-medium transition-all duration-300 rounded-lg
                                  flex items-center gap-2
                                  ${
                                    isActive
                                      ? "text-teal-400"
                                      : "text-gray-300 hover:text-teal-300"
                                  }
                                  group
                                `}>
                                  {({ isActive }) => (
                                    <>
                                      <IconComponent
                                        size={16}
                                        className={
                                          isActive
                                            ? "text-teal-400"
                                            : "text-gray-400 group-hover:text-teal-300"
                                        }
                                      />
                                      <span className="text-sm">
                                        {item.label}
                                      </span>
                                      {isActive && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
                                      )}
                                    </>
                                  )}
                                </NavLink>
                              </div>
                            </motion.div>
                          );
                        })}
                      </nav>
                    )}

                  {/* Tombol kembali ke dashboard untuk role non-user */}
                  {user && currentRole !== "user" && !isOnDashboardPage() && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation(getDashboardPath())}
                      className="group relative overflow-hidden rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg transition-all duration-300 text-xs lg:text-sm">
                      <span className="relative flex items-center space-x-1 lg:space-x-2">
                        <ArrowLeft size={14} className="lg:size-4" />
                        <span>Kembali ke {getDashboardLabel()}</span>
                      </span>
                    </motion.button>
                  )}

                  {/* Separator hanya jika ada user */}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="h-6 lg:h-8 w-px bg-gray-700"></motion.div>
                  )}

                  {/* User Section */}
                  {user ? (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center space-x-2 lg:space-x-3">
                      <div className="text-right hidden lg:block">
                        <p className="font-medium text-white text-xs lg:text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getDisplayRole(currentRole)}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group">
                        <div
                          className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-semibold shadow-md text-xs lg:text-sm ${roleColors.bg}`}>
                          <User size={14} className="lg:size-5" />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 rounded-full border-2 border-gray-900 group-hover:border-orange-500 transition-colors ${roleColors.dot}`}></div>
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="group relative overflow-hidden rounded-lg lg:rounded-xl px-2 py-2 lg:px-3 lg:py-2 bg-orange-600 hover:bg-orange-700 transition-all duration-300"
                        title="Logout">
                        <LogOut size={14} className="text-white lg:size-5" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogin}
                        className="group relative overflow-hidden rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-medium hover:from-orange-700 hover:to-orange-700 hover:shadow-lg transition-all duration-300 text-xs lg:text-sm">
                        <span className="relative flex items-center space-x-1 lg:space-x-2">
                          <span>Login</span>
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRegister}
                        className="group relative overflow-hidden rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-teal-600 to-teal-600 text-white font-medium hover:from-teal-700 hover:to-teal-700 hover:shadow-lg transition-all duration-300 text-xs lg:text-sm">
                        <span className="relative flex items-center space-x-1 lg:space-x-2">
                          <span>Register</span>
                        </span>
                      </motion.button>
                    </motion.div>
                  )}
                </>
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
              aria-expanded={isMobileMenuOpen}>
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
                  className="fixed top-16 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl md:hidden z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
                  <div className="px-4 py-6">
                    {/* Jika di halaman auth, tampilkan tombol kembali */}
                    {isAuthPage ? (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBackToHome}
                        className="w-full py-4 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 hover:shadow-xl transition-all duration-300 mb-4 flex items-center justify-center space-x-3">
                        <ArrowLeft size={20} />
                        <span>Kembali ke Home</span>
                      </motion.button>
                    ) : (
                      <>
                        {/* Mobile Navigation Items - khusus untuk USER */}
                        {user &&
                          currentRole === "user" &&
                          filteredNavItems.length > 0 && (
                            <>
                              <div className="mb-4">
                                <p className="text-gray-400 text-sm font-medium mb-2">
                                  Navigasi
                                </p>
                                <nav className="space-y-2">
                                  {filteredNavItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                      <motion.div
                                        key={item.to}
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}>
                                        <NavLink
                                          to={item.to}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation(item.to);
                                          }}
                                          className={({ isActive }) => `
                                          flex items-center gap-3 p-4 rounded-xl transition-all duration-300 font-medium
                                          ${
                                            isActive
                                              ? "bg-gradient-to-r from-teal-600/30 to-cyan-600/30 text-white border border-teal-500/30"
                                              : "text-gray-300 hover:text-white hover:bg-gray-800"
                                          }
                                        `}>
                                          {({ isActive }) => (
                                            <>
                                              <IconComponent
                                                size={20}
                                                className={
                                                  isActive
                                                    ? "text-teal-400"
                                                    : "text-gray-400"
                                                }
                                              />
                                              <span className="flex-1">
                                                {item.label}
                                              </span>
                                              {isActive && (
                                                <Sparkles
                                                  size={16}
                                                  className="text-orange-400"
                                                />
                                              )}
                                            </>
                                          )}
                                        </NavLink>
                                      </motion.div>
                                    );
                                  })}
                                </nav>
                              </div>

                              <div className="border-t border-gray-800 my-4"></div>
                            </>
                          )}

                        {/* Tombol kembali ke dashboard untuk role non-user di mobile */}
                        {user &&
                          currentRole !== "user" &&
                          !isOnDashboardPage() && (
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                handleNavigation(getDashboardPath());
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full py-4 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl transition-all duration-300 mb-4 flex items-center justify-center space-x-3">
                              <ArrowLeft size={20} />
                              <span>Kembali ke {getDashboardLabel()}</span>
                            </motion.button>
                          )}

                        {/* Mobile User Section */}
                        {user ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                            <div className="flex items-center space-x-4 mb-4">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg ${roleColors.bg}`}>
                                  <User size={24} />
                                </div>
                                <div
                                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${roleColors.dot}`}></div>
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white text-lg">
                                  {user.name}
                                </p>
                                <p className="text-gray-300 text-sm">
                                  {getDisplayRole(currentRole)}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleLogout}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center space-x-2">
                              <LogOut size={20} />
                              <span>Logout</span>
                            </motion.button>
                          </motion.div>
                        ) : (
                          <div className="space-y-3">
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleLogin}
                              className="w-full py-4 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl transition-all duration-300 group">
                              <div className="flex items-center justify-center space-x-3 text-lg">
                                <Zap
                                  size={24}
                                  className="group-hover:rotate-12 transition-transform"
                                />
                                <span>Login</span>
                              </div>
                            </motion.button>
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleRegister}
                              className="w-full py-4 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center justify-center space-x-3 text-lg">
                                <span>Register</span>
                              </div>
                            </motion.button>
                          </div>
                        )}
                      </>
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
