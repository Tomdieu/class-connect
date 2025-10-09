"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  Github,
  Mail,
  Heart,
  BookOpen,
  Phone,
  MapPin
} from "lucide-react";
import { useCurrentLocale } from "@/locales/client";
import { Input } from "./ui/input";

const Footer = () => {
  const locale = useCurrentLocale();
  
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">ClassConnect</span>
            </div>
            
            <p className="text-slate-300 leading-relaxed max-w-md">
              {locale === "fr" 
                ? "Autonomiser l'éducation grâce à la technologie. Rejoignez des milliers d'étudiants qui transforment leur parcours d'apprentissage avec ClassConnect."
                : "Empowering education through technology. Join thousands of students who are transforming their learning journey with ClassConnect."}
            </p>
            
            {/* <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="w-5 h-5" />
                <span>hello@classconnect.cm</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="w-5 h-5" />
                <span>+237 6XX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <MapPin className="w-5 h-5" />
                <span>{locale === "fr" ? "Douala, Cameroun" : "Douala, Cameroon"}</span>
              </div>
            </div> */}

            <div className="flex space-x-4">
              <Link href="#" className="text-slate-300 hover:text-white transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-slate-300 hover:text-white transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-slate-300 hover:text-white transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-slate-300 hover:text-white transition-colors">
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">
              {locale === "fr" ? "Liens Rapides" : "Quick Links"}
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link href={`/${locale}`} className="hover:text-white transition-colors">
                  {locale === "fr" ? "Accueil" : "Home"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                  {locale === "fr" ? "À Propos" : "About"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
                  {locale === "fr" ? "Contact" : "Contact"}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">
              {locale === "fr" ? "Légal" : "Legal"}
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {locale === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="hover:text-white transition-colors">
                  {locale === "fr" ? "Politique des cookies" : "Cookie Policy"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section - Now separate row */}
        {/* <div className="mb-10">
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {locale === "fr" ? "Newsletter" : "Newsletter"}
            </h3>
            <p className="text-slate-300 mb-4">
              {locale === "fr" 
                ? "Abonnez-vous à notre newsletter pour recevoir les dernières nouvelles."
                : "Subscribe to our newsletter to receive the latest news."}
            </p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder={locale === "fr" ? "Votre email" : "Your email"}
                className="rounded-l-md rounded-r-none w-full bg-slate-800 border-slate-700 border outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="rounded-l-none">
                {locale === "fr" ? "OK" : "OK"}
              </Button>
            </div>
          </div>
        </div> */}
        
        <div className="border-t border-slate-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} ClassConnect. {locale === "fr" ? "Tous droits réservés" : "All rights reserved"}.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-center text-slate-400 text-sm mb-2">
                <span>
                  {locale === "fr" ? "Conçu et développé par" : "Designed and developed by"}
                </span>
                <a 
                  href="https://github.com/Tomdieu" 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-medium text-primary ml-1 hover:underline flex items-center"
                >
                  Tomdieu Ivan
                  <Heart className="h-3.5 w-3.5 ml-1.5 text-red-500" />
                </a>
              </div>
              
              <div className="flex space-x-3">
                <a 
                  href="https://github.com/Tomdieu" 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="GitHub Profile - Tomdieu Ivan"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Github size={16} />
                </a>
                <a 
                  href="https://www.linkedin.com/in/tomdieuivan/" 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="LinkedIn Profile - Tomdieu Ivan"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Linkedin size={16} />
                </a>
                <a 
                  href="mailto:ivan.tomdieu@gmail.com" 
                  aria-label="Email - Tomdieu Ivan"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// "use client"
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { 
//   Facebook, 
//   Twitter, 
//   Instagram, 
//   Youtube, 
//   Linkedin,
//   Github,
//   Mail,
//   Heart
// } from "lucide-react";
// import { useCurrentLocale } from "@/locales/client";
// import { Input } from "./ui/input";

// const Footer = () => {
//   const locale = useCurrentLocale();
  
//   return (
//     <footer className="bg-slate-900 text-white pt-16 pb-8">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
//           <div>
//             <h3 className="text-xl font-bold mb-4">ClassConnect</h3>
//             <p className="text-slate-300 mb-6">
//               {locale === "fr" 
//                 ? "La plateforme d'apprentissage en ligne numéro 1 au Cameroun" 
//                 : "The #1 online learning platform in Cameroon"}
//             </p>
//             <div className="flex space-x-4">
//               <Link href="#" className="text-slate-300 hover:text-white transition-colors">
//                 <Facebook size={20} />
//                 <span className="sr-only">Facebook</span>
//               </Link>
//               <Link href="#" className="text-slate-300 hover:text-white transition-colors">
//                 <Twitter size={20} />
//                 <span className="sr-only">Twitter</span>
//               </Link>
//               <Link href="#" className="text-slate-300 hover:text-white transition-colors">
//                 <Instagram size={20} />
//                 <span className="sr-only">Instagram</span>
//               </Link>
//               <Link href="#" className="text-slate-300 hover:text-white transition-colors">
//                 <Youtube size={20} />
//                 <span className="sr-only">YouTube</span>
//               </Link>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="text-xl font-bold mb-4">
//               {locale === "fr" ? "Liens Rapides" : "Quick Links"}
//             </h3>
//             <ul className="space-y-3 text-slate-300">
//               <li>
//                 <Link href={`/${locale}`} className="hover:text-white transition-colors">
//                   {locale === "fr" ? "Accueil" : "Home"}
//                 </Link>
//               </li>
//               <li>
//                 <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
//                   {locale === "fr" ? "À Propos" : "About"}
//                 </Link>
//               </li>
//               <li>
//                 <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
//                   {locale === "fr" ? "Contact" : "Contact"}
//                 </Link>
//               </li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="text-xl font-bold mb-4">
//               {locale === "fr" ? "Légal" : "Legal"}
//             </h3>
//             <ul className="space-y-3 text-slate-300">
//               <li>
//                 <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
//                   {locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
//                 </Link>
//               </li>
//               <li>
//                 <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
//                   {locale === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
//                 </Link>
//               </li>
//               <li>
//                 <Link href={`/${locale}/cookies`} className="hover:text-white transition-colors">
//                   {locale === "fr" ? "Politique des cookies" : "Cookie Policy"}
//                 </Link>
//               </li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="text-xl font-bold mb-4">
//               {locale === "fr" ? "Newsletter" : "Newsletter"}
//             </h3>
//             <p className="text-slate-300 mb-4">
//               {locale === "fr" 
//                 ? "Abonnez-vous à notre newsletter pour recevoir les dernières nouvelles."
//                 : "Subscribe to our newsletter to receive the latest news."}
//             </p>
//             <div className="flex">
//               <Input 
//                 type="email" 
//                 placeholder={locale === "fr" ? "Votre email" : "Your email"}
//                 className="rounded-l-md rounded-r-none w-full bg-slate-800 border-slate-700 border outline-none focus:ring-2 focus:ring-primary"
//               />
//               <Button className="rounded-l-none">
//                 {locale === "fr" ? "OK" : "OK"}
//               </Button>
//             </div>
//           </div>
//         </div>
        
//         <div className="border-t border-slate-800 pt-6 mt-6">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="mb-4 md:mb-0">
//               <p className="text-slate-400 text-sm">
//                 © {new Date().getFullYear()} ClassConnect. {locale === "fr" ? "Tous droits réservés" : "All rights reserved"}.
//               </p>
//             </div>
            
//             <div className="flex flex-col items-center md:items-end">
//               <div className="flex items-center text-slate-400 text-sm mb-2">
//                 <span>
//                   {locale === "fr" ? "Conçu et développé par" : "Designed and developed by"}
//                 </span>
//                 <a 
//                   href="https://github.com/Tomdieu" 
//                   target="_blank" 
//                   rel="noreferrer"
//                   className="font-medium text-primary ml-1 hover:underline flex items-center"
//                 >
//                   Tomdieu Ivan
//                   <Heart className="h-3.5 w-3.5 ml-1.5 text-red-500" />
//                 </a>
//               </div>
              
//               <div className="flex space-x-3">
//                 <a 
//                   href="https://github.com/Tomdieu" 
//                   target="_blank" 
//                   rel="noreferrer"
//                   aria-label="GitHub Profile - Tomdieu Ivan"
//                   className="text-slate-400 hover:text-white transition-colors"
//                 >
//                   <Github size={16} />
//                 </a>
//                 <a 
//                   href="https://www.linkedin.com/in/tomdieuivan/" 
//                   target="_blank" 
//                   rel="noreferrer"
//                   aria-label="LinkedIn Profile - Tomdieu Ivan"
//                   className="text-slate-400 hover:text-white transition-colors"
//                 >
//                   <Linkedin size={16} />
//                 </a>
//                 <a 
//                   href="mailto:ivan.tomdieu@gmail.com" 
//                   aria-label="Email - Tomdieu Ivan"
//                   className="text-slate-400 hover:text-white transition-colors"
//                 >
//                   <Mail size={16} />
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
