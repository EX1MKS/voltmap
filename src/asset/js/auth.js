/**
 * VOLTMAP Auth JavaScript Module
 * Handles Login & Register interactive features & Curtain Page Transitions
 */

let isTransitioning = false;

document.addEventListener("DOMContentLoaded", () => {
  playCurtainEntrance();
  initPageTransitions();
  initTogglePassword();
  initPasswordStrengthMeter();
  initConfirmPasswordCheck();
  initFormSubmissions();
});

// BFCache (Back/Forward Navigation) Handling
window.addEventListener("pageshow", (event) => {
  isTransitioning = false;
  const curtain = document.getElementById("page-curtain-overlay");
  if (curtain && (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !curtain.classList.contains("hidden"))) {
    playCurtainEntrance();
  }
});

window.addEventListener("pagehide", () => {
  isTransitioning = false;
});

/**
 * Play Curtain Entrance Animation on Page Load
 */
function playCurtainEntrance() {
  const isTransitioningFromPrev = sessionStorage.getItem("voltmap_transition") === "true";
  sessionStorage.removeItem("voltmap_transition");

  const curtain = document.getElementById("page-curtain-overlay");
  const layer1 = document.getElementById("curtain-layer-1");
  const layer2 = document.getElementById("curtain-layer-2");

  if (!curtain) return;

  if (isTransitioningFromPrev || !curtain.classList.contains("hidden")) {
    curtain.classList.remove("hidden", "pointer-events-none");
    if (layer1) {
      layer1.classList.remove("animate-wipe-in", "animate-wipe-in-delayed");
      layer2?.classList.remove("animate-wipe-in", "animate-wipe-in-delayed");
      layer1.classList.add("animate-wipe-out");
      layer2?.classList.add("animate-wipe-out-delayed");
    }

    setTimeout(() => {
      curtain.classList.add("hidden", "pointer-events-none");
      layer1?.classList.remove("animate-wipe-in", "animate-wipe-in-delayed", "animate-wipe-out", "animate-wipe-out-delayed");
      layer2?.classList.remove("animate-wipe-in", "animate-wipe-in-delayed", "animate-wipe-out", "animate-wipe-out-delayed");
    }, 600);
  } else {
    curtain.classList.add("hidden", "pointer-events-none");
  }
}

/**
 * Perform Curtain Exit Animation to Destination URL
 */
function performPageTransition(destinationUrl) {
  if (isTransitioning) return;
  isTransitioning = true;

  sessionStorage.setItem("voltmap_transition", "true");

  const curtain = document.getElementById("page-curtain-overlay");
  const layer1 = document.getElementById("curtain-layer-1");
  const layer2 = document.getElementById("curtain-layer-2");

  if (curtain && layer1 && layer2) {
    curtain.classList.remove("hidden", "pointer-events-none");
    layer1.classList.remove("animate-wipe-out", "animate-wipe-out-delayed");
    layer2.classList.remove("animate-wipe-out", "animate-wipe-out-delayed");
    layer1.classList.add("animate-wipe-in");
    layer2.classList.add("animate-wipe-in-delayed");

    setTimeout(() => {
      window.location.href = destinationUrl;
    }, 450);
  } else {
    window.location.href = destinationUrl;
  }
}

/**
 * Intercept Internal Navigation Links for Smooth Curtain Transition
 */
function initPageTransitions() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const targetHref = link.getAttribute("href");

    if (!targetHref || targetHref.startsWith("#") || targetHref.startsWith("http") || targetHref.startsWith("javascript")) {
      return;
    }

    link.addEventListener("click", (e) => {
      e.preventDefault();
      performPageTransition(targetHref);
    });
  });
}

/**
 * Toggle Password Visibility (Eye Icon)
 */
function initTogglePassword() {
  const toggleButtons = document.querySelectorAll("[data-toggle-password]");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-toggle-password");
      const input = document.getElementById(targetId);
      const icon = button.querySelector("i");

      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
      } else {
        input.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });
}

/**
 * Password Strength Meter for Register Page
 */
function initPasswordStrengthMeter() {
  const passwordInput = document.getElementById("register-password");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");

  if (!passwordInput || !strengthBar || !strengthText) return;

  passwordInput.addEventListener("input", (e) => {
    const val = e.target.value;
    let score = 0;

    if (!val) {
      strengthBar.style.width = "0%";
      strengthBar.className = "h-full rounded-full transition-all duration-300 bg-slate-200";
      strengthText.textContent = "";
      return;
    }

    if (val.length >= 6) score += 1;
    if (val.length >= 10) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    if (score <= 2) {
      strengthBar.style.width = "33%";
      strengthBar.className = "h-full rounded-full transition-all duration-300 bg-rose-500";
      strengthText.textContent = "Weak";
      strengthText.className = "text-xs font-semibold text-rose-500";
    } else if (score <= 4) {
      strengthBar.style.width = "66%";
      strengthBar.className = "h-full rounded-full transition-all duration-300 bg-amber-500";
      strengthText.textContent = "Medium";
      strengthText.className = "text-xs font-semibold text-amber-500";
    } else {
      strengthBar.style.width = "100%";
      strengthBar.className = "h-full rounded-full transition-all duration-300 bg-emerald-500";
      strengthText.textContent = "Strong";
      strengthText.className = "text-xs font-semibold text-emerald-500";
    }
  });
}

/**
 * Confirm Password Realtime Match Check
 */
function initConfirmPasswordCheck() {
  const passwordInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("register-confirm-password");
  const matchMsg = document.getElementById("password-match-msg");

  if (!passwordInput || !confirmInput || !matchMsg) return;

  const validateMatch = () => {
    if (!confirmInput.value) {
      matchMsg.classList.add("hidden");
      return;
    }

    matchMsg.classList.remove("hidden");
    if (passwordInput.value === confirmInput.value) {
      matchMsg.textContent = "Passwords match";
      matchMsg.className = "text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1";
    } else {
      matchMsg.textContent = "Passwords do not match";
      matchMsg.className = "text-xs font-semibold text-rose-500 mt-1 flex items-center gap-1";
    }
  };

  passwordInput.addEventListener("input", validateMatch);
  confirmInput.addEventListener("input", validateMatch);
}

/**
 * Form Submission Toast Feedback & Curtain Transition
 */
function initFormSubmissions() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Signed in successfully! Redirecting...", "success");
      setTimeout(() => {
        performPageTransition("index.html");
      }, 1200);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pwd = document.getElementById("register-password")?.value;
      const confirmPwd = document.getElementById("register-confirm-password")?.value;

      if (pwd && confirmPwd && pwd !== confirmPwd) {
        showToast("Passwords do not match. Please check again.", "error");
        return;
      }

      showToast("Registration successful! Redirecting to sign in...", "success");
      setTimeout(() => {
        performPageTransition("login.html");
      }, 1200);
    });
  }
}

function showToast(message, type = "success") {
  const authToast = document.getElementById("auth-toast");
  if (!authToast) return;

  const toastMsg = authToast.querySelector(".toast-message");
  const toastIcon = authToast.querySelector(".toast-icon");

  if (toastMsg) toastMsg.textContent = message;
  if (toastIcon) {
    if (type === "success") {
      toastIcon.className = "toast-icon fa-solid fa-circle-check text-emerald-500 text-lg";
    } else {
      toastIcon.className = "toast-icon fa-solid fa-circle-exclamation text-rose-500 text-lg";
    }
  }

  authToast.classList.remove("translate-y-10", "opacity-0", "pointer-events-none");
  authToast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    authToast.classList.add("translate-y-10", "opacity-0", "pointer-events-none");
    authToast.classList.remove("translate-y-0", "opacity-100");
  }, 4000);
}
