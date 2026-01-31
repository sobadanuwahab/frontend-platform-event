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
  Ticket,
  Calendar,
  Trophy,
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { label: "Tentang Kami", href: "#" },
    { label: "Kontak", href: "#" },
    { label: "Event", href: "#" },
    { label: "Jadwal", href: "#" },
    { label: "Voting", href: "#" },
    { label: "Hasil", href: "#" },
  ];

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Youtube size={18} />, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gradient-to-t from-green-50 to-white text-gray-800 border-t border-green-200">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Bariskreasi
                </h3>
                <p className="text-green-600 text-sm">
                  Wadah Kreasi Baris Berbaris Indonesia
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-lg">
              Platform terpadu untuk tiket, voting, dan penjurian dalam satu
              sistem. Menyediakan pengalaman kompetisi baris berbaris yang
              modern dan transparan.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-xs text-green-600">Event Aktif</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">120+</div>
                <div className="text-xs text-green-600">Tim</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">15K+</div>
                <div className="text-xs text-green-600">Vote</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">300+</div>
                <div className="text-xs text-green-600">Penampilan</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Globe size={18} className="text-green-600" />
              Tautan Cepat
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-green-700 transition-colors text-sm flex items-center gap-2 hover:translate-x-1 duration-200"
                  >
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Mail size={18} className="text-green-600" />
              Hubungi Kami
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin
                  className="text-green-600 mt-0.5 flex-shrink-0"
                  size={18}
                />
                <div>
                  <div className="text-gray-900 text-sm font-medium">
                    Alamat
                  </div>
                  <div className="text-gray-600 text-sm">
                    Jakarta, Indonesia
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-green-600 flex-shrink-0" size={18} />
                <div>
                  <div className="text-gray-900 text-sm font-medium">
                    Telepon
                  </div>
                  <div className="text-gray-600 text-sm">(021) 1234-5678</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-green-600 flex-shrink-0" size={18} />
                <div>
                  <div className="text-gray-900 text-sm font-medium">Email</div>
                  <div className="text-gray-600 text-sm">
                    info@bariskreasi.id
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-sm font-bold mb-3 text-green-600">
                Ikuti Kami:
              </h5>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-green-50 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 text-gray-700 hover:text-white flex items-center justify-center transition-all border border-green-200 hover:border-green-600 shadow-sm hover:shadow"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-green-200 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <Shield size={14} className="text-green-500" />
            <span>
              © {new Date().getFullYear()} Bariskreasi. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a
              href="#"
              className="hover:text-green-700 transition-colors flex items-center gap-1"
            >
              <Shield size={14} />
              Kebijakan Privasi
            </a>
            <a
              href="#"
              className="hover:text-green-700 transition-colors flex items-center gap-1"
            >
              <Award size={14} />
              Syarat & Ketentuan
            </a>
          </div>
        </div>

        {/* Accreditation */}
        <div className="mt-8 pt-8 border-t border-green-200">
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <div className="text-xs text-green-600 px-3 py-1 bg-green-50 rounded-full border border-green-200 shadow-sm">
                <Ticket size={12} className="inline mr-1" />
                Tiket Digital
              </div>
              <div className="text-xs text-green-600 px-3 py-1 bg-green-50 rounded-full border border-green-200 shadow-sm">
                <Users size={12} className="inline mr-1" />
                Voting Terverifikasi
              </div>
              <div className="text-xs text-green-600 px-3 py-1 bg-green-50 rounded-full border border-green-200 shadow-sm">
                <Calendar size={12} className="inline mr-1" />
                Penjurian Profesional
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Mendukung perkembangan baris berbaris Indonesia menuju dunia
              digital yang modern
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
