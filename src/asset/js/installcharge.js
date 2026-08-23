import { renderNavbar } from "./navbar.js";
import { renderFooter } from "./footer.js";
import { initNavbarEntrance, initInstallBannerAnimations } from "./animations.js";

const $ = window.jQuery || window.$;

let isTransitioning = false;

$(document).ready(() => {
  const activePage = "install";

  // Render Navbar and Footer
  renderNavbar("#navbar-app", { activePage });
  renderFooter("#footer-app", { activePage });

  updateNavbarStyle();
  playCurtainEntrance();
  initNavigation();
  initNavbarEvents();

  // Initialize Hero Section Interactive Hover Switcher
  initHeroHoverSwitcher();

  // Initialize Stacked Diagonal Dual-Image Hover
  initStackedImageHover();

  // Initialize Brand Marquee Parallax
  initBrandParallax();

  // Initialize Registration Form / Modal Events
  initHostRegistrationForm();

  // Initialize Smooth Anchor Link Scroll
  initSmoothScrollLinks();

  // Initialize Card Scroll Parallax (Right to Left)
  initCardParallax();

  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

  // Initialize Navbar Entrance & Banner Animations
  initNavbarEntrance();
  initInstallBannerAnimations();
});

/* ==========================================
   HERO HOVER SWITCHER LOGIC
   ========================================== */
function initHeroHoverSwitcher() {
  const $btnInstall = $("#btn-hero-install");
  const $btnShare = $("#btn-hero-share");
  const $bgLayer1 = $("#hero-bg-layer-1");
  const $bgLayer2 = $("#hero-bg-layer-2");
  const $badge = $("#hero-badge");
  const $badgeText = $("#hero-badge-text");
  const $title = $("#hero-title");
  const $subtitle = $("#hero-subtitle");
  const $cardImg = $("#hero-card-img");
  const $cardTitle = $("#hero-card-title");


  if (!$btnInstall.length || !$btnShare.length) return;

  const modeData = {
    install: {
      badgeIcon: '<i class="fa-solid fa-house-chimney text-[#52C133]"></i>',
      badgeText: "Residential Charging Solutions",
      wordText: "HOME",
      subtitle: "Create a charging point of your own with certified fast wallbox installation for your residence.",
      bgImg: "../asset/img/images/wall.jpg",
      cardTitle: "VoltMap Home Wallbox 22kW",
      cardIcon: "fa-solid fa-house-chimney"
    },
    share: {
      badgeIcon: '<i class="fa-solid fa-building text-[#52C133]"></i>',
      badgeText: "Business & P2P Network",
      wordText: "BUSINESS",
      subtitle: "Connect your charger to drivers worldwide and earn passive income with VoltMap P2P network.",
      bgImg: "../asset/img/images/station.jpg",
      cardTitle: "VoltMap Commercial Station",
      cardIcon: "fa-solid fa-charging-station"
    }
  };

  let currentMode = "install";

  function setHeroMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    const data = modeData[mode];

    if (mode === "install") {
      $btnInstall
        .addClass("bg-[#52C133] text-white ")
        .removeClass("bg-white text-black ");
      $btnShare
        .removeClass("bg-[#52C133] text-white ")
        .addClass("bg-white text-black ");

      $bgLayer1.removeClass("opacity-0").addClass("opacity-100");
      $bgLayer2.removeClass("opacity-100").addClass("opacity-0");
    } else {
      $btnShare
        .addClass("bg-[#52C133] text-white ")
        .removeClass("bg-white text-black ");
      $btnInstall
        .removeClass("bg-[#52C133] text-white ")
        .addClass("bg-white text-black  ");

      $bgLayer2.removeClass("opacity-0").addClass("opacity-100");
      $bgLayer1.removeClass("opacity-100").addClass("opacity-0");
    }

    // Smooth transition for text and card
    $title.add($subtitle).css("opacity", "0");
    $cardImg.css("opacity", "0.3");

    setTimeout(() => {
      if ($badge.length) {
        $badge.find("i").replaceWith(data.badgeIcon);
        $badgeText.text(data.badgeText);
      }
      $("#hero-title-word").text(data.wordText);
      $subtitle.text(data.subtitle);

      if ($cardImg.length) {
        $cardImg.attr("src", data.bgImg);
        $cardTitle.text(data.cardTitle);
        $("#hero-card-icon").attr("class", `${data.cardIcon} text-sm transition-transform duration-300 group-hover:scale-110`);
      }

      $title.add($subtitle).css("opacity", "1");
      $cardImg.css("opacity", "1");
    }, 200);
  }

  $btnInstall.on("mouseenter focus", () => setHeroMode("install"));
  $btnShare.on("mouseenter focus", () => setHeroMode("share"));
}


/* ==========================================
   HOST REGISTRATION FORM / MODAL LOGIC
   ========================================== */
function initHostRegistrationForm() {
  $("#host-registration-form").on("submit", function (e) {
    e.preventDefault();

    const name = $("#host-name").val();
    const phone = $("#host-phone").val();
    const city = $("#host-city").val();
    const wallbox = $("#host-wallbox").val();

    if (!name || !phone || !city) {
      alert("Harap lengkapi semua bidang formulir pendaftaran.");
      return;
    }

    const $btn = $(this).find('button[type="submit"]');
    const originalText = $btn.html();

    $btn.html('<i class="fa-solid fa-circle-notch animate-spin"></i> Memproses...').prop("disabled", true);

    setTimeout(() => {
      $btn.html('<i class="fa-solid fa-check"></i> Pendaftaran Berhasil!').addClass("bg-secondary");

      const $modal = $("#registration-success-modal");
      if ($modal.length) {
        $modal.removeClass("hidden flex").addClass("flex");
      } else {
        alert(`Terima kasih ${name}! Tim teknisi VoltMap akan menghubungi Anda di ${phone} untuk verifikasi lokasi di ${city}.`);
      }

      $("#host-registration-form")[0].reset();

      setTimeout(() => {
        $btn.html(originalText).removeClass("bg-secondary").prop("disabled", false);
      }, 3000);
    }, 1200);
  });

  $("#close-modal-btn").on("click", function () {
    $("#registration-success-modal").addClass("hidden").removeClass("flex");
  });
}

/* ==========================================
   CURTAIN & NAVIGATION SYSTEM
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
  if ($curtain.length && (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !$curtain.hasClass("hidden"))) {
    playCurtainEntrance();
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
    }, 450);
  } else {
    window.location.href = destinationUrl;
  }
}

function initNavigation() {
  $(document).on("click", "[data-nav-target]", function (e) {
    const target = $(this).attr("data-nav-target");

    if (target === "explore") {
      e.preventDefault();
      performPageTransition("exploremap.html");
      return;
    }
    if (target === "home") {
      e.preventDefault();
      performPageTransition("index.html");
      return;
    }
    if (target === "install") {
      e.preventDefault();
      performPageTransition("installcharge.html");
      return;
    }
    if (target === "about") {
      e.preventDefault();
      performPageTransition("about.html");
      return;
    }
    if (target === "login") {
      e.preventDefault();
      performPageTransition("login.html");
      return;
    }
    if (target === "register") {
      e.preventDefault();
      performPageTransition("register.html");
      return;
    }
  });

  $(document).on("click", 'a[href="index.html"], a[href="exploremap.html"], a[href="installcharge.html"], a[href="about.html"], a[href="login.html"], a[href="register.html"]', function (e) {
    const href = $(this).attr("href");
    const currentFile = window.location.pathname.split("/").pop();

    if (href !== currentFile && (href === "index.html" || href === "exploremap.html" || href === "installcharge.html" || href === "about.html" || href === "login.html" || href === "register.html")) {
      e.preventDefault();
      performPageTransition(href);
    }
  });
}

function updateNavbarStyle() {
  const scrollY = window.scrollY;
  const isTransparent = !scrollY || scrollY <= 50;
  const $container = $("#navbar-container");
  const $logo = $("#nav-logo");

  if (!$container.length) return;

  if (isTransparent) {
    $container
      .addClass("bg-transparent border-transparent shadow-none")
      .removeClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
    $logo.addClass("text-white").removeClass("text-[var(--primary)]");

    $(".nav-link-btn").each(function () {
      if ($(this).hasClass("text-secondary")) return;
      $(this)
        .addClass("text-white/90 hover:text-white")
        .removeClass("text-gray-700 hover:text-[var(--primary)] text-black/90 hover:text-black");
    });

    $(".nav-icon-circle")
      .addClass("bg-white/15 text-white border-white/20 hover:bg-white/25")
      .removeClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");
  } else {
    $container
      .removeClass("bg-transparent border-transparent shadow-none")
      .addClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
    $logo.removeClass("text-white").addClass("text-[var(--primary)]");

    $(".nav-link-btn").each(function () {
      if ($(this).hasClass("text-secondary")) return;
      $(this)
        .removeClass("text-white/90 hover:text-white")
        .addClass("text-gray-700 hover:text-[var(--primary)]");
    });

    $(".nav-icon-circle")
      .removeClass("bg-white/15 text-white border-white/20 hover:bg-white/25")
      .addClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");
  }
}

function initNavbarEvents() {
  $(window).on("scroll", () => {
    updateNavbarStyle();
  });

  $(document).on("click", "#mobile-hamburger-btn", function () {
    const $drawer = $("#mobile-drawer");
    const isOpen = $drawer.attr("data-open") === "true";

    if (isOpen) {
      $drawer
        .attr("data-open", "false")
        .addClass("pointer-events-none opacity-0 -translate-y-5")
        .removeClass("pointer-events-auto opacity-100 translate-y-0");
    } else {
      $drawer
        .attr("data-open", "true")
        .removeClass("pointer-events-none opacity-0 -translate-y-5")
        .addClass("pointer-events-auto opacity-100 translate-y-0");
    }
  });
}

/* ==========================================
   STACKED DIAGONAL DUAL IMAGE HOVER LOGIC
   ========================================== */
function initStackedImageHover() {
  const $triggerHome = $("#stacked-trigger-home");
  const $triggerCommercial = $("#stacked-trigger-commercial");
  const $container = $("#stacked-image-container");
  const $layerCommercial = $("#stacked-layer-commercial");
  const $dividerLine = $("#stacked-divider line");
  const $badgeHome = $("#badge-stacked-home");
  const $badgeCommercial = $("#badge-stacked-commercial");

  if (!$triggerHome.length || !$triggerCommercial.length) return;

  // Initial center diagonal line split: (0, 75%) to (100%, 20%)
  const initialClip = "polygon(0 75%, 100% 20%, 100% 100%, 0 100%)";

  // Fill towards bottom-right (reveals Top-Left Home Charger)
  const fillHomeClip = "polygon(0 140%, 100% 100%, 100% 100%, 0 100%)";

  // Fill towards top-left (fills Commercial Station across whole card)
  const fillCommercialClip = "polygon(0 -40%, 100% -95%, 100% 100%, 0 100%)";

  // Apply smooth cubic-bezier easing for high-end luxury feel
  $layerCommercial.css("transition", "clip-path 600ms cubic-bezier(0.16, 1, 0.3, 1)");
  $dividerLine.css("transition", "transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease");

  function setActiveBadge($active, $inactive) {
    $active
      .removeClass("bg-white text-black border-white/20 opacity-40 scale-100 shadow-xl shadow-sm")
      .addClass("bg-[#52C133] text-white border-[#52C133] scale-105 opacity-100 shadow-2xl");

    $inactive
      .removeClass("bg-[#52C133] text-white border-[#52C133] scale-105 opacity-100 shadow-2xl shadow-xl")
      .addClass("bg-white text-black border-white/20 scale-100 opacity-40 shadow-sm");
  }

  function resetBadges() {
    $badgeHome.add($badgeCommercial)
      .removeClass("bg-[#52C133] text-white border-[#52C133] scale-105 opacity-40 shadow-2xl shadow-sm")
      .addClass("bg-white text-black border-white/20 scale-100 opacity-100 shadow-xl");
  }

  // Hover Top-Left -> Slide diagonal line down-right (filling Home Charger)
  $triggerHome.on("mouseenter touchstart", function () {
    $layerCommercial.css("clip-path", fillHomeClip);
    $dividerLine.css({
      transform: "translateY(65%)",
      opacity: "0"
    });
    setActiveBadge($badgeHome, $badgeCommercial);
  });

  // Hover Bottom-Right -> Slide diagonal line up-left (filling Commercial Station)
  $triggerCommercial.on("mouseenter touchstart", function () {
    $layerCommercial.css("clip-path", fillCommercialClip);
    $dividerLine.css({
      transform: "translateY(-95%)",
      opacity: "0"
    });
    setActiveBadge($badgeCommercial, $badgeHome);
  });

  // Mouse leave -> Restore center diagonal split
  $container.on("mouseleave", function () {
    $layerCommercial.css("clip-path", initialClip);
    $dividerLine.css({
      transform: "translateY(0%)",
      opacity: "1"
    });
    resetBadges();
  });
}

/* ==========================================
   BRAND CAROUSEL SUBTLE PARALLAX & REVERSE ON SCROLL
   ========================================== */
function initBrandParallax() {
  const $sec = $("#ev-compatibility-section");
  const $row1 = $("#brand-marquee-row-1");
  const $row2 = $("#brand-marquee-row-2");

  if (!$sec.length) return;

  // Dynamically duplicate items in JS to keep HTML clean & lightweight across full screen width
  const $marqueeLeft = $row1.find(".animate-marquee-left");
  const $marqueeRight = $row2.find(".animate-marquee-right");

  if ($marqueeLeft.length && $marqueeLeft.children().length < 27) {
    const $items = $marqueeLeft.children().clone();
    $marqueeLeft.append($items.clone()).append($items.clone());
  }
  if ($marqueeRight.length && $marqueeRight.children().length < 27) {
    const $items = $marqueeRight.children().clone();
    $marqueeRight.append($items.clone()).append($items.clone());
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  // Parallax Scroll Effect:
  // Row tracks have overflow bleed margins (-300px) so 200px parallax shift produces
  // a rich, distinct reverse scroll effect while keeping edges far off-screen.
  gsap.to($row1[0], {
    x: "200px",
    ease: "none",
    scrollTrigger: {
      trigger: $sec[0],
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6
    }
  });

  gsap.to($row2[0], {
    x: "-200px",
    ease: "none",
    scrollTrigger: {
      trigger: $sec[0],
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6
    }
  });
}

/* ==========================================
   SMOOTH SCROLL ANCHOR LINKS LOGIC
   ========================================== */
function initSmoothScrollLinks() {
  $(document).on("click", 'a[href^="#"]', function (e) {
    const targetId = $(this).attr("href");
    if (targetId === "#" || !targetId) return;

    const $target = $(targetId);
    if ($target.length) {
      e.preventDefault();
      const navbarHeight = 80;
      const targetOffset = $target.offset().top - navbarHeight;

      window.scrollTo({
        top: Math.max(0, targetOffset),
        behavior: "smooth"
      });
    }
  });
}

/* ==========================================
   CARD SCROLL PARALLAX ANIMATION (RIGHT TO LEFT)
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

