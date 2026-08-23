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
  const isInstall = activePage === "install";
  const isAbout = activePage === "about";

  const navbarHtml = `
  <!-- FIXED HEADER & NAVBAR COMPONENT -->
  <header id="header-navbar"
    class="fixed top-4 left-0 z-[9999] w-full px-4 sm:px-8 transition-all duration-500 ease-in-out opacity-100 pointer-events-auto translate-y-0"
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
            <button class="nav-link-btn flex items-center gap-1.5 transition duration-300 ${isHome ? 'text-secondary font-extrabold' : 'text-black/90 hover:text-black'}">
              <span>Home</span>
            </button>
          </div>
          <div data-menu="Explore" data-nav-target="explore" class="will-change-transform cursor-pointer">
            <button class="nav-link-btn flex items-center gap-1.5 transition duration-300 ${isExplore ? 'text-secondary font-extrabold' : 'text-black/90 hover:text-black'}">
              <span>Explore</span>
            </button>
          </div>
          <div data-menu="Install" data-nav-target="install" class="will-change-transform cursor-pointer">
            <button class="nav-link-btn flex items-center gap-1.5 transition duration-300 ${isInstall ? 'text-secondary font-extrabold' : 'text-black/90 hover:text-black'}">
              <span>Install Charger</span>
            </button>
          </div>
          <div data-menu="About" data-nav-target="about" class="will-change-transform cursor-pointer">
            <button class="nav-link-btn flex items-center gap-1.5 transition duration-300 ${isAbout ? 'text-secondary font-extrabold' : 'text-black/90 hover:text-black'}">
              <span>About</span>
            </button>
          </div>
        </div>

        <!-- Right Actions -->
        <div id="nav-actions" class="flex items-center gap-3">
          <a href="login.html"
            class="hidden md:flex h-11 items-center gap-2 rounded-2xl bg-[var(--secondary)] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--secondary-hover)] hover:scale-[1.02] active:scale-95 will-change-transform">
            <span>Sign In</span>
            <i class="fa-solid fa-user text-xs text-white"></i>
          </a>

          <button id="mobile-hamburger-btn" aria-label="Toggle Mobile Menu"
            class="nav-icon-circle grid h-11 w-11 place-items-center rounded-full lg:hidden transition-all duration-300 will-change-transform bg-white/15 text-white border border-white/20 hover:bg-white/25">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div id="mobile-drawer" data-open="false"
    class="fixed top-[85px] left-4 right-4 z-50 overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 lg:hidden border border-gray-100 pointer-events-none opacity-0 -translate-y-5">
    <div class="flex flex-col gap-5 p-6">
      <div data-mobile-nav="home" data-nav-target="home" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Home
      </div>
      <div data-mobile-nav="explore" data-nav-target="explore" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Explore
      </div>
      <div data-mobile-nav="install" data-nav-target="install" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        Install Charger
      </div>
      <div data-mobile-nav="about" class="py-1 border-b border-gray-50 cursor-pointer text-gray-800 font-bold text-base">
        About
      </div>
      <a href="login.html"
        class="mt-2 h-12 rounded-2xl bg-[var(--secondary)] font-bold text-white flex items-center justify-center gap-2 shadow-md hover:bg-[var(--secondary-hover)] transition">
        <span>Sign In</span>
        <i class="fa-solid fa-user text-white"></i>
      </a>
    </div>
  </div>
  `;

  container.innerHTML = navbarHtml;
}
