// GSAP Animations Module for Voltmap

export const statItemsConfig = [
  {
    targetValue: 15000,
    format: (val) => `${Math.floor(val).toLocaleString("en-US")}+`,
    initialText: "0+",
  },
  {
    targetValue: 82,
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
    stateA: "M 0,32 C 15.6,55 34.4,10 50,32 C 65.6,58 84.4,14 100,32 L 100,88 C 84.4,74 65.6,98 50,88 C 34.4,74 15.6,96 0,88 Z",
    stateB: "M 0,18 C 15.6,8 34.4,48 50,18 C 65.6,6 84.4,52 100,18 L 100,94 C 84.4,62 65.6,104 50,94 C 34.4,60 15.6,100 0,94 Z",
  },
  back: {
    stateA: "M -5,26 C 11,48 29,4 45,26 C 61,50 79,8 105,26 L 105,94 C 79,80 61,104 45,94 C 29,78 11,102 -5,94 Z",
    stateB: "M -5,12 C 11,2 29,42 45,12 C 61,0 79,46 105,12 L 105,98 C 79,66 61,108 45,98 C 29,64 11,104 -5,98 Z",
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
    if (!el || !section) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: config.targetValue,
      duration: 3.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
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
    const startX = isMobile ? -50 : -60;
    const endX = 5;

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
      const parentWidth = track.parentElement ? track.parentElement.clientWidth : window.innerWidth;
      const isMobile = window.innerWidth < 640;
      const offset = isMobile ? 30 : 60;
      return track.scrollWidth - parentWidth + offset;
    };

    const sliderTl = gsap.timeline({
      scrollTrigger: {
        trigger: sliderPin,
        start: "top top",
        end: () => `+=${Math.max(1400, getScrollDistance() + 400)}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    sliderTl.to(track, { x: () => -getScrollDistance(), ease: "none" }, 0);

    const vehicleImages = document.querySelectorAll(".vehicle-card-img");
    vehicleImages.forEach((img) => {
      sliderTl.fromTo(img, { xPercent: 12 }, { xPercent: -12, ease: "none" }, 0);
    });
  }
}
