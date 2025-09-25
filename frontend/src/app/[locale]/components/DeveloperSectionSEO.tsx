import Image from 'next/image'
import { useCurrentLocale, useI18n } from '@/locales/client';
import React, {  } from 'react'
import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function DeveloperSectionSEO() {
    const locale = useCurrentLocale();
    return (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50/50 relative overflow-hidden hidden" id="developer">
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                        {locale === "fr" ? "DÉVELOPPEUR" : "DEVELOPER"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 tracking-tight">
                        {locale === "fr" ? "Développé par Tomdieu Ivan" : "Developed by Tomdieu Ivan"}
                    </h2>
                    <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
                </motion.div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl"
                    >
                        <Image
                            src="https://avatars.githubusercontent.com/u/77198289?v=4"
                            alt="Tomdieu Ivan"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="max-w-lg"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Tomdieu Ivan</h3>
                        <p className="text-primary font-semibold mb-4">Full Stack Developer</p>
                        <p className="text-gray-600 mb-6">
                            {locale === "fr"
                                ? "Développeur passionné spécialisé dans la création de solutions éducatives innovantes. ClassConnect est le fruit de mon expertise en développement web et de ma vision pour l'avenir de l'éducation en ligne au Cameroun."
                                : "Passionate developer specialized in creating innovative educational solutions. ClassConnect is the result of my web development expertise and my vision for the future of online education in Cameroon."
                            }
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="https://github.com/Tomdieu"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub Profile"
                                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://www.linkedin.com/in/tomdieuivan/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn Profile"
                                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link
                                href="mailto:ivan.tomdieu@gmail.com"
                                aria-label="Contact Email"
                                className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
                <div className="flex justify-center mt-10">
                    <Link href="/about">
                        <Button variant="outline" className="gap-2">
                            {locale === "fr" ? "En savoir plus" : "Learn more"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default DeveloperSectionSEO