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
    class="w-full bg-[var(--primary)] text-white pt-16 pb-12 px-4 sm:px-6 lg:px-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto space-y-12">
      <div
        class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 border-b border-gray-800">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center text-white font-bold">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <span class="text-2xl font-black tracking-[4px]">${brandName}</span>
          </div>
          <p class="text-gray-400 text-sm max-w-md">
            Accelerating the transition to sustainable mobility through high-speed, reliable EV charging infrastructure
            around the world.
          </p>
        </div>

      
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-sm text-gray-400">
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">For Drivers</h4>
          <ul class="space-y-2">
            <li><a href="${isHome ? 'exploremap.html' : '#'}" class="hover:text-white transition">Station Finder</a></li>
            <li><a href="#" class="hover:text-white transition">Charging Rates</a></li>
            <li><a href="#" class="hover:text-white transition">Nearby Chargers</a></li>
            <li><a href="#" class="hover:text-white transition">EV Compatibility</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">For Business</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition">Install a Charger</a></li>
            <li><a href="#" class="hover:text-white transition">Share Your Charger</a></li>
            <li><a href="#" class="hover:text-white transition">Fleet Charging</a></li>
            <li><a href="#" class="hover:text-white transition">Partner With Us</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
          <ul class="space-y-2">
            <li><a href="${isHome ? '#stats-section' : 'index.html#stats-section'}" class="hover:text-white transition">About VoltMap</a></li>
            <li><a href="#" class="hover:text-white transition">Stories</a></li>
            <li><a href="#" class="hover:text-white transition">Our Mission</a></li>
            <li><a href="#" class="hover:text-white transition">Careers</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Support</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition">Help Center</a></li>
            <li><a href="#" class="hover:text-white transition">24/7 Hotline</a></li>
            <li><a href="#" class="hover:text-white transition">Network Status</a></li>
            <li><a href="#" class="hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>

        <div class="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
          <h4 class="text-xs font-bold text-white uppercase tracking-wider">Follow Us</h4>
          <div class="flex items-center gap-3">
            <a href="#" aria-label="Twitter"
              class="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <i class="fa-brands fa-x-twitter text-sm"></i>
            </a>
            <a href="#" aria-label="Instagram"
              class="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <i class="fa-brands fa-instagram text-sm"></i>
            </a>
            <a href="#" aria-label="LinkedIn"
              class="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <i class="fa-brands fa-linkedin text-sm"></i>
            </a>
            <a href="#" aria-label="GitHub"
              class="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <i class="fa-brands fa-github text-sm"></i>
            </a>
          </div>
          <div class="text-xs text-gray-500 pt-2">
            Find power. Go further.
          </div>
        </div>
      </div>

      <div
        class="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>© 2026 VoltMap. All rights reserved.</div>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-gray-400 transition">Privacy Policy</a>
          <a href="#" class="hover:text-gray-400 transition">Terms of Service</a>
          <a href="#" class="hover:text-gray-400 transition">Cookie Settings</a>
        </div>
      </div>
    </div>
  </footer>
  `;

  container.innerHTML = footerHtml;
}
