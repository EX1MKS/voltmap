/**
 * VOLTMAP Sign Up Component
 * Reusable JavaScript Component for VOLTMAP Sign Up Banner
 */

export function renderSignup(targetElementOrSelector = "#signup-app", options = {}) {
  const {
    logoSrc = "../asset/img/logo.png"
  } = options;

  let container = typeof targetElementOrSelector === "string"
    ? document.querySelector(targetElementOrSelector)
    : targetElementOrSelector;

  if (!container) {
    container = document.getElementById("signup-app") || document.getElementById("signup-section");
  }

  if (!container) return;

  // If user is logged in, hide and remove the sign-up section across all pages
  const isLoggedIn = sessionStorage.getItem("voltmap_logged_in") === "true";
  if (isLoggedIn) {
    container.innerHTML = "";
    container.classList.add("hidden");
    const signupSection = document.getElementById("signup-section");
    if (signupSection && signupSection !== container) {
      signupSection.remove();
    }
    return;
  }

  container.classList.remove("hidden");

  const signupHtml = `
  <!-- SECTION: SIGN UP VOLTMAP COMPONENT -->
  <section id="signup-section" class="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-12 bg-white relative overflow-hidden"
    data-aos="fade-up">
    <div class="max-w-7xl mx-auto">
      <div
        class="relative rounded-[32px] sm:rounded-[40px] border border-secondary/30 bg-[#ffffff] p-8 sm:p-12 md:p-14 overflow-hidden">
        <!-- Decorative Background Glow -->
        <div
          class="absolute -top-24 -left-24 w-96 h-96 bg-[var(--secondary)]/15 rounded-full blur-3xl pointer-events-none">
        </div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none">
        </div>

        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <!-- Left Column: Voltmap Logo -->
          <div class="flex items-center justify-center shrink-0">
            <div class="relative group">
              <div class="absolute transition duration-500">
              </div>
              <div
                class="relative w-full h-full flex items-center justify-center transition-transform duration-500">
                <img src="${logoSrc}" alt="Voltmap Logo" class="w-full h-full object-contain filter" />
              </div>
            </div>
          </div>

          <!-- Middle Column: Headline -->
          <div class="flex-1 text-center lg:text-left">
            <h2
              class="text-2xl sm:text-3xl lg:text-4xl 3xl:text-[42px] leading-tight text-[#0F172A] tracking-tight">
              <strong class="font-black text-[#0F172A]">Stay charged</strong> <br>
              <span class="font-normal text-slate-700 block sm:inline"> Stay connected</span>
            </h2>
          </div>

          <!-- Right Column: Description & Action Button -->
          <div
            class="w-full lg:w-[380px] flex flex-col items-center lg:items-start text-center lg:text-left gap-5 shrink-0">
            <p class="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Get the latest updates and news from VoltMap, from new charging locations to features that make every
              EV journey easier, and more.
            </p>

            <!-- Interactive Button -->
            <div id="signup-voltmap" class="w-full flex flex-col sm:flex-row items-center gap-3">
              <button id="signup-submit-btn"
                class="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#ffffff] text-secondary text-xs sm:text-sm hover:text-white font-bold hover:bg-[var(--secondary)] hover:border-[var(--secondary)] transition-all duration-300 shadow-md flex items-center justify-center gap-2 shrink-0 group cursor-pointer whitespace-nowrap">
                <span>Sign me up</span>
                <i class="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>

            <div id="signup-success-msg" class="hidden text-xs font-bold items-center gap-1.5 animate-fade-in text-secondary">
              <i class="fa-solid fa-circle-check text-sm"></i>
              <span>Thank you for connecting with Voltmap!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `;

  container.innerHTML = signupHtml;
  initSignUpEvents(container);
}

function initSignUpEvents(container) {
  const btn = container.querySelector("#signup-submit-btn");
  const msg = container.querySelector("#signup-success-msg");

  if (btn && msg) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      msg.classList.remove("hidden");
      msg.classList.add("flex");
      setTimeout(() => {
        msg.classList.add("hidden");
        msg.classList.remove("flex");
      }, 5000);
    });
  }
}
