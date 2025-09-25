"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGSAPScrollAnimations = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up GSAP context for cleanup
    const ctx = gsap.context(() => {
      // Enhanced smooth scrolling with momentum
      gsap.registerPlugin(ScrollTrigger);

      // Create a timeline for coordinated animations
      const masterTl = gsap.timeline();

      // Section reveal animations with smooth transitions
      gsap.utils.toArray(".section-animate").forEach((section: any, i) => {
        // Create entrance animation
        gsap.fromTo(section, 
          {
            opacity: 0,
            y: 100,
            scale: 0.98,
            filter: "blur(5px)"
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "top 30%",
              toggleActions: "play none none reverse",
              scrub: 0.5,
            }
          }
        );

        // Create exit animation
        gsap.to(section, {
          opacity: 0.3,
          scale: 0.95,
          filter: "blur(2px)",
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "bottom 50%",
            end: "bottom 0%",
            toggleActions: "none none none reverse",
            scrub: 1,
          }
        });
      });

      // Enhanced hero section with parallax
      gsap.to(".hero-bg", {
        yPercent: -30,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
      });

      // Floating elements with continuous animation
      gsap.utils.toArray(".floating-element").forEach((element: any, i) => {
        // Base floating animation
        gsap.to(element, {
          y: "random(-15, 15)",
          x: "random(-8, 8)",
          rotation: "random(-3, 3)",
          duration: "random(4, 8)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5
        });

        // Scroll-based movement
        gsap.to(element, {
          y: (i + 1) * -50,
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 2
          }
        });
      });

      // Features section with advanced stagger
      const featureCards = gsap.utils.toArray(".feature-card");
      gsap.fromTo(featureCards, 
        {
          opacity: 0,
          y: 80,
          rotationY: 45,
          transformOrigin: "center bottom"
        },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 1.2,
          stagger: {
            amount: 0.6,
            from: "center",
            ease: "power2.out"
          },
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".features-section",
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse",
            scrub: 0.3
          }
        }
      );

      // Enhanced subscription cards with 3D effects
      const subscriptionCards = gsap.utils.toArray(".subscription-card");
      gsap.set(subscriptionCards, { 
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      gsap.fromTo(subscriptionCards, 
        {
          opacity: 0,
          scale: 0.7,
          rotationX: 45,
          y: 100,
          z: -200
        },
        {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          stagger: {
            amount: 0.8,
            from: "start",
            ease: "power3.out"
          },
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".subscription-section",
            start: "top 85%",
            end: "top 30%",
            toggleActions: "play none none reverse",
            scrub: 0.2
          }
        }
      );

      // CTA section with dramatic entrance and particles
      gsap.fromTo(".cta-content", 
        {
          opacity: 0,
          scale: 0.8,
          rotationY: 30,
          z: -100
        },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          z: 0,
          duration: 2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".cta-section",
            start: "top 90%",
            end: "top 40%",
            toggleActions: "play none none reverse",
            scrub: 0.3
          }
        }
      );

      // Text reveal animations with typewriter effect
      gsap.utils.toArray(".text-reveal").forEach((text: any, i) => {
        gsap.fromTo(text,
          {
            opacity: 0,
            y: 40,
            rotationX: 90
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: text,
              start: "top 90%",
              end: "top 50%",
              toggleActions: "play none none reverse",
              scrub: 0.2
            }
          }
        );
      });

      // Smooth section-to-section transitions
      gsap.utils.toArray(".full-section").forEach((section: any, i) => {
        if (i === 0) return;

        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            gsap.to(section, {
              backgroundColor: "rgba(255,255,255,1)",
              duration: 0.8,
              ease: "power2.out"
            });
          },
          onLeave: () => {
            gsap.to(section, {
              backgroundColor: "rgba(255,255,255,0.95)",
              duration: 0.8,
              ease: "power2.out"
            });
          }
        });
      });

      // Performance optimizations
      gsap.set([".feature-card", ".subscription-card", ".floating-element"], {
        willChange: "transform, opacity"
      });

    }, containerRef);

    return () => ctx.revert(); // Cleanup
  }, []);

  return containerRef;
};

// Hook for full-page scroll snapping with smooth transitions
export const useGSAPSectionSnap = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let sections = gsap.utils.toArray(".full-section");
    let currentSection = 0;

    // Create smooth snap scrolling
    const snapToSection = (index: number) => {
      if (index < 0 || index >= sections.length) return;
      
      const targetSection = sections[index] as Element;
      const offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset;
      
      gsap.to(window, {
        duration: 1.5,
        scrollTo: offsetTop,
        ease: "power3.inOut"
      });
      
      currentSection = index;
    };

    // Wheel event for section navigation
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0 && currentSection < sections.length - 1) {
        snapToSection(currentSection + 1);
      } else if (e.deltaY < 0 && currentSection > 0) {
        snapToSection(currentSection - 1);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          if (currentSection < sections.length - 1) {
            snapToSection(currentSection + 1);
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (currentSection > 0) {
            snapToSection(currentSection - 1);
          }
          break;
      }
    };

    // Add event listeners with throttling
    let throttleTimer: NodeJS.Timeout;
    const throttledWheelHandler = (e: WheelEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null as any;
      }, 1000);
      handleWheel(e);
    };

    // Uncomment to enable section snapping (disabled by default for better UX)
    window.addEventListener('wheel', throttledWheelHandler, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', throttledWheelHandler);
      window.removeEventListener('keydown', handleKeyDown);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);
};
