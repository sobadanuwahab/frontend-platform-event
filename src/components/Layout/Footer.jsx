import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Flag,
  Trophy,
  Users,
  Globe,
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "Tentang Lomba", href: "#" },
    { label: "Persyaratan", href: "#" },
    { label: "Timeline", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Sponsor", href: "#" },
    { label: "Media Partner", href: "#" },
  ];

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Youtube size={18} />, href: "#", label: "YouTube" },
  ];

  const stats = [
    { icon: <Users size={14} />, value: "500+", label: "Tim Peserta" },
    { icon: <Trophy size={14} />, value: "24", label: "Provinsi" },
    { icon: <Globe size={14} />, value: "10K+", label: "Pengunjung" },
    { icon: <Flag size={14} />, value: "15", label: "Edisi" },
  ];

  return (
    <footer className="bg-white text-gray-900 mt-10 sm:mt-16 lg:mt-20 border-t border-gray-200">
      {/* Stats Section */}
      <div className="bg-red-600 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-1 sm:mb-2">
                  <div className="p-1 sm:p-2 rounded-full bg-white/20">
                    <div className="scale-75 sm:scale-100">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-red-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-start sm:items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                <Award className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Lomba Paskibra 2026
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Kreasi • Prestasi • Kebanggaan Nasional
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base max-w-lg">
              Ajang kompetisi bergengsi untuk tim Paskibra se-Indonesia.
              Mempersatukan generasi muda dalam semangat kebangsaan dan
              prestasi.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Shield size={14} className="sm:size-4" />
                <span className="text-xs sm:text-sm font-medium">
                  Sistem Terverifikasi
                </span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="text-xs sm:text-sm text-gray-500">
                ISO 9001:2026 Certified
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-6 text-gray-900">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-red-600 transition-colors flex items-center group text-sm sm:text-base">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 mr-2 sm:mr-3 transition-opacity"></div>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-6 text-gray-900">
              Kontak Kami
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <MapPin
                  className="text-red-600 mt-0.5 sm:mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-gray-600 text-xs sm:text-sm">
                  Gelora Bung Karno, Senayan
                  <br />
                  Jakarta Pusat 10270
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="text-red-600 flex-shrink-0" size={14} />
                <span className="text-gray-600 text-xs sm:text-sm">
                  (021) 1234-5678
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="text-red-600 flex-shrink-0" size={14} />
                <span className="text-gray-600 text-xs sm:text-sm break-all">
                  info@paskibralomba.id
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 sm:mt-8">
              <h5 className="font-bold mb-3 sm:mb-4 text-gray-900 text-sm sm:text-base">
                Ikuti Kami
              </h5>
              <div className="flex space-x-2 sm:space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-red-600 text-gray-700 hover:text-white flex items-center justify-center transition-all group border border-gray-200 hover:border-red-600"
                    aria-label={social.label}>
                    <div className="scale-75 sm:scale-90 group-hover:scale-100 transition-transform">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8 sm:mt-10 lg:mt-12 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                Berlangganan Newsletter
              </h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                Dapatkan update terbaru tentang Lomba Paskibra 2026
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full sm:w-64 px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <button className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap text-sm sm:text-base">
                Berlangganan
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6 sm:my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Lomba Paskibra Nasional. Hak Cipta
            Dilindungi.
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <a
              href="#"
              className="hover:text-red-600 transition-colors whitespace-nowrap">
              Kebijakan Privasi
            </a>
            <a
              href="#"
              className="hover:text-red-600 transition-colors whitespace-nowrap">
              Syarat & Ketentuan
            </a>
            <a
              href="#"
              className="hover:text-red-600 transition-colors whitespace-nowrap">
              Kode Etik
            </a>
          </div>
        </div>
      </div>

      {/* Accreditation */}
      <div className="bg-gray-50 py-4 sm:py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center md:text-left">
              <div className="text-xs text-gray-500 mb-1">
                Diselenggarakan oleh
              </div>
              <div className="font-bold text-red-600 text-sm sm:text-base md:text-lg">
                KEMENDIKBUD
              </div>
            </div>

            <div className="hidden md:block w-px h-6 sm:h-8 bg-gray-300"></div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                Bekerjasama dengan
              </div>
              <div className="font-bold text-red-600 text-sm sm:text-base md:text-lg">
                KONI PUSAT
              </div>
            </div>

            <div className="hidden md:block w-px h-6 sm:h-8 bg-gray-300"></div>

            <div className="text-center md:text-right">
              <div className="text-xs text-gray-500 mb-1">Didukung oleh</div>
              <div className="font-bold text-red-600 text-sm sm:text-base md:text-lg">
                KEMENPORA
              </div>
            </div>
          </div>

          {/* Partner Logos */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-8 opacity-80">
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">
                Official Media Partner
              </div>
              <div className="font-semibold text-gray-700 text-sm">
                TVRI • NET TV
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs mb-1">Official Sponsor</div>
              <div className="font-semibold text-gray-700 text-sm">
                ADIDAS • PLN
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
