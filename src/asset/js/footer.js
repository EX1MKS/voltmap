import { renderSignup } from "./signup.js";

export function renderFooter(targetElementOrSelector = "#footer-app", options = {}) {
  // Render Sign Up Component if container exists on page
  if (document.querySelector("#signup-app")) {
    renderSignup("#signup-app", options);
  }

  const {
    activePage = "home",
    brandName = "VOLTMAP"
  } = options;

  let container = typeof targetElementOrSelector === "string"
    ? document.querySelector(targetElementOrSelector)
    : targetElementOrSelector;

  if (!container) {
    container = document.getElementById("footer-app") || document.getElementById("footer-section");
  }

  if (!container) return;

  const isHome = activePage === "home";

  const footerHtml = `
  <footer id="footer-section"
    class="w-full bg-white text-slate-900 pt-16 pb-12 px-4 sm:px-6 lg:px-12">
    <div class="max-w-7xl mx-auto space-y-12">
      <div
        class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center text-white font-bold shadow-sm">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <span class="text-2xl font-black tracking-[4px] text-slate-900">${brandName}</span>
          </div>
          <p class="text-slate-600 text-sm max-w-md font-medium">
            Accelerating the transition to sustainable mobility through high-speed, reliable EV charging infrastructure
            around the world.
          </p>
        </div>

      
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-sm text-slate-600">
        <div class="space-y-3">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">For Drivers</h4>
          <ul class="space-y-2.5 font-medium">
            <li><a href="${isHome ? 'exploremap.html' : '#'}" class="hover:text-[var(--secondary)] text-slate-600 transition">Station Finder</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Charging Rates</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Nearby Chargers</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">EV Compatibility</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">For Business</h4>
          <ul class="space-y-2.5 font-medium">
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Install a Charger</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Share Your Charger</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Fleet Charging</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Partner With Us</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Company</h4>
          <ul class="space-y-2.5 font-medium">
            <li><a href="about.html" class="hover:text-[var(--secondary)] text-slate-600 transition">About VoltMap</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Stories</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Our Mission</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Careers</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Support</h4>
          <ul class="space-y-2.5 font-medium">
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Help Center</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">24/7 Hotline</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Network Status</a></li>
            <li><a href="#" class="hover:text-[var(--secondary)] text-slate-600 transition">Contact Us</a></li>
          </ul>
        </div>

        <div class="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Follow Us</h4>
          <div class="flex items-center gap-3">
            <a href="#" aria-label="Twitter"
              class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[var(--secondary)] hover:border-[var(--secondary)] transition-all duration-300 shadow-sm">
              <i class="fa-brands fa-x-twitter text-sm"></i>
            </a>
            <a href="#" aria-label="Instagram"
              class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[var(--secondary)] hover:border-[var(--secondary)] transition-all duration-300 shadow-sm">
              <i class="fa-brands fa-instagram text-sm"></i>
            </a>
            <a href="#" aria-label="LinkedIn"
              class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[var(--secondary)] hover:border-[var(--secondary)] transition-all duration-300 shadow-sm">
              <i class="fa-brands fa-linkedin text-sm"></i>
            </a>
            <a href="#" aria-label="GitHub"
              class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-white hover:bg-[var(--secondary)] hover:border-[var(--secondary)] transition-all duration-300 shadow-sm">
              <i class="fa-brands fa-github text-sm"></i>
            </a>
          </div>
          <div class="text-xs text-slate-500 pt-2 font-medium">
            Find power. Go further.
          </div>
        </div>
      </div>

      <div
        class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <div>© 2026 VoltMap. All rights reserved.</div>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-slate-900 text-slate-500 transition">Privacy Policy</a>
          <a href="#" class="hover:text-slate-900 text-slate-500 transition">Terms of Service</a>
          <a href="#" class="hover:text-slate-900 text-slate-500 transition">Cookie Settings</a>
        </div>
      </div>
    </div>
  </footer>
  `;

  container.innerHTML = footerHtml;
}
