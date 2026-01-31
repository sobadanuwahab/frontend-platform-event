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
  LogIn,
  UserPlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

  // Tambahkan ref untuk mobile menu
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

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

      if (response.success && response.data?.is_verified === true) {
        setIsVerifiedUser(true);
      } else {
        setIsVerifiedUser(false);
      }
    } catch (error) {
      console.error("Error checking verification status:", error);

      const localStorageVerifyFlag = localStorage.getItem(
        `email_verified_${user.email}`,
      );
      const hasVerifiedInLocalStorage = localStorageVerifyFlag === "true";

      setIsVerifiedUser(hasVerifiedInLocalStorage);
    } finally {
      setIsCheckingVerification(false);
      setVerificationStatusLoaded(true);
    }
  };

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

  // Menu items untuk navigation sesuai desain Bariskreasi
  const getNavItems = () => {
    const baseItems = [
      {
        to: "/",
        label: "Beranda",
        alwaysShow: true,
      },
      {
        to: "/event",
        label: "Event",
        showToAllUsers: true,
      },
      {
        to: "/jadwal",
        label: "Jadwal",
        showToAllUsers: true,
      },
      {
        to: "/voting",
        label: "Voting",
        showToAllUsers: true,
        highlightUnverified: true,
      },
      {
        to: "/results",
        label: "Hasil",
        alwaysShow: true,
      },
    ];

    // Jika user belum verifikasi, tambahkan menu verifikasi
    if (isUnverifiedUser) {
      baseItems.push({
        to: "/verify-email",
        label: "Verifikasi Email",
        highlight: true,
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    setScrolled(window.scrollY > 20);
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const handleVerifyEmail = () => {
    if (isVerifyPage) return;
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

  // Fungsi untuk handle click pada menu item
  const handleMenuItemClick = (item, e) => {
    if (e) {
      e.stopPropagation(); // Mencegah event bubbling
    }

    if (!user && item.showToAllUsers) {
      // Tidak perlu redirect, biarkan user tetap bisa lihat halaman
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      return;
    }

    if (isUnverifiedUser && item.highlightUnverified) {
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      return;
    }

    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`
        fixed top-0 z-50 transition-all duration-300 w-full
        ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-transparent"
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Brand Bariskreasi */}
          <div
            onClick={handleBackToHome}
            className="flex items-center gap-3 cursor-pointer group z-50 flex-shrink-0"
          >
            <div className="relative flex items-center">
              <img
                src={LogoImage}
                alt="Bariskreasi Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-center">
              <h1
                className={`font-black text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none transition-colors duration-300 ${
                  scrolled ? "text-gray-900" : "text-white drop-shadow-lg"
                }`}
              >
                Bariskreasi
              </h1>
              <p
                className={`text-xs sm:text-sm md:text-base mt-1 leading-tight font-medium tracking-wide transition-colors duration-300 ${
                  scrolled ? "text-green-600" : "text-green-100 drop-shadow-md"
                }`}
              >
                Wadah Kreasi Baris Berbaris Indonesia
              </p>
            </div>
          </div>

          {/* Desktop Navigation - DIUBAH: Dipindah ke tengah dengan jarak yang lebih longgar */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            {/* Navigation Menu - DIUBAH: Dengan spacing yang lebih longgar */}
            {!isAuthPage && (user?.role === "user" || !user) && (
              <nav className="flex items-center space-x-8">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  const showUnverifiedIndicator =
                    isUnverifiedUser && item.highlightUnverified;

                  return (
                    <div
                      key={item.to}
                      className="relative group"
                      onClick={(e) => handleMenuItemClick(item, e)}
                    >
                      <NavLink
                        to={item.to}
                        className={`
                          relative font-medium text-sm uppercase tracking-wider
                          transition-all duration-200 cursor-pointer whitespace-nowrap
                          ${
                            isActive
                              ? item.highlight
                                ? "text-yellow-500"
                                : scrolled
                                  ? "text-green-700 font-semibold"
                                  : "text-white font-semibold"
                              : item.highlight
                                ? "text-yellow-400 hover:text-yellow-500"
                                : scrolled
                                  ? "text-gray-600 hover:text-green-600"
                                  : "text-white hover:text-white"
                          }
                        `}
                      >
                        <div className="relative pb-1">
                          <span className="relative z-10 flex items-center">
                            {item.label}
                            {showUnverifiedIndicator && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded-full font-bold">
                                !
                              </span>
                            )}
                          </span>

                          {/* Garis bawah saat active - DIUBAH: Posisi tepat di bawah teks */}
                          {isActive && !item.highlight && (
                            <div
                              className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full ${
                                scrolled ? "bg-green-600" : "bg-white"
                              }`}
                            ></div>
                          )}

                          {/* Garis bawah saat hover (selain active) - DIUBAH: Posisi tepat di bawah teks */}
                          {!isActive && (
                            <div
                              className={`absolute bottom-0 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full ${
                                scrolled ? "bg-green-300" : "bg-green-100"
                              }`}
                            ></div>
                          )}
                        </div>
                      </NavLink>

                      {/* Tooltip untuk menu yang belum diverifikasi */}
                      {showUnverifiedIndicator && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 px-3 py-2 bg-yellow-600 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                          ⚠️ Verifikasi email untuk akses fitur lengkap
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-600 rotate-45"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Desktop User Section - DIUBAH: Dipindah ke kanan */}
          <div className="hidden md:flex items-center space-x-4 z-50 flex-shrink-0">
            {/* Jika di halaman auth, tampilkan tombol kembali ke home */}
            {isAuthPage ? (
              <button
                onClick={handleBackToHome}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm flex items-center space-x-2 shadow-lg active:scale-[0.98]"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Beranda</span>
              </button>
            ) : (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden lg:block">
                      <p
                        className={`font-bold text-sm ${
                          scrolled
                            ? "text-gray-900"
                            : "text-white drop-shadow-md"
                        }`}
                      >
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {isCheckingVerification ? (
                          <span
                            className={`text-xs font-medium flex items-center ${
                              scrolled ? "text-gray-500" : "text-green-100"
                            }`}
                          >
                            <Loader size={12} className="mr-1 animate-spin" />
                            Mengecek...
                          </span>
                        ) : isVerifiedUser ? (
                          <span className="text-xs text-green-400 font-medium flex items-center drop-shadow-md">
                            <MailCheck size={12} className="mr-1" />
                            Terverifikasi
                          </span>
                        ) : (
                          <button
                            onClick={handleVerifyEmail}
                            disabled={isVerifyPage}
                            className={`text-xs font-medium flex items-center ${
                              isVerifyPage
                                ? scrolled
                                  ? "text-gray-400"
                                  : "text-green-100/70"
                                : "text-yellow-300 hover:text-yellow-400 underline drop-shadow-md"
                            }`}
                          >
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
                          ? "bg-gradient-to-r from-green-600 to-green-700"
                          : "bg-gradient-to-r from-yellow-600 to-orange-600"
                      } ${
                        isUnverifiedUser && !isVerifyPage
                          ? "cursor-pointer hover:opacity-90 transition-opacity"
                          : ""
                      }`}
                    >
                      {isVerifiedUser ? <User size={18} /> : <Mail size={18} />}
                      {isUnverifiedUser && !isVerifyPage && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></div>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className={`px-4 py-2.5 font-bold rounded-lg transition-all duration-200 text-sm shadow-sm active:scale-[0.98] border flex items-center gap-2 ${
                        scrolled
                          ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                          : "bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                      }`}
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleLogin}
                      className={`px-4 py-2.5 font-bold rounded-lg transition-all duration-200 text-sm shadow-sm active:scale-[0.98] border flex items-center gap-2 ${
                        scrolled
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                      }`}
                    >
                      <LogIn size={16} />
                      <span>Masuk</span>
                    </button>
                    <button
                      onClick={handleRegister}
                      className={`px-4 py-2.5 font-bold rounded-lg transition-all duration-200 text-sm shadow-sm active:scale-[0.98] border flex items-center gap-2 ${
                        scrolled
                          ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                          : "bg-white backdrop-blur-sm text-green-700 border-white/30 hover:bg-white/30"
                      }`}
                    >
                      <UserPlus size={16} />
                      <span>Daftar</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            onClick={toggleMobileMenu}
            className={`
              md:hidden p-2.5 rounded-lg transition-all duration-200
              active:scale-[0.98] z-60 relative flex-shrink-0
              ${
                scrolled
                  ? "bg-green-50 hover:bg-green-100 border border-green-200"
                  : "bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
              }
              ${
                isMobileMenuOpen
                  ? scrolled
                    ? "bg-green-100"
                    : "bg-white/30"
                  : ""
              }
            `}
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {isMobileMenuOpen ? (
              <X
                size={22}
                className={scrolled ? "text-green-700" : "text-white"}
              />
            ) : (
              <Menu
                size={22}
                className={scrolled ? "text-green-700" : "text-white"}
              />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 md:hidden z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Content */}
        <div
          ref={mobileMenuRef}
          className={`
            fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white border-l border-green-200
            transform transition-transform duration-300 ease-in-out md:hidden z-50
            overflow-y-auto shadow-xl
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          style={{ top: "0", height: "100vh" }}
        >
          {/* Mobile Menu Header */}
          <div className="p-6 border-b border-green-200 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Bariskreasi</h3>
              <p className="text-green-600 text-sm">Menu Navigasi</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
              aria-label="Tutup menu"
            >
              <X size={24} className="text-green-700" />
            </button>
          </div>

          <div className="p-6">
            {/* Jika di halaman auth, tampilkan tombol kembali */}
            {isAuthPage ? (
              <button
                onClick={() => {
                  handleBackToHome();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-3 mb-6 shadow-lg active:scale-[0.98]"
              >
                <ArrowLeft size={22} />
                <span className="text-lg">Kembali ke Beranda</span>
              </button>
            ) : (
              <>
                {/* Mobile User Info */}
                {user && (
                  <div className="p-5 rounded-xl bg-green-50 border border-green-200 mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <button
                        onClick={
                          isUnverifiedUser && !isVerifyPage
                            ? () => {
                                handleVerifyEmail();
                                setIsMobileMenuOpen(false);
                              }
                            : undefined
                        }
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg relative ${
                          isVerifiedUser
                            ? "bg-gradient-to-r from-green-600 to-green-700"
                            : "bg-gradient-to-r from-yellow-600 to-orange-600"
                        } ${
                          isUnverifiedUser && !isVerifyPage
                            ? "cursor-pointer hover:opacity-90 transition-opacity"
                            : ""
                        }`}
                      >
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
                        <p className="font-bold text-gray-900 text-lg">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {isCheckingVerification ? (
                            <span className="text-xs text-gray-500 font-medium flex items-center">
                              <Loader size={12} className="mr-1 animate-spin" />
                              Mengecek...
                            </span>
                          ) : isVerifiedUser ? (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <MailCheck size={12} className="mr-1" />
                              Terverifikasi
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                handleVerifyEmail();
                                setIsMobileMenuOpen(false);
                              }}
                              disabled={isVerifyPage}
                              className={`text-xs font-medium flex items-center ${
                                isVerifyPage
                                  ? "text-gray-400"
                                  : "text-yellow-600 hover:text-yellow-700 underline"
                              }`}
                            >
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
                        onClick={() => {
                          handleVerifyEmail();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 mb-4 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                      >
                        <Mail size={18} />
                        <span>Verifikasi Email Sekarang</span>
                      </button>
                    )}

                    {isUnverifiedUser && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm font-medium text-center">
                          ⚠️ Verifikasi email untuk akses fitur lengkap
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Navigation Menu */}
                {(user?.role === "user" || !user) && (
                  <div className="mb-8">
                    <p className="text-green-600 text-sm font-bold uppercase tracking-wider mb-4">
                      Navigasi
                    </p>
                    <nav className="space-y-3">
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        const showUnverifiedIndicator =
                          isUnverifiedUser && item.highlightUnverified;

                        return (
                          <button
                            key={item.to}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuItemClick(item, e);
                              if (!e.defaultPrevented) {
                                handleNavigation(item.to);
                              }
                            }}
                            className={`
                              w-full p-4 rounded-xl transition-all duration-200 font-bold
                              uppercase tracking-wider flex items-center justify-between gap-2
                              cursor-pointer text-left
                              ${
                                isActive
                                  ? item.highlight
                                    ? "text-white bg-gradient-to-r from-yellow-600 to-orange-600"
                                    : "text-white bg-gradient-to-r from-green-600 to-emerald-600"
                                  : item.highlight
                                    ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center text-base">
                                {item.label}
                                {showUnverifiedIndicator && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-white rounded-full font-bold">
                                    !
                                  </span>
                                )}
                              </span>
                            </div>
                            {showUnverifiedIndicator && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            )}
                          </button>
                        );
                      })}
                    </nav>

                    {/* Warning untuk user belum verify */}
                    {isUnverifiedUser && !isVerifyPage && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm text-center">
                          Fitur Voting dan Ticket membutuhkan verifikasi email
                        </p>
                        <button
                          onClick={() => {
                            handleVerifyEmail();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full mt-3 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 text-sm shadow-lg active:scale-[0.98]"
                        >
                          Verifikasi Sekarang
                        </button>
                      </div>
                    )}

                    <div className="border-t border-green-200 my-6"></div>
                  </div>
                )}

                {/* Mobile Auth Buttons */}
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg active:scale-[0.98]"
                  >
                    <LogOut size={22} />
                    <span className="text-lg">Keluar</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm shadow-sm active:scale-[0.98] border border-gray-300 flex items-center justify-center gap-2"
                    >
                      <LogIn size={20} />
                      <span>Masuk</span>
                    </button>
                    <button
                      onClick={() => {
                        handleRegister();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <UserPlus size={20} />
                      <span>Daftar</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
