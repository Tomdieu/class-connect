"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import { LottieWrapper } from "@/components/ui/lottie-wrapper";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import React from "react";

// Import your animations
import studentAnimation from "@/animations/student-learning.json";
import teachingAnimation from "@/animations/teaching.json";
import learningAnimation from "@/animations/learning-process.json";

function LandingPage() {
  return (
    <div className="relative flex-1 w-full h-full flex flex-col min-h-screen">
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1">
        <RevealOnScroll>
          <Hero />
        </RevealOnScroll>
        
        {/* Animated Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <RevealOnScroll direction="up" delay={0.2}>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper 
                      animation={studentAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Learn at Your Own Pace
                    </h3>
                    <p className="text-gray-600">
                      Access courses anytime, anywhere, and learn at your own speed
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Feature 2 */}
              <RevealOnScroll direction="up" delay={0.4}>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper 
                      animation={teachingAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Expert Teachers
                    </h3>
                    <p className="text-gray-600">
                      Learn from experienced educators who are passionate about teaching
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Feature 3 */}
              <RevealOnScroll direction="up" delay={0.6}>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper 
                      animation={learningAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Interactive Learning
                    </h3>
                    <p className="text-gray-600">
                      Engage with interactive content and real-time feedback
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <RevealOnScroll direction="up">
          <SubscriptionPlans />
        </RevealOnScroll>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
