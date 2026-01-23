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
  Heart,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

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
    { icon: <Facebook size={20} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
    { icon: <Youtube size={20} />, href: "#", label: "YouTube" },
  ];

  const stats = [
    {
      icon: <Users size={16} />,
      value: "500+",
      label: "Tim Peserta",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Trophy size={16} />,
      value: "24",
      label: "Provinsi",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Globe size={16} />,
      value: "10K+",
      label: "Pengunjung",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: <Flag size={16} />,
      value: "15",
      label: "Edisi",
      color: "from-red-500 to-pink-500",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      {/* Stats Section with Gradient */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black py-12 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-red-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}
                  >
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  {stat.value}
                </div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <Award className="text-white" size={24} />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  Paskibra Championship 2026
                </h3>
                <p className="text-gray-400">
                  Kreasi • Prestasi • Kebanggaan Nasional
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-lg">
              Ajang kompetisi bergengsi untuk tim Paskibra se-Indonesia.
              Mempersatukan generasi muda dalam semangat kebangsaan dan prestasi
              dengan teknologi voting modern.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 text-red-400">
                <Shield size={16} />
                <span className="text-sm font-medium">
                  Sistem Terverifikasi
                </span>
              </div>
              <div className="w-px h-4 bg-gray-700"></div>
              <div className="text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Sparkles size={14} className="text-yellow-500" />
                  ISO 9001:2026 Certified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Tautan Cepat</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-red-400 transition-colors flex items-center group text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 mr-3 transition-opacity"></div>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Kontak Kami</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-red-400 mt-1 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">
                  Gelora Bung Karno, Senayan
                  <br />
                  Jakarta Pusat 10270
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-red-400 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">(021) 1234-5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-red-400 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm break-all">
                  info@paskibralomba.id
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h5 className="font-bold mb-4 text-white">Ikuti Kami</h5>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 text-gray-300 hover:text-white flex items-center justify-center transition-all border border-gray-700 hover:border-transparent"
                    aria-label={social.label}
                  >
                    <div className="scale-90">{social.icon}</div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="w-full lg:w-auto">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                Berlangganan Newsletter
              </h4>
              <p className="text-gray-400 text-sm">
                Dapatkan update terbaru tentang Lomba Paskibra 2026
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full sm:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500"
              />
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-pink-700 transition-all hover:shadow-lg whitespace-nowrap">
                Berlangganan
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm text-center lg:text-left">
            © {new Date().getFullYear()} Paskibra Championship. Hak Cipta
            Dilindungi.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <a
              href="#"
              className="hover:text-red-400 transition-colors whitespace-nowrap"
            >
              Kebijakan Privasi
            </a>
            <a
              href="#"
              className="hover:text-red-400 transition-colors whitespace-nowrap"
            >
              Syarat & Ketentuan
            </a>
            <a
              href="#"
              className="hover:text-red-400 transition-colors whitespace-nowrap"
            >
              Kode Etik
            </a>
          </div>
        </div>
      </div>

      {/* Accreditation */}
      <div className="bg-gray-800/50 py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="text-xs text-gray-500 mb-1">
                Diselenggarakan oleh
              </div>
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400">
                KEMENDIKBUD
              </div>
            </div>

            <div className="hidden lg:block w-px h-8 bg-gray-700"></div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                Bekerjasama dengan
              </div>
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                KONI PUSAT
              </div>
            </div>

            <div className="hidden lg:block w-px h-8 bg-gray-700"></div>

            <div className="text-center lg:text-right">
              <div className="text-xs text-gray-500 mb-1">Didukung oleh</div>
              <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400">
                KEMENPORA
              </div>
            </div>
          </div>

          {/* Partner Logos */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-400">
            <div className="text-center">
              <div className="text-xs mb-2">Official Media Partner</div>
              <div className="font-semibold text-white text-sm">
                TVRI • NET TV • METRO TV
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs mb-2">Official Sponsor</div>
              <div className="font-semibold text-white text-sm">
                ADIDAS • PLN • TELKOMSEL
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Heart size={14} className="text-red-500 animate-pulse" />
              <span>
                Dibuat dengan semangat kebangsaan untuk generasi muda Indonesia
              </span>
              <Star size={14} className="text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
