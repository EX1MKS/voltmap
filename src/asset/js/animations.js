// GSAP Animations Module for Voltmap

export const statItemsConfig = [
  {
    targetValue: 100000,
    format: (val) => `${Math.floor(val).toLocaleString("en-US")}+`,
    initialText: "0+",
  },
  {
    targetValue: 120,
    format: (val) => `${Math.floor(val)}`,
    initialText: "0",
  },
  {
    targetValue: 99.8,
    format: (val) => `${val.toFixed(1)}%`,
    initialText: "0.0%",
  },
];

export const WAVE_PATHS = {
  main: {
    stateA: "M -20,16 C 15.6,40 34.4,-5 50,16 C 65.6,42 84.4,0 120,16 L 120,115 C 84.4,80 65.6,104 50,94 C 34.4,80 15.6,102 -20,115 Z",
    stateB: "M -20,4 C 15.6,-6 34.4,32 50,4 C 65.6,-8 84.4,36 120,4 L 120,115 C 84.4,70 65.6,110 50,100 C 34.4,68 15.6,106 -20,115 Z",
  },
  back: {
    stateA: "M -20,10 C 11,35 29,-10 45,10 C 61,35 79,-5 120,10 L 120,115 C 79,90 61,114 45,104 C 29,88 11,112 -20,115 Z",
    stateB: "M -20,-2 C 11,-10 29,30 45,-2 C 61,-12 79,34 120,-2 L 120,115 C 79,76 61,118 45,108 C 29,74 11,114 -20,115 Z",
  },
};

export function initNavbarEntrance() {
  if (typeof gsap === "undefined") return;
  const logo = document.querySelector("#nav-logo");
  const navItems = document.querySelectorAll("#nav-menu > div");
  const actionItems = document.querySelectorAll("#nav-actions > *");

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (logo) {
    tl.fromTo(logo, { opacity: 0, y: -35 }, { opacity: 1, y: 0, duration: 0.85 }, 0.15);
  }
  if (navItems.length) {
    tl.fromTo(navItems, { opacity: 0, y: -35 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.08 }, 0.25);
  }
  if (actionItems.length) {
    tl.fromTo(actionItems, { opacity: 0, y: -35 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.08 }, 0.4);
  }
}

export function initHeroAnimations() {
  if (typeof gsap === "undefined") return;
  const bg = document.querySelector("#hero-bg");
  const titleWords = document.querySelectorAll(".hero-title-word");
  const subtitle = document.querySelector("#hero-subtitle");
  const actions = document.querySelectorAll("#hero-actions > *");
  const features = document.querySelectorAll("#hero-features > *");

  const masterTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (bg) {
    masterTl.fromTo(bg, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0.05);
  }

  if (titleWords.length) {
    masterTl.fromTo(titleWords, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: "power3.out" }, 0.2);
  }

  if (subtitle) {
    masterTl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, 0.5);
  }

  if (actions.length) {
    masterTl.fromTo(actions, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }, 0.65);
  }

  if (features.length) {
    masterTl.fromTo(features, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.06, ease: "power2.out" }, 0.8);
  }
}

export function initStatsAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#stats-section");
  const mainGreenPath = document.querySelector("#stats-main-path");
  const backGreenPath = document.querySelector("#stats-back-path");
  const auraPath = document.querySelector("#stats-aura-path");
  const particles = document.querySelector("#stats-particles");
  const statRefs = [
    document.querySelector("#stat-val-0"),
    document.querySelector("#stat-val-1"),
    document.querySelector("#stat-val-2"),
  ];

  // 1. Counter Animation
  statItemsConfig.forEach((config, idx) => {
    const el = statRefs[idx];
    if (!el) return;

    // Set initial text before scroll animation triggers
    el.textContent = config.initialText;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: config.targetValue,
      duration: 2.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
        once: true,
      },
      onUpdate: () => {
        if (el) el.textContent = config.format(obj.val);
      },
      onComplete: () => {
        if (el) el.textContent = config.format(config.targetValue);
      },
    });
  });

  // 2. Parallax horizontal scrub
  if (mainGreenPath && backGreenPath && section) {
    const isMobile = window.innerWidth <= 500;
    const startX = 0;
    const endX = isMobile ? -15 : -30;

    const parallaxTargets = [mainGreenPath, backGreenPath];
    if (auraPath) parallaxTargets.push(auraPath);

    gsap.fromTo(
      parallaxTargets,
      { x: startX },
      {
        x: endX,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      }
    );
  }

  if (particles && section) {
    gsap.fromTo(
      particles,
      { x: -110 },
      {
        x: 80,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.6,
        },
      }
    );
  }

  // 3. Wave morphing
  if (mainGreenPath) {  
    gsap.to(mainGreenPath, {
      d: WAVE_PATHS.main.stateB,
      duration: 4.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(mainGreenPath, {
      scale: 1.03,
      y: -7,
      transformOrigin: "50% 50%",
      duration: 5.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  if (auraPath) {
    gsap.to(auraPath, {
      d: WAVE_PATHS.main.stateB,
      duration: 4.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(auraPath, {
      scale: 1.03,
      y: -7,
      transformOrigin: "50% 50%",
      duration: 5.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  if (backGreenPath) {
    gsap.to(backGreenPath, {
      d: WAVE_PATHS.back.stateB,
      duration: 5.5,
      delay: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(backGreenPath, {
      scale: 1.045,
      y: 8,
      transformOrigin: "50% 50%",
      duration: 6.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  if (particles && particles.children.length) {
    gsap.to(Array.from(particles.children), {
      y: "-=25",
      x: "+=15",
      rotation: "+=25",
      opacity: 0.8,
      duration: 4.5,
      stagger: 0.7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }
}

export function initInstallBannerAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("#banner-install-charger");
  const mainGreenPath = document.querySelector("#install-main-path");
  const backGreenPath = document.querySelector("#install-back-path");
  const auraPath = document.querySelector("#install-aura-path");
  const particles = document.querySelector("#install-particles");

  if (!section) return;

  // 1. Parallax scrub on scroll
  if (mainGreenPath && backGreenPath) {
    const isMobile = window.innerWidth <= 500;
    const startX = isMobile ? -20 : 5;
    const endX = isMobile ? 15 : -20;

    const parallaxTargets = [mainGreenPath, backGreenPath];
    if (auraPath) parallaxTargets.push(auraPath);

    gsap.fromTo(
      parallaxTargets,
      { x: startX },
      {
        x: endX,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      }
    );
  }

  if (particles) {
    gsap.fromTo(
      particles,
      { x: -100 },
      {
        x: 75,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.6,
        },
      }
    );
  }

  // 2. Continuous Wave Morphing Loop
  if (mainGreenPath) {
    gsap.to(mainGreenPath, {
      d: WAVE_PATHS.main.stateB,
      duration: 4.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(mainGreenPath, {
      scale: 1.03,
      y: -7,
      transformOrigin: "50% 50%",
      duration: 5.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  if (auraPath) {
    gsap.to(auraPath, {
      d: WAVE_PATHS.main.stateB,
      duration: 4.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(auraPath, {
      scale: 1.03,
      y: -7,
      transformOrigin: "50% 50%",
      duration: 5.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  if (backGreenPath) {
    gsap.to(backGreenPath, {
      d: WAVE_PATHS.back.stateB,
      duration: 5.5,
      delay: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(backGreenPath, {
      scale: 1.045,
      y: 8,
      transformOrigin: "50% 50%",
      duration: 6.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  // 3. Floating leaves & wind motion animation
  if (particles && particles.children.length) {
    gsap.to(Array.from(particles.children), {
      y: "-=30",
      x: "+=22",
      rotation: "+=35",
      opacity: 0.85,
      duration: 4.2,
      stagger: 0.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }
}

export function initChargeTypeAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const pinWrapper = document.querySelector("#battery-pin-wrapper");
  const batteryFill = document.querySelector("#battery-fill");
  const batteryCapsule = document.querySelector("#battery-capsule");
  const boltIcon = document.querySelector("#battery-bolt-icon");
  const title = document.querySelector("#battery-hero-title");
  const scrollIndicator = document.querySelector("#battery-scroll-indicator");
  const sliderPin = document.querySelector("#slider-pin-container");
  const track = document.querySelector("#vehicle-slider-track");

  let hasAutoScrolled = false;

  // 1. PINNED BATTERY FILL HERO
  if (pinWrapper && batteryFill && batteryCapsule) {
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: pinWrapper,
        start: "top top",
        end: "+=120%",
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (self.progress >= 0.3 && !hasAutoScrolled && self.direction > 0) {
            hasAutoScrolled = true;
            if (sliderPin && typeof ScrollToPlugin !== "undefined") {
              gsap.to(window, {
                scrollTo: {
                  y: sliderPin,
                  offsetY: -5,
                  autoKill: false,
                },
                duration: 3,
                ease: "power2.inOut",
              });
            }
          }
          if (self.progress < 0.3) {
            hasAutoScrolled = false;
          }
        },
      },
    });

    pinTl.to(batteryFill, { width: "calc(100% - 16px)", ease: "power1.inOut", duration: 0.4 }, 0);
    pinTl.to(pinWrapper, { backgroundColor: "#52C133", ease: "power2.inOut", duration: 0.3 }, 0.4);
    pinTl.to(
      batteryCapsule,
      {
        maxWidth: "100vw",
        width: "100vw",
        borderRadius: "0px",
        borderWidth: "0px",
        boxShadow: "none",
        backgroundColor: "#52C133",
        ease: "power2.inOut",
        duration: 0.3,
      },
      0.4
    );
    pinTl.to(
      batteryFill,
      {
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        width: "100%",
        borderRadius: "0px",
        backgroundColor: "#52C133",
        ease: "power2.inOut",
        duration: 0.3,
      },
      0.4
    );
    pinTl.to([title, scrollIndicator], { opacity: 0, y: -25, ease: "power2.inOut", duration: 0.25 }, 0.4);

    if (boltIcon) {
      pinTl.to(boltIcon, { opacity: 0, x: "50vw", ease: "power2.in", duration: 0.2 }, 0.7);
    }
    pinTl.to(batteryCapsule, { height: "200vh", top: "-50vh", ease: "power2.inOut", duration: 0.3 }, 0.7);
  }

  // 2. HORIZONTAL PARALLAX CARD SLIDER
  if (sliderPin && track) {
    const getScrollDistance = () => {
      const parentContainer = track.parentElement || track;
      const parentWidth = parentContainer.clientWidth || window.innerWidth;
      const isMobile = window.innerWidth < 640;
      const extraPad = isMobile ? 40 : 80;
      return Math.max(0, track.scrollWidth - parentWidth + extraPad);
    };

    const sliderTl = gsap.timeline({
      scrollTrigger: {
        trigger: sliderPin,
        start: "top top",
        end: () => `+=${Math.max(1200, getScrollDistance() + 250)}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    sliderTl.to(track, { x: () => -getScrollDistance(), ease: "none" }, 0);

    const vehicleImages = document.querySelectorAll(".vehicle-card-img");
    vehicleImages.forEach((img) => {
      sliderTl.fromTo(img, { xPercent: 12 }, { xPercent: -12, ease: "none" }, 0);
    });
  }
}
