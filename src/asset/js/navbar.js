/**
 * VOLTMAP Navbar Component
 * Reusable JavaScript Component for VOLTMAP Navigation Header & Mobile Drawer
 */

export function renderNavbar(targetElementOrSelector = "#navbar-app", options = {}) {
  const {
    activePage = "home",
    logoSrc = "../asset/img/logo.png",
    brandName = "VOLTMAP"
  } = options;

  let container = typeof targetElementOrSelector === "string"
    ? document.querySelector(targetElementOrSelector)
    : targetElementOrSelector;

  if (!container) {
    container = document.getElementById("navbar-app") || document.getElementById("header-navbar-root");
  }

  if (!container) return;

  const isHome = activePage === "home";
  const isExplore = activePage === "explore";

  const navbarHtml = `
  <!-- FIXED HEADER & NAVBAR COMPONENT -->
  <header id="header-navbar"
    class="fixed top-4 left-0 z-50 w-full px-4 sm:px-8 transition-all duration-500 ease-in-out opacity-100 pointer-events-auto translate-y-0"
    data-active-page="${activePage}">
    <div id="navbar-container"
      class="mx-auto max-w-full h-[64px] overflow-hidden rounded-[24px] transition-all duration-500 bg-transparent border border-transparent shadow-none">
      <nav class="flex h-[64px] items-center justify-between px-6 sm:px-10">
        <!-- Logo with PNG Image -->
        <a href="${isHome ? '#' : 'index.html'}" id="nav-logo" data-nav-target="home"
          class="flex items-center gap-3 text-[22px] font-black tracking-[6px] transition-colors duration-300 will-change-transform text-white group">
          <img src="${logoSrc}" alt="${brandName} Logo" class="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md" />
          <span class="font-extrabold tracking-[4px] text-xl">${brandName}</span>
        </a>

        <!-- Desktop Nav Center Items -->
        <div id="nav-menu" class="hidden lg:flex items-center gap-10 text-sm font-bold tracking-wide">
          <div data-menu="Home" data-nav-target="home" class="will-change-transform cursor-pointer">
            <button class="nav-link-btn flex items-center gap-1.5 transition duration-300 ${isHome ? 'text-white font-extrabold' : 'text-white/90 hover:text-white'}">
              <span>Home</span>
            </button>
          </div>
          <div data-menu="Charging" data-nav-target="explore" class="will-change-transform cursor-pointer">
            <button class="nav-link-btn flex items-center gap-1.5 transition duration-300 ${isExplore ? 'text-[var(--secondary)] font-extrabold' : 'text-white/90 hover:text-white'}">
              <span>Charging</span>
            </button>
          </div>
          <div data-menu="Technology" class="will-change-transform cursor-pointer">
            <a href="${isHome ? '#installcharger-section' : 'index.html#installcharger-section'}" class="nav-link-btn flex items-center gap-1.5 transition duration-300 text-white/90 hover:text-white">
              <span>Technology</span>
            </a>
          </div>
          <div data-menu="Discover" class="will-change-transform cursor-pointer">
            <a href="${isHome ? '#p2p-section' : 'index.html#p2p-section'}" class="nav-link-btn flex items-center gap-1.5 transition duration-300 text-white/90 hover:text-white">
              <span>Discover</span>
            </a>
          </div>
          <div data-menu="About" class="will-change-transform cursor-pointer">
            <a href="${isHome ? '#stats-section' : 'index.html#stats-section'}" class="nav-link-btn flex items-center gap-1.5 transition duration-300 text-white/90 hover:text-white">
              <span>About</span>
            </a>
          </div>
        </div>

        <!-- Right Actions -->
        <div id="nav-actions" class="flex items-center gap-3">
          <button data-nav-target="explore"
            class="hidden md:flex h-11 items-center gap-2 rounded-full bg-[var(--secondary)] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--secondary-hover)] hover:scale-[1.02] active:scale-95 will-change-transform">
            <i class="fa-solid fa-bolt text-xs text-white"></i>
            <span>Explore Map</span>
          </button>

          <button aria-label="User Account"
            class="nav-icon-circle hidden sm:grid h-11 w-11 place-items-center rounded-full transition-all duration-300 will-change-transform bg-white/15 text-white border border-white/20 hover:bg-white/25">
            <i class="fa-solid fa-user text-sm"></i>
          </button>

          <button id="mobile-hamburger-btn" aria-label="Toggle Mobile Menu"
            class="nav-icon-circle grid h-11 w-11 place-items-center rounded-full lg:hidden transition-all duration-300 will-change-transform bg-white/15 text-white border border-white/20 hover:bg-white/25">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      <!-- MegaMenu Dropdown Container -->
      <div id="megamenu-container" class="hidden px-8 py-8 bg-[var(--background)]"></div>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div id="mobile-drawer" data-open="false"
    class="fixed top-[85px] left-4 right-4 z-40 overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 lg:hidden border border-gray-100 pointer-events-none opacity-0 -translate-y-5">
    <div class="flex flex-col gap-5 p-6">
      <div data-mobile-nav="home" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Home
      </div>
      <div data-mobile-nav="explore"
        class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Charging & Map
      </div>
      <div data-mobile-nav="home" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Technology
      </div>
      <div data-mobile-nav="home" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Discover
      </div>
      <div data-mobile-nav="home" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        About
      </div>
      <button data-mobile-nav="explore"
        class="mt-2 h-12 rounded-full bg-[var(--secondary)] font-bold text-white flex items-center justify-center gap-2 shadow-md hover:bg-[var(--secondary-hover)] transition">
        <i class="fa-solid fa-bolt text-white"></i>
        <span>Explore Map</span>
      </button>
    </div>
  </div>
  `;

  container.innerHTML = navbarHtml;
}
