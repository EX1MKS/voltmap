import { renderNavbar } from "./navbar.js";
import { renderFooter } from "./footer.js";

const $ = window.jQuery || window.$;

let isTransitioning = false;

$(document).ready(() => {
  const activePage = "about";

  // Render Navbar and Footer Components
  renderNavbar("#navbar-app", { activePage });
  renderFooter("#footer-app", { activePage });

  updateNavbarStyle();
  playCurtainEntrance();
  initNavigation();
  initNavbarEvents();
  initCardParallax();
  initWaveParallax();
  initEcosystemHorizontalParallax();
  initLeadershipModal();

  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }
});

/* ==========================================
   WAVE SCROLL PARALLAX ANIMATION (LEFT TO RIGHT)
   ========================================== */
function initWaveParallax() {
  const layer1 = document.querySelector(".wave-parallax-layer-1");
  const layer2 = document.querySelector(".wave-parallax-layer-2");
  const leaves = document.querySelector(".wave-parallax-leaves");
  const card = document.querySelector("#our-mission .rounded-3xl") || document.querySelector("#our-mission");
  if (!card || (!layer1 && !layer2)) return;

  // 1. GSAP ScrollTrigger for strong multi-layered 3D wave parallax
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    if (layer1) {
      gsap.fromTo(
        layer1,
        { x: "-260px", y: "35px" },
        {
          x: "260px",
          y: "-35px",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.3,
          },
        }
      );
    }

    if (layer2) {
      gsap.fromTo(
        layer2,
        { x: "-560px", y: "-45px" },
        {
          x: "560px",
          y: "45px",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.3,
          },
        }
      );
    }

    if (leaves) {
      gsap.fromTo(
        leaves,
        { x: "-180px", y: "60px" },
        {
          x: "180px",
          y: "-60px",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        }
      );
    }
    return;
  }

  // 2. High-performance requestAnimationFrame fallback for strong scroll parallax
  let ticking = false;

  function updateWaveParallax() {
    const windowHeight = window.innerHeight;
    const rect = card.getBoundingClientRect();

    if (rect.bottom > 0 && rect.top < windowHeight) {
      const totalDist = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const progress = Math.min(Math.max(currentPos / totalDist, 0), 1); // 0 to 1

      if (layer1) {
        const translateX1 = (progress - 0.5) * 520; // -260px to +260px
        const translateY1 = (0.5 - progress) * 70;  // +35px to -35px
        layer1.style.transform = `translate3d(${translateX1}px, ${translateY1}px, 0)`;
      }
      if (layer2) {
        const translateX2 = (progress - 0.5) * 1120; // -560px to +560px
        const translateY2 = (progress - 0.5) * 90;   // -45px to +45px
        layer2.style.transform = `translate3d(${translateX2}px, ${translateY2}px, 0)`;
      }
      if (leaves) {
        const translateXLeaves = (progress - 0.5) * 360; // -180px to +180px
        const translateYLeaves = (0.5 - progress) * 120; // +60px to -60px
        leaves.style.transform = `translate3d(${translateXLeaves}px, ${translateYLeaves}px, 0)`;
      }
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateWaveParallax);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateWaveParallax();
}

/* ==========================================
   CARD SCROLL PARALLAX ANIMATION
   ========================================== */
function initCardParallax() {
  const wrappers = document.querySelectorAll(".card-parallax-wrapper");
  if (!wrappers.length) return;

  // 1. Primary approach: GSAP ScrollTrigger for horizontal right-to-left scrub
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    wrappers.forEach((wrapper) => {
      const card = wrapper.closest(".group") || wrapper.parentElement;
      gsap.fromTo(
        wrapper,
        { x: "12%" },
        {
          x: "-12%",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    });
    return;
  }

  // 2. High-performance requestAnimationFrame fallback for right-to-left horizontal scroll parallax
  let ticking = false;

  function updateParallax() {
    const windowHeight = window.innerHeight;

    wrappers.forEach((wrapper) => {
      const card = wrapper.closest(".group") || wrapper.parentElement;
      const rect = card.getBoundingClientRect();

      if (rect.bottom > 0 && rect.top < windowHeight) {
        const totalDist = windowHeight + rect.height;
        const currentPos = windowHeight - rect.top;
        const progress = Math.min(Math.max(currentPos / totalDist, 0), 1);
        const translateX = (0.5 - progress) * 60; // moves from right (+30px) to left (-30px)

        wrapper.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateParallax();
}

/* ==========================================
   NAVIGATION & CURTAIN PAGE TRANSITIONS
   ========================================== */
function playCurtainEntrance() {
  const isTransitioningFromPrev = sessionStorage.getItem("voltmap_transition") === "true";
  sessionStorage.removeItem("voltmap_transition");

  const $curtain = $("#page-curtain-overlay");
  const $layer1 = $("#curtain-layer-1");
  const $layer2 = $("#curtain-layer-2");

  if (!$curtain.length) return;

  if (isTransitioningFromPrev || !$curtain.hasClass("hidden")) {
    $curtain.removeClass("hidden pointer-events-none");
    $layer1.removeClass("animate-wipe-in animate-wipe-in-delayed").addClass("animate-wipe-out");
    $layer2.removeClass("animate-wipe-in animate-wipe-in-delayed").addClass("animate-wipe-out-delayed");

    setTimeout(() => {
      $curtain.addClass("hidden pointer-events-none");
      $layer1.removeClass("animate-wipe-in animate-wipe-in-delayed animate-wipe-out animate-wipe-out-delayed");
      $layer2.removeClass("animate-wipe-in animate-wipe-in-delayed animate-wipe-out animate-wipe-out-delayed");
    }, 600);
  } else {
    $curtain.addClass("hidden pointer-events-none");
  }
}

window.addEventListener("pageshow", (event) => {
  isTransitioning = false;
  const $curtain = $("#page-curtain-overlay");
  if ($curtain.length) {
    if (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !$curtain.hasClass("hidden")) {
      playCurtainEntrance();
    }
  }
});

window.addEventListener("pagehide", () => {
  isTransitioning = false;
});

function performPageTransition(destinationUrl) {
  if (isTransitioning) return;
  isTransitioning = true;

  sessionStorage.setItem("voltmap_transition", "true");

  const $curtain = $("#page-curtain-overlay");
  const $layer1 = $("#curtain-layer-1");
  const $layer2 = $("#curtain-layer-2");

  if ($curtain.length) {
    $curtain.removeClass("hidden pointer-events-none");
    $layer1.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in");
    $layer2.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in-delayed");

    setTimeout(() => {
      window.location.href = destinationUrl;
    }, 650);
  } else {
    window.location.href = destinationUrl;
  }
}

function initNavigation() {
  $('[data-nav-target="home"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("index.html");
  });

  $('[data-nav-target="explore"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("exploremap.html");
  });

  $('[data-nav-target="install"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("installcharge.html");
  });

  $('[data-nav-target="about"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("about.html");
  });

  $('[data-nav-target="login"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("login.html");
  });

  $('[data-nav-target="register"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("register.html");
  });

  $(document).on("click", 'a[href="index.html"], a[href="exploremap.html"], a[href="installcharge.html"], a[href="about.html"], a[href="login.html"], a[href="register.html"]', function (e) {
    const href = $(this).attr("href");
    const currentFile = window.location.pathname.split("/").pop();

    if (href !== currentFile && (href === "index.html" || href === "exploremap.html" || href === "installcharge.html" || href === "about.html" || href === "login.html" || href === "register.html")) {
      e.preventDefault();
      performPageTransition(href);
    }
  });

  // Smooth scroll for internal anchor links
  $('a[href^="#"]').on("click", function (e) {
    const href = $(this).attr("href");
    if (href && href !== "#" && href.startsWith("#")) {
      const $target = $(href);
      if ($target.length) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: $target.offset().top - 80 }, 600);
      }
    }
  });
}

function initNavbarEvents() {
  $(window).on("scroll", updateNavbarStyle);

  $("#mobile-hamburger-btn").on("click", function () {
    const $drawer = $("#mobile-drawer");
    const isOpen = $drawer.attr("data-open") === "true";
    if (isOpen) {
      $drawer.attr("data-open", "false").addClass("pointer-events-none opacity-0 -translate-y-5").removeClass("opacity-100 translate-y-0");
    } else {
      $drawer.attr("data-open", "true").removeClass("pointer-events-none opacity-0 -translate-y-5").addClass("opacity-100 translate-y-0");
    }
  });

  $("[data-mobile-nav]").on("click", function () {
    const page = $(this).attr("data-mobile-nav");
    $("#mobile-drawer").attr("data-open", "false").addClass("pointer-events-none opacity-0 -translate-y-5").removeClass("opacity-100 translate-y-0");
    if (page === "home" || page === "explore" || page === "install" || page === "about" || page === "login" || page === "register") {
      const targetUrl = page === "home" ? "index.html" : page === "explore" ? "exploremap.html" : page === "install" ? "installcharge.html" : page === "about" ? "about.html" : page === "login" ? "login.html" : "register.html";
      performPageTransition(targetUrl);
    }
  });
}

function updateNavbarStyle() {
  const $navbarContainer = $("#navbar-container");
  const $header = $("#header-navbar");
  const $logo = $("#nav-logo");

  if (!$navbarContainer.length) return;

  const scrollY = window.scrollY;
  const heroHeight = $("#about-hero").outerHeight() || window.innerHeight;
  const isTransparent = scrollY < heroHeight - 70;

  if (isTransparent) {
    $navbarContainer
      .addClass("bg-transparent border-transparent shadow-none")
      .removeClass("bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80");
    $logo.addClass("text-white").removeClass("text-slate-900");
    $(".nav-link-btn").addClass("text-white/90 hover:text-white").removeClass("text-slate-800 hover:text-[var(--secondary)]");
    $(".nav-icon-circle").addClass("bg-white/15 text-white border-white/20 hover:bg-white/25").removeClass("bg-slate-100 text-slate-800 hover:bg-slate-200");
  } else {
    $navbarContainer
      .removeClass("bg-transparent border-transparent shadow-none")
      .addClass("bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80");
    $logo.removeClass("text-white").addClass("text-slate-900");
    $(".nav-link-btn").removeClass("text-white/90 hover:text-white").addClass("text-slate-800 hover:text-[var(--secondary)]");
    $(".nav-icon-circle").removeClass("bg-white/15 text-white border-white/20 hover:bg-white/25").addClass("bg-slate-100 text-slate-800 hover:bg-slate-200");
  }

  $header.removeClass("opacity-0 pointer-events-none -translate-y-6").addClass("opacity-100 pointer-events-auto translate-y-0");
}

/* ==========================================
   ECOSYSTEM PINNED HORIZONTAL PARALLAX SCROLL
   ========================================== */
function initEcosystemHorizontalParallax() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const pinSection = document.querySelector("#ecosystem-pin-container");
  const track = document.querySelector("#ecosystem-slider-track");

  if (!pinSection || !track) return;

  const getScrollDistance = () => {
    const parentContainer = track.parentElement || track;
    const parentWidth = parentContainer.clientWidth || window.innerWidth;
    const isMobile = window.innerWidth < 640;
    const extraPad = isMobile ? 40 : 100;
    return Math.max(0, track.scrollWidth - parentWidth + extraPad);
  };

  const sliderTl = gsap.timeline({
    scrollTrigger: {
      trigger: pinSection,
      start: "top top",
      end: () => `+=${Math.max(1200, getScrollDistance() + 300)}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  sliderTl.to(track, { x: () => -getScrollDistance(), ease: "none" }, 0);

  const cardImages = document.querySelectorAll(".ecosystem-card-img");
  cardImages.forEach((img) => {
    sliderTl.fromTo(img, { xPercent: 12 }, { xPercent: -12, ease: "none" }, 0);
  });
}

/* ==========================================
   LEADERSHIP MODAL & NAVIGATION CONTROLLER
   ========================================== */
function initLeadershipModal() {
  const leadershipData = [
    {
      name: "Ryan Mitchell",
      role: "Founder and Chief Executive Officer",
      img: "../asset/img/images/leadership/man1.jpg",
      bio: [
        "Ryan founded VoltMap with a mission to transition the world to sustainable mobility by building intelligent EV charging networks and energy infrastructure. Under his leadership, VoltMap has expanded globally, serving millions of EV drivers.",
        "Before founding VoltMap, Ryan completed his doctorate in Mechanical Engineering at MIT, focusing on energy systems and advanced vehicle engineering. He has been recognized as an industry visionary in clean tech innovation."
      ]
    },
    {
      name: "Claire McDonough",
      role: "Chief Financial Officer",
      img: "../asset/img/images/leadership/women1.jpg",
      bio: [
        "Claire is responsible for VoltMap's finance, corporate strategy, capital deployment, and financial operations. Her team leverages data and financial insight to inform strategic decision making and is working to create a strong financial foundation and the processes and systems needed to help VoltMap scale globally.",
        "Before joining VoltMap in early 2021, Claire was a Managing Director in Investment Banking and co-head of the Disruptive Commerce Group at J.P. Morgan. In addition to working in financial leadership roles at Fairway Market and Credit Suisse, she spent a period of time as a professional pastry chef in the South of France. Claire graduated with a Bachelor of Arts in Public Policy and Visual Art from Duke University and earned her Master of Business Administration at the University of Chicago's Booth School of Business."
      ]
    },
    {
      name: "Javier Varela",
      role: "Chief Operations Officer",
      img: "../asset/img/images/leadership/man2.jpg",
      bio: [
        "Javier leads VoltMap's global operational footprint, charger deployment, field engineering, and service depot logistics. He ensures that thousands of charging stations maintain peak reliability and 99.9% uptime across all territories.",
        "With over two decades of global automotive and energy operations management, Javier previously managed manufacturing and supply chain networks at major automotive OEM divisions across Europe and North America."
      ]
    },
    {
      name: "Mike Callahan",
      role: "Chief Administrative Officer",
      img: "../asset/img/images/leadership/man3.jpg",
      bio: [
        "Mike oversees VoltMap's corporate governance, legal affairs, human resources, facilities, and workplace operations. He focuses on fostering an inclusive workplace culture and scaling organizational efficiency.",
        "Mike brings extensive legal and administrative executive experience across technology and infrastructure sectors, having earned his Law degree from Stanford Law School."
      ]
    },
    {
      name: "Sarah Jenkins",
      role: "Chief Technology Officer",
      img: "../asset/img/images/leadership/women2.jpg",
      bio: [
        "Sarah leads VoltMap's engineering, software platform architecture, AI route planning algorithms, and smart grid integration technologies. She drives software innovation that powers seamless EV charging experiences.",
        "Prior to VoltMap, Sarah was VP of Engineering at a leading cloud infrastructure company and holds several patents in distributed systems and energy management algorithms."
      ]
    },
    {
      name: "Marcus Vance",
      role: "Chief Design Officer",
      img: "../asset/img/images/leadership/man4.jpg",
      bio: [
        "Marcus guides VoltMap's industrial design, user experience design, brand identity, and hardware ergonomics. His team crafts intuitive charger hardware and sleek digital interfaces for desktop and mobile apps.",
        "Marcus studied Industrial Design at the ArtCenter College of Design and has earned multiple International Design Excellence Awards (IDEA) for clean tech product designs."
      ]
    },
    {
      name: "Elena Rostova",
      role: "VP of Global Infrastructure",
      img: "../asset/img/images/leadership/women3.jpg",
      bio: [
        "Elena manages site selection, high-power grid interconnections, land acquisition, and utility partnerships for Ultra-Fast charging hubs across urban and highway corridors.",
        "She holds an M.S. in Electrical Engineering from ETH Zürich and has spearheaded grid modernization projects across Europe and North America for over 15 years."
      ]
    },
    {
      name: "David Chen",
      role: "Head of Battery Technology",
      img: "../asset/img/images/leadership/man5.jpg",
      bio: [
        "David oversees VoltMap's stationary battery energy storage systems (BESS) and microgrid integration, enabling charge stations to operate reliably even under heavy grid demand.",
        "David completed his Ph.D. in Materials Science at Stanford University and holds 12 patents in lithium-ion chemistry and energy storage safety."
      ]
    },
    {
      name: "Amara Okafor",
      role: "VP of Software & Digital Experience",
      img: "../asset/img/images/leadership/women4.jpg",
      bio: [
        "Amara oversees customer mobile apps, driver navigation features, fleet charging software, and payment processing platforms across the VoltMap ecosystem.",
        "She previously led product teams at leading fintech and consumer technology giants, earning her B.S. in Computer Science from Carnegie Mellon University."
      ]
    },
    {
      name: "Tom Rivera",
      role: "VP of Commercial Networks",
      img: "../asset/img/images/leadership/man6.jpg",
      bio: [
        "Tom leads enterprise partnerships with commercial EV fleets, transit agencies, and real estate developers to install turnkey EV charging hubs.",
        "Tom brings 18 years of B2B business development experience in renewable energy, heavy equipment, and commercial real estate infrastructure."
      ]
    },
    {
      name: "Jessica Lin",
      role: "VP of Sustainability & Policy",
      img: "../asset/img/images/leadership/women5.jpg",
      bio: [
        "Jessica directs VoltMap's ESG commitments, zero-carbon supply chain initiatives, government relations, and clean energy regulatory strategy worldwide.",
        "She earned her Master of Public Policy from Harvard Kennedy School and has served as an advisor on clean transport initiatives for international policy groups."
      ]
    },
    {
      name: "Robert Sterling",
      role: "VP of Supply Chain",
      img: "../asset/img/images/leadership/man7.jpg",
      bio: [
        "Robert manages hardware procurement, contract manufacturing, quality assurance, and component sourcing for all VoltMap fast-charging hardware.",
        "He has led global hardware procurement for tier-1 automotive suppliers and semiconductor manufacturers across Asia and North America."
      ]
    },
    {
      name: "Nadia Al-Mansoor",
      role: "VP of Customer Experience",
      img: "../asset/img/images/leadership/women6.jpg",
      bio: [
        "Nadia is dedicated to delivering 24/7 world-class customer support and charger reliability monitoring for individual drivers and commercial fleet operators.",
        "She earned an MBA from INSEAD and previously scaled customer success organizations for high-growth tech platforms across global markets."
      ]
    },
    {
      name: "Klaus Weber",
      role: "Head of Power Electronics",
      img: "../asset/img/images/leadership/man8.jpg",
      bio: [
        "Klaus leads hardware engineering for VoltMap's 350kW+ liquid-cooled fast chargers, concentrating on power density, thermal efficiency, and durability.",
        "Klaus holds a Master's in Power Electronics from TU Munich and has engineered high-voltage systems for racing and commercial EV platforms."
      ]
    },
    {
      name: "Arthur Brooks",
      role: "General Counsel & Corporate Secretary",
      img: "../asset/img/images/leadership/man9.jpg",
      bio: [
        "Arthur manages VoltMap's legal strategy, intellectual property portfolio, compliance, and corporate transactions across global operating regions.",
        "He received his Juris Doctor from Yale Law School and practiced corporate law at leading international law firms specializing in tech and energy transactions."
      ]
    }
  ];

  let currentIndex = 0;
  let isModalOpen = false;

  const $modal = $("#leadership-modal");
  const $container = $("#leadership-modal-container");
  const $backdrop = $("#leadership-modal-backdrop");
  const $closeBtn = $(".leadership-modal-close");
  const $prevBtn = $(".leadership-modal-prev");
  const $nextBtn = $(".leadership-modal-next");

  const $counter = $(".leadership-modal-counter");
  const $name = $(".leadership-modal-name");
  const $role = $(".leadership-modal-role");
  const $bio = $(".leadership-modal-bio");
  const $img = $(".leadership-modal-img");
  const $contentArea = $(".leadership-modal-content-area");

  function updateModalData(index, animate = false) {
    if (index < 0 || index >= leadershipData.length) return;
    const member = leadershipData[index];

    if (animate) {
      $contentArea.addClass("opacity-0");
      setTimeout(() => {
        $counter.text(`${index + 1} / ${leadershipData.length}`);
        $name.text(member.name);
        $role.text(member.role);
        $img.attr("src", member.img).attr("alt", member.name);

        $bio.empty();
        member.bio.forEach((p) => {
          $bio.append(`<p>${p}</p>`);
        });

        $contentArea.removeClass("opacity-0");
      }, 150);
    } else {
      $counter.text(`${index + 1} / ${leadershipData.length}`);
      $name.text(member.name);
      $role.text(member.role);
      $img.attr("src", member.img).attr("alt", member.name);

      $bio.empty();
      member.bio.forEach((p) => {
        $bio.append(`<p>${p}</p>`);
      });
    }
  }

  function openModal(index) {
    currentIndex = index;
    updateModalData(currentIndex, false);
    isModalOpen = true;

    $modal.removeClass("hidden pointer-events-none").addClass("flex");
    setTimeout(() => {
      $modal.removeClass("opacity-0").addClass("opacity-100");
      $container.removeClass("scale-95").addClass("scale-100");
    }, 10);

    $("body").addClass("overflow-hidden");
  }

  function closeModal() {
    if (!isModalOpen) return;
    isModalOpen = false;

    $modal.removeClass("opacity-100").addClass("opacity-0");
    $container.removeClass("scale-100").addClass("scale-95");

    setTimeout(() => {
      $modal.addClass("hidden pointer-events-none").removeClass("flex");
      $("body").removeClass("overflow-hidden");
    }, 300);
  }

  // Card click event
  $(document).on("click", ".leadership-card", function () {
    const idx = parseInt($(this).attr("data-index"), 10) || 0;
    openModal(idx);
  });

  // Close modal events
  $closeBtn.on("click", closeModal);
  $backdrop.on("click", closeModal);

  // Next / Prev events
  $nextBtn.on("click", function (e) {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % leadershipData.length;
    updateModalData(currentIndex, true);
  });

  $prevBtn.on("click", function (e) {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + leadershipData.length) % leadershipData.length;
    updateModalData(currentIndex, true);
  });

  // Keyboard navigation
  $(document).on("keydown", function (e) {
    if (!isModalOpen) return;
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % leadershipData.length;
      updateModalData(currentIndex, true);
    } else if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + leadershipData.length) % leadershipData.length;
      updateModalData(currentIndex, true);
    }
  });
}


