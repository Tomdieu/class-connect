"use client"
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useI18n } from "@/locales/client";

const Footer = () => {
  const t = useI18n();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.aboutUs")}</h3>
            <p className="text-gray-400">{t("footer.aboutText")}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">{t("footer.pricing")}</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">{t("footer.contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-400 hover:text-white">{t("footer.faq")}</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white">{t("footer.helpCenter")}</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">{t("footer.privacy")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.connect")}</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white">
                <FaFacebook size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white">
                <FaTwitter size={24} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white">
                <FaInstagram size={24} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>

        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} ClassConnect. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
