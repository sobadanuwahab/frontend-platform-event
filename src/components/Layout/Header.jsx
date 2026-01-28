import { useAuth } from "../../context/AuthContext";
import { User, LogOut, Menu, X, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import LogoImage from "../../assets/images/logo.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname.includes("/auth");

  // Menu items untuk navigation
  const navItems = [
    {
      to: "/",
      label: "HOME",
    },
    {
      to: "/voting",
      label: "VOTING",
    },
    {
      to: "/ticket",
      label: "TICKET",
    },
    {
      to: "/results",
      label: "HASIL",
    },
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    setScrolled(window.scrollY > 0);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
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

  const handleNavigation = (to) => {
    if (location.pathname === to) return;

    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    navigate(to);
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

  // Menutup mobile menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`
        sticky top-0 z-50 transition-all duration-300 w-full
        bg-black border-b border-gray-800
        ${scrolled ? "bg-black/95 backdrop-blur-sm" : ""}
      `}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Brand */}
          <div
            onClick={handleBackToHome}
            className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <img
                src={LogoImage}
                alt="Votix Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="font-black text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-200">
                  VOT
                </span>
                <span className="text-teal-400">I</span>
                <span className="text-orange-400">X</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base mt-1 text-gray-300 leading-tight font-medium tracking-wide">
                Voting & Event Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation + User Section */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Jika di halaman auth, tampilkan tombol kembali ke home */}
            {isAuthPage ? (
              <button
                onClick={handleBackToHome}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-700 transition-all duration-200 text-sm flex items-center space-x-2 shadow-lg active:scale-[0.98]">
                <ArrowLeft size={16} />
                <span>KE HOME</span>
              </button>
            ) : (
              <>
                {/* Navigation Menu - hanya untuk guest atau user biasa */}
                {(user?.role === "user" || !user) && (
                  <nav className="flex items-center space-x-1 mr-6">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `relative px-4 py-2 font-bold text-sm uppercase tracking-wider 
                           transition-colors duration-200 rounded-lg
                           ${
                             isActive
                               ? "text-white bg-gradient-to-r from-teal-600/20 to-cyan-600/20"
                               : "text-gray-400 hover:text-white hover:bg-gray-800"
                           }`
                        }>
                        {({ isActive }) => (
                          <>
                            <span className="relative z-10">{item.label}</span>
                            {isActive && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </nav>
                )}

                {/* Separator */}
                <div className="h-8 w-px bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700"></div>

                {/* User Section */}
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-white text-sm">
                        {user.name}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg">
                      <User size={18} />
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 text-sm flex items-center space-x-2 shadow-lg active:scale-[0.98]">
                      <LogOut size={16} />
                      <span>LOGOUT</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLogin}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-700 transition-all duration-200 text-sm shadow-lg active:scale-[0.98]">
                      LOGIN
                    </button>
                    <button
                      onClick={handleRegister}
                      className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-600 text-white font-bold rounded-lg hover:from-teal-700 hover:to-teal-700 transition-all duration-200 text-sm shadow-lg active:scale-[0.98]">
                      REGISTER
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`
              md:hidden p-2.5 rounded-lg transition-all duration-200
              bg-gray-800 hover:bg-gray-700 border border-gray-700
              ${isMobileMenuOpen ? "bg-gray-700" : ""}
              active:scale-[0.98]
            `}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}>
            {isMobileMenuOpen ? (
              <X size={22} className="text-gray-300" />
            ) : (
              <Menu size={22} className="text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-20 bg-black/95 md:hidden z-40 mobile-menu-container">
            <div className="px-6 py-8 h-full overflow-y-auto">
              {/* Jika di halaman auth, tampilkan tombol kembali */}
              {isAuthPage ? (
                <button
                  onClick={handleBackToHome}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-3 mb-6 shadow-lg active:scale-[0.98]">
                  <ArrowLeft size={22} />
                  <span className="text-lg">KE HOME</span>
                </button>
              ) : (
                <>
                  {/* Mobile Navigation Menu - hanya untuk guest atau user biasa */}
                  {(user?.role === "user" || !user) && (
                    <div className="mb-8">
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">
                        NAVIGASI
                      </p>
                      <nav className="space-y-2">
                        {navItems.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `block p-3 rounded-xl transition-colors duration-200 font-bold text-lg
                               uppercase tracking-wider text-center
                               ${
                                 isActive
                                   ? "text-white bg-gradient-to-r from-teal-600 to-cyan-600"
                                   : "text-gray-300 hover:text-white hover:bg-gray-800"
                               }`
                            }>
                            {item.label}
                          </NavLink>
                        ))}
                      </nav>
                      <div className="border-t border-gray-800 my-6"></div>
                    </div>
                  )}

                  {/* Mobile User Section */}
                  {user ? (
                    <div className="p-5 rounded-xl bg-gray-800/80 border border-gray-700 mb-6">
                      <div className="flex items-center space-x-4 mb-5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg">
                          <User size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-lg">
                            {user.name}
                          </p>
                          <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg active:scale-[0.98]">
                        <LogOut size={22} />
                        <span className="text-lg">LOGOUT</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={handleLogin}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-700 transition-all duration-200 text-lg shadow-lg active:scale-[0.98]">
                        LOGIN
                      </button>
                      <button
                        onClick={handleRegister}
                        className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-teal-700 transition-all duration-200 text-lg shadow-lg active:scale-[0.98]">
                        REGISTER
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
