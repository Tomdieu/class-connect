import { useCurrentLocale, useI18n } from '@/locales/client';
import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


// New type for particle properties
interface ParticleProps {
    id: number;
    width: number;
    height: number;
    left: string;
    top: string;
    duration: number;
    delay: number;
}

function CTASection({className}: {className?: string}) {

    const t = useI18n();
    const locale = useCurrentLocale();
    // State for storing particle properties, initialized client-side
    const [particles, setParticles] = useState<ParticleProps[] | null>(null);

    // Implement requestIdleCallback for non-critical operations
    useEffect(() => {
        const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        const handle = idleCallback(() => {
            // Preload animations during idle time but with low priority
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'fetch';
            // Check if document.head exists (client-side)
            if (document.head) {
                document.head.appendChild(link);
            }
        });

        // Generate particle properties only on the client-side after mount
        const generatedParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            width: Math.round(Math.random() * 8 + 4),
            height: Math.round(Math.random() * 8 + 4),
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 3 + 3,
            delay: Math.random() * 5,
        }));
        setParticles(generatedParticles);

        return () => {
            const cancelIdle = window.cancelIdleCallback || clearTimeout;
            cancelIdle(handle);
        };
    }, []); // Empty dependency array ensures this runs only once on the client after mount

    return (
        <section className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 bg-primary to-primary relative overflow-hidden",className)} id="cta">
            {/* Animated particles background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-center opacity-10"></div>
                {/* Animated floating particles - Render only when particles state is ready */}
                {particles && particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute rounded-full bg-white/20"
                        style={{
                            width: p.width,
                            height: p.height,
                            left: p.left,
                            top: p.top,
                        }}
                        animate={{
                            y: [0, -15, 0],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: p.delay,
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10 py-24 w-full">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-6"
                    >
                        <span className="text-white/90">
                            {locale === "fr" ? "COMMENCEZ MAINTENANT" : "START NOW"}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4"
                    >
                        {locale === "fr"
                            ? "Prêt à transformer votre façon d'apprendre ?"
                            : "Ready to transform your learning experience?"}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/80 mb-8 max-w-2xl leading-relaxed"
                    >
                        {locale === "fr"
                            ? "Rejoignez des milliers d'étudiants qui ont déjà révolutionné leur apprentissage avec ClassConnect. Votre succès commence maintenant."
                            : "Join thousands of students who have already revolutionized their learning with ClassConnect. Your success starts now."}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/auth/register">
                            <Button
                                size="lg"
                                className="h-12 px-8 bg-white text-foreground hover:bg-white/90 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                                {locale === "fr" ? "Commencer Maintenant" : "Start now"}
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default CTASection