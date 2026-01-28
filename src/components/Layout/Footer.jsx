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
  Users,
  Globe,
  Heart,
  Zap,
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "Tentang Lomba", href: "#" },
    { label: "Persyaratan", href: "#" },
    { label: "Timeline", href: "#" },
    { label: "FAQ", href: "#" },
  ];

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Youtube size={18} />, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-black text-white border-t border-gray-800">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 flex items-center justify-center">
                <Award className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Paskibra Championship 2026
                </h3>
                <p className="text-gray-400 text-sm">
                  Kreasi • Prestasi • Kebanggaan Nasional
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-lg">
              Ajang kompetisi bergengsi untuk tim Paskibra se-Indonesia dengan
              sistem voting modern dan terpercaya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white">
              Tautan Cepat
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-bold mb-4 text-white">Kontak Kami</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin
                  className="text-orange-400 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <span className="text-gray-400 text-sm">
                  BSD Serpong, Tangerang Selatan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-orange-400 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">(021) 1234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-orange-400 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">info@votix.co.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h5 className="font-bold text-white">Ikuti Kami:</h5>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-700 text-gray-300 hover:text-white flex items-center justify-center transition-all border border-gray-700"
                    aria-label={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email untuk update"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500 text-sm w-full sm:w-48"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all text-sm whitespace-nowrap">
                  Berlangganan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Paskibra Championship. Hak Cipta
            Dilindungi.
          </div>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Syarat & Ketentuan
            </a>
          </div>
        </div>

        {/* Accreditation */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-3">
              Diselenggarakan oleh KEMENDIKBUD • Bekerjasama dengan KONI PUSAT •
              Didukung oleh KEMENPORA
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Heart size={14} className="text-orange-500" />
              <span>Untuk generasi muda Indonesia</span>
              <Zap size={14} className="text-teal-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
