import { useAuth } from "../../context/AuthContext";
import {
  User,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Mail,
  MailCheck,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import LogoImage from "../../assets/images/logo.png";
import { checkEmailVerificationStatus } from "../../services/EmailService";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [verificationStatusLoaded, setVerificationStatusLoaded] =
    useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname.includes("/auth");
  const isVerifyPage = location.pathname.includes("/verify-email");

  // Fungsi untuk cek status verifikasi email
  const checkVerificationStatus = async () => {
    if (!user?.email) {
      setIsVerifiedUser(false);
      setVerificationStatusLoaded(true);
      return;
    }

    setIsCheckingVerification(true);
    try {
      const response = await checkEmailVerificationStatus(user.email);

      console.log("📊 Verification check result:", {
        success: response.success,
        is_verified: response.data?.is_verified,
        source: response.data?.source,
        email: user.email,
      });

      if (response.success && response.data?.is_verified === true) {
        setIsVerifiedUser(true);
        console.log("✅ User is VERIFIED");
      } else {
        setIsVerifiedUser(false);
        console.log("❌ User is NOT VERIFIED or cannot determine");
      }
    } catch (error) {
      console.error("Error checking verification status:", error);

      const localStorageVerifyFlag = localStorage.getItem(
        `email_verified_${user.email}`,
      );
      const hasVerifiedInLocalStorage = localStorageVerifyFlag === "true";

      setIsVerifiedUser(hasVerifiedInLocalStorage);

      if (hasVerifiedInLocalStorage) {
        console.log("✅ Fallback: Verified (from localStorage)");
      } else {
        console.log("❌ Fallback: Not verified");
      }
    } finally {
      setIsCheckingVerification(false);
      setVerificationStatusLoaded(true);
    }
  };

  // Debug useEffect
  useEffect(() => {
    console.log("🔍 DEBUG Header State:", {
      userEmail: user?.email,
      isVerifiedUser,
      verificationStatusLoaded,
      localStorageFlag: localStorage.getItem(`email_verified_${user?.email}`),
      userData: localStorage.getItem("user_data"),
    });
  }, [user, isVerifiedUser, verificationStatusLoaded]);

  // Cek status verifikasi saat user berubah
  useEffect(() => {
    if (user) {
      checkVerificationStatus();
    } else {
      setIsVerifiedUser(false);
      setVerificationStatusLoaded(true);
    }
  }, [user]);

  // Refresh status verifikasi setiap 30 detik jika belum verified
  useEffect(() => {
    let intervalId;

    if (user && !isVerifiedUser && verificationStatusLoaded) {
      intervalId = setInterval(() => {
        checkVerificationStatus();
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, isVerifiedUser, verificationStatusLoaded]);

  const isUnverifiedUser = user && verificationStatusLoaded && !isVerifiedUser;

  // Menu items untuk navigation - dengan kontrol akses
  const getNavItems = () => {
    const baseItems = [
      {
        to: "/",
        label: "HOME",
        alwaysShow: true,
      },
    ];

    // Menu untuk user yang belum verify
    if (isUnverifiedUser) {
      return [
        ...baseItems,
        {
          to: "/results",
          label: "HASIL",
          alwaysShow: true,
        },
        {
          to: "/verify-email",
          label: "VERIFIKASI EMAIL",
          icon: <Mail size={16} />,
          highlight: true,
          badge: (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
              !
            </span>
          ),
        },
      ];
    }

    // Menu untuk user yang sudah verify atau guest
    const verifiedItems = [
      ...baseItems,
      {
        to: "/voting",
        label: "VOTING",
        requiresVerification: true,
        badge: isVerifiedUser && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-teal-500 text-white rounded-full">
            ✓
          </span>
        ),
      },
      {
        to: "/ticket",
        label: "TICKET",
        requiresVerification: true,
        badge: isVerifiedUser && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-teal-500 text-white rounded-full">
            ✓
          </span>
        ),
      },
      {
        to: "/results",
        label: "HASIL",
        alwaysShow: true,
      },
    ];

    return verifiedItems;
  };

  const navItems = getNavItems();

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

  // Navigasi ke halaman verifikasi email
  const handleVerifyEmail = () => {
    if (isVerifyPage) return; // Jika sudah di halaman verifikasi, tidak perlu navigasi

    handleNavigation("/verify-email");
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

  // Fungsi untuk menentukan apakah menu item bisa diakses
  const canAccessMenuItem = (item) => {
    if (item.alwaysShow) return true;

    if (!user && item.requiresVerification) return false;
    if (isUnverifiedUser && item.requiresVerification) return false;

    return true;
  };

  // Fungsi untuk handle click pada menu item
  const handleMenuItemClick = (item, e) => {
    if (!canAccessMenuItem(item)) {
      e.preventDefault();
      e.stopPropagation();

      if (isUnverifiedUser && item.requiresVerification) {
        navigate("/verify-email", {
          state: {
            message:
              "Anda perlu verifikasi email terlebih dahulu untuk mengakses fitur ini",
            returnTo: item.to,
          },
        });
      } else if (!user) {
        navigate("/auth/login", {
          state: {
            returnTo: item.to,
            message: "Silakan login terlebih dahulu untuk mengakses fitur ini",
          },
        });
      }
      return;
    }

    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

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
                Voting & Tiket Event Platform
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
                {/* Navigation Menu */}
                {(user?.role === "user" || !user) && (
                  <nav className="flex items-center space-x-1 mr-6">
                    {navItems.map((item) => {
                      const accessible = canAccessMenuItem(item);
                      const isActive = location.pathname === item.to;

                      return (
                        <div
                          key={item.to}
                          className="relative group"
                          onClick={(e) => handleMenuItemClick(item, e)}>
                          <NavLink
                            to={accessible ? item.to : "#"}
                            className={`
                              relative px-4 py-2 font-bold text-sm uppercase tracking-wider 
                              transition-all duration-200 rounded-lg flex items-center gap-2
                              ${!accessible ? "cursor-not-allowed" : "cursor-pointer"}
                              ${
                                isActive
                                  ? item.highlight
                                    ? "text-white bg-gradient-to-r from-yellow-600/20 to-orange-600/20"
                                    : "text-white bg-gradient-to-r from-teal-600/20 to-cyan-600/20"
                                  : !accessible
                                    ? "text-gray-500 bg-gray-800/50"
                                    : item.highlight
                                      ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/10"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                              }
                            `}>
                            {item.icon && <span>{item.icon}</span>}
                            <span className="relative z-10 flex items-center">
                              {item.label}
                              {item.badge && item.badge}
                            </span>

                            {!accessible && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}

                            {isActive && !item.highlight && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
                            )}
                          </NavLink>

                          {/* Tooltip untuk menu yang tidak bisa diakses */}
                          {!accessible && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              {isUnverifiedUser
                                ? "Verifikasi email dulu untuk akses"
                                : "Login terlebih dahulu"}
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                      <div className="flex items-center gap-1 mt-1">
                        {isCheckingVerification ? (
                          <span className="text-xs text-gray-400 font-medium flex items-center">
                            <Loader size={12} className="mr-1 animate-spin" />
                            Mengecek status...
                          </span>
                        ) : isVerifiedUser ? (
                          <span className="text-xs text-teal-400 font-medium flex items-center">
                            <MailCheck size={12} className="mr-1" />
                            Terverifikasi
                          </span>
                        ) : (
                          <button
                            onClick={handleVerifyEmail}
                            disabled={isVerifyPage}
                            className={`text-xs font-medium flex items-center ${
                              isVerifyPage
                                ? "text-gray-500 cursor-default"
                                : "text-yellow-400 hover:text-yellow-300 underline"
                            }`}>
                            <Mail size={12} className="mr-1" />
                            {isVerifyPage
                              ? "Sedang Verifikasi..."
                              : "Belum Verifikasi"}
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={
                        isUnverifiedUser && !isVerifyPage
                          ? handleVerifyEmail
                          : undefined
                      }
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg relative ${
                        isVerifiedUser
                          ? "bg-gradient-to-r from-teal-600 to-cyan-600"
                          : "bg-gradient-to-r from-yellow-600 to-orange-600"
                      } ${isUnverifiedUser && !isVerifyPage ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}>
                      {isVerifiedUser ? <User size={18} /> : <Mail size={18} />}
                      {isUnverifiedUser && !isVerifyPage && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></div>
                      )}
                    </button>
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
                  {/* Mobile User Info */}
                  {user && (
                    <div className="p-5 rounded-xl bg-gray-800/80 border border-gray-700 mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <button
                          onClick={
                            isUnverifiedUser && !isVerifyPage
                              ? handleVerifyEmail
                              : undefined
                          }
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg relative ${
                            isVerifiedUser
                              ? "bg-gradient-to-r from-teal-600 to-cyan-600"
                              : "bg-gradient-to-r from-yellow-600 to-orange-600"
                          } ${isUnverifiedUser && !isVerifyPage ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}>
                          {isVerifiedUser ? (
                            <User size={22} />
                          ) : (
                            <Mail size={22} />
                          )}
                          {isUnverifiedUser && !isVerifyPage && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-lg">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {isCheckingVerification ? (
                              <span className="text-xs text-gray-400 font-medium flex items-center">
                                <Loader
                                  size={12}
                                  className="mr-1 animate-spin"
                                />
                                Mengecek...
                              </span>
                            ) : isVerifiedUser ? (
                              <span className="text-xs text-teal-400 font-medium flex items-center">
                                <MailCheck size={12} className="mr-1" />
                                Terverifikasi
                              </span>
                            ) : (
                              <button
                                onClick={handleVerifyEmail}
                                disabled={isVerifyPage}
                                className={`text-xs font-medium flex items-center ${
                                  isVerifyPage
                                    ? "text-gray-500"
                                    : "text-yellow-400 hover:text-yellow-300 underline"
                                }`}>
                                <Mail size={12} className="mr-1" />
                                {isVerifyPage
                                  ? "Sedang Verifikasi..."
                                  : "Belum Verifikasi"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {isUnverifiedUser && !isVerifyPage && (
                        <button
                          onClick={handleVerifyEmail}
                          className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 mb-4 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]">
                          <Mail size={18} />
                          <span>Verifikasi Email Sekarang</span>
                        </button>
                      )}

                      {isUnverifiedUser && (
                        <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                          <p className="text-yellow-300 text-sm font-medium text-center">
                            ⚠️ Verifikasi email untuk akses fitur lengkap
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Navigation Menu */}
                  {(user?.role === "user" || !user) && (
                    <div className="mb-8">
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">
                        NAVIGASI
                      </p>
                      <nav className="space-y-2">
                        {navItems.map((item) => {
                          const accessible = canAccessMenuItem(item);
                          const isActive = location.pathname === item.to;

                          return (
                            <button
                              key={item.to}
                              onClick={(e) => handleMenuItemClick(item, e)}
                              className={`
                                w-full p-3 rounded-xl transition-all duration-200 font-bold text-lg
                                uppercase tracking-wider flex items-center justify-center gap-2
                                ${!accessible ? "cursor-not-allowed" : "cursor-pointer"}
                                ${
                                  isActive
                                    ? item.highlight
                                      ? "text-white bg-gradient-to-r from-yellow-600 to-orange-600"
                                      : "text-white bg-gradient-to-r from-teal-600 to-cyan-600"
                                    : !accessible
                                      ? "text-gray-500 bg-gray-800/50"
                                      : item.highlight
                                        ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/10"
                                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }
                              `}>
                              {item.icon && <span>{item.icon}</span>}
                              <span className="flex items-center">
                                {item.label}
                                {item.badge && item.badge}
                              </span>
                              {!accessible && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                            </button>
                          );
                        })}
                      </nav>

                      {/* Warning untuk user belum verify */}
                      {isUnverifiedUser && !isVerifyPage && (
                        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                          <p className="text-yellow-300 text-xs text-center">
                            Fitur Voting dan Ticket membutuhkan verifikasi email
                          </p>
                          <button
                            onClick={handleVerifyEmail}
                            className="w-full mt-3 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 text-sm shadow-lg active:scale-[0.98]">
                            Verifikasi Sekarang
                          </button>
                        </div>
                      )}

                      <div className="border-t border-gray-800 my-6"></div>
                    </div>
                  )}

                  {/* Mobile Auth Buttons */}
                  {user ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg active:scale-[0.98]">
                      <LogOut size={22} />
                      <span className="text-lg">LOGOUT</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          handleLogin();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-orange-700 transition-all duration-200 text-lg shadow-lg active:scale-[0.98]">
                        LOGIN
                      </button>
                      <button
                        onClick={() => {
                          handleRegister();
                          setIsMobileMenuOpen(false);
                        }}
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
