import { generateMockStations } from "./data.js";
import { renderNavbar } from "./navbar.js";
import { renderFooter } from "./footer.js";

// Use global jQuery loaded from CDN
const $ = window.jQuery || window.$;

// App State
let activePage = "explore";
let isTransitioning = false;

// Leaflet Bali Map instances & state
let baliMap = null;
let baliClusterGroup = null;
let baliMarkersMap = {};
let allStations = [];
let selectedStationId = null;
let currentSelectedMarker = null;

// User Location & Route State
let userLocation = null;
let userMarker = null;
let currentRouteLine = null;

$(document).ready(() => {
  // Render JS Components (Navbar & Footer)
  renderNavbar("#navbar-app", { activePage: "explore" });
  renderFooter("#footer-app", { activePage: "explore" });
  updateNavbarStyle();

  // Play initial page entrance curtain transition
  playCurtainEntrance();

  // Generate stations data
  allStations = generateMockStations();

  // Initialize navigation & plugins
  initNavigation();
  initNavbarEvents();
  initPlugins();

  // Initialize Bali Interactive Map
  initBaliMap();
});

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

// BFCache (Back/Forward Navigation) Event Listener
window.addEventListener("pageshow", (event) => {
  isTransitioning = false;

  const $curtain = $("#page-curtain-overlay");
  if ($curtain.length) {
    if (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !$curtain.hasClass("hidden")) {
      playCurtainEntrance();
    }
  }

  if (baliMap) baliMap.invalidateSize();
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

  $curtain.removeClass("hidden pointer-events-none");
  $layer1.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in");
  $layer2.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in-delayed");

  setTimeout(() => {
    window.location.href = destinationUrl;
  }, 450);
}

function initNavigation() {
  $("[data-nav-target]").on("click", function (e) {
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
  });

  // Intercept links between index.html, exploremap.html, and installcharge.html
  $(document).on("click", 'a[href="index.html"], a[href="exploremap.html"], a[href="installcharge.html"]', function (e) {
    const href = $(this).attr("href");
    const currentFile = window.location.pathname.split("/").pop();

    if (href !== currentFile && (href === "index.html" || href === "exploremap.html" || href === "installcharge.html")) {
      e.preventDefault();
      performPageTransition(href);
    }
  });
}

function updateNavbarStyle() {
  const $container = $("#navbar-container");
  const $logo = $("#nav-logo");

  $container.removeClass("bg-transparent border-transparent shadow-none").addClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
  $logo.removeClass("text-white").addClass("text-[var(--primary)]");
  $(".nav-link-btn").removeClass("text-white/90 hover:text-white").addClass("text-gray-700 hover:text-[var(--primary)]");
  $(".nav-icon-circle").removeClass("bg-white/15 text-white border-white/20 hover:bg-white/25").addClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");

  const $header = $("#header-navbar");
  $header.removeClass("opacity-0 pointer-events-none -translate-y-6").addClass("opacity-100 pointer-events-auto translate-y-0");
}

function initNavbarEvents() {
  // Mobile Drawer toggle
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
    if (page === "home" || page === "explore" || page === "install") {
      performPageTransition(page === "home" ? "index.html" : page === "explore" ? "exploremap.html" : "installcharge.html");
    }
  });
}

/* ==========================================
   LEAFLET BALI INTERACTIVE MAP & ROUTING
   ========================================== */
function initBaliMap() {
  const container = document.getElementById("bali-map-container");
  if (!container || typeof L === "undefined") return;

  if (baliMap) {
    baliMap.invalidateSize();
    return;
  }

  baliMap = L.map(container, {
    center: [-8.65, 115.2167],
    zoom: 11,
    minZoom: 8,
    maxZoom: 18,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    minZoom: 9,
    maxZoom: 18,
    noWrap: true,
    className: "vibrant-map-tiles",
  }).addTo(baliMap);

  if (typeof L.markerClusterGroup !== "undefined") {
    baliClusterGroup = L.markerClusterGroup({ chunkedLoading: true });
    baliMap.addLayer(baliClusterGroup);
  }

  baliMap.on("zoomend moveend", () => {
    if (selectedStationId && baliMarkersMap[selectedStationId]) {
      const selMarker = baliMarkersMap[selectedStationId];
      if (!baliMap.hasLayer(selMarker)) {
        selMarker.addTo(baliMap);
      }
      selMarker.setZIndexOffset(9000);
      if (selMarker.getPopup() && !selMarker.getPopup().isOpen()) {
        selMarker.openPopup();
      }
    }
  });

  initBaliCtrlScrollZoom(container, baliMap);
  renderBaliStations();
  initBaliSearchAndFilter();
}

function selectStation(stId, flyTo = false) {
  const station = allStations.find((s) => s.id === stId);
  if (!station) return;

  // Restore previous selected marker to cluster group if switching selected stations
  if (selectedStationId && selectedStationId !== stId && currentSelectedMarker) {
    if (baliMap && baliMap.hasLayer(currentSelectedMarker)) {
      baliMap.removeLayer(currentSelectedMarker);
    }
    if (baliClusterGroup && !baliClusterGroup.hasLayer(currentSelectedMarker)) {
      baliClusterGroup.addLayer(currentSelectedMarker);
    }
    currentSelectedMarker.setZIndexOffset(0);
  }

  selectedStationId = stId;
  const marker = baliMarkersMap[stId];

  if (marker && baliMap) {
    // Remove marker from cluster group and pin directly to map so it NEVER clusters on zoom out
    if (baliClusterGroup && baliClusterGroup.hasLayer(marker)) {
      baliClusterGroup.removeLayer(marker);
    }
    if (!baliMap.hasLayer(marker)) {
      marker.addTo(baliMap);
    }

    currentSelectedMarker = marker;
    marker.setZIndexOffset(9000); // Always keep icon on top of all clusters/markers

    const popup = marker.getPopup();
    if (popup) {
      popup.options.autoClose = false;
      popup.options.closeOnClick = false;
    }

    if (flyTo) {
      const targetZoom = 16;

      // Fly directly to station coordinates immediately regardless of distance
      baliMap.flyTo(station.coordinates, targetZoom, { duration: 0.8, animate: true });

      setTimeout(() => {
        if (baliMap) baliMap.invalidateSize();
        if (marker) marker.openPopup();
      }, 450);

      // Auto smooth-scroll to map on mobile screens
      if (window.innerWidth < 1024) {
        const mapElem = document.getElementById("bali-map-container");
        if (mapElem) {
          mapElem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } else {
      marker.openPopup();
    }

    // Highlight active card
    $(".station-card-item").removeClass("border-2 border-[var(--secondary)] ring-2 ring-[var(--secondary)] bg-emerald-50/30 bg-emerald-50/40");
    $(`[data-station-id="${stId}"]`).addClass("border-2 border-[var(--secondary)] shadow-md shadow-emerald-500/10 bg-emerald-50/40");
  }
}

function initBaliCtrlScrollZoom(container, map) {
  let $ctrlTip = $("#bali-map-ctrl-tip");
  if (!$ctrlTip.length) {
    $(container).append(`
      <div id="bali-map-ctrl-tip" class="absolute inset-0 z-[30] bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
        <div class="bg-slate-900/90 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2.5">
          <i class="fa-solid fa-keyboard text-[var(--secondary)] text-base"></i>
          <span>Gunakan <kbd class="px-2 py-0.5 bg-white/20 rounded border border-white/30 text-white font-mono text-xs">Ctrl</kbd> + scroll untuk memperbesar peta</span>
        </div>
      </div>
    `);
    $ctrlTip = $("#bali-map-ctrl-tip");
  }

  let ctrlTipTimeout = null;

  container.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      $ctrlTip.addClass("opacity-0");

      const delta = e.deltaY < 0 ? 1 : -1;
      const currentZoom = map.getZoom();
      const newZoom = Math.min(Math.max(currentZoom + delta, map.getMinZoom()), map.getMaxZoom());

      const mousePos = map.mouseEventToLatLng(e);
      map.setZoomAround(mousePos, newZoom, { animate: true });
    } else {
      $ctrlTip.removeClass("opacity-0");
      clearTimeout(ctrlTipTimeout);
      ctrlTipTimeout = setTimeout(() => {
        $ctrlTip.addClass("opacity-0");
      }, 1400);
    }
  }, { passive: false });
}

/* ==========================================
   GEOLOCATION & ROUTE NAVIGATION SYSTEM
   ========================================== */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isCoordinatesInBali(lat, lng) {
  return lat >= -9.1 && lat <= -7.9 && lng >= 114.2 && lng <= 115.9;
}

function getGoogleMapsUrl(destCoords, originCoords = null) {
  if (!destCoords || !destCoords[0]) return "#";
  const destLat = destCoords[0];
  const destLng = destCoords[1];
  if (originCoords && originCoords[0] && originCoords[1]) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originCoords[0]},${originCoords[1]}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
}

function detectUserLocation(autoFindNearest = true, callback = null) {
  const $btn = $("#btn-detect-location");
  if ($btn.length) {
    $btn.html(`<i class="fa-solid fa-spinner fa-spin text-sm text-[var(--secondary)]"></i><span>Detecting Precise Location...</span>`);
  }

  const handleFallback = (msg) => {
    console.warn("Geolocation fallback:", msg);
    if (!userLocation) {
      userLocation = [-8.6705, 115.2126];
    }
    renderUserMarker(userLocation);
    updateStationDistances(userLocation[0], userLocation[1]);

    if ($btn.length) {
      $btn.html(`<i class="fa-solid fa-location-crosshairs text-sm text-emerald-600"></i><span>Location Detected • Nearest Charger</span>`);
    }

    if (typeof callback === "function") {
      callback(userLocation);
    } else if (autoFindNearest) {
      findAndRouteToNearestStation();
    }
  };

  if (!navigator.geolocation) {
    handleFallback("browser not support geolocation");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        // Always take real browser location
        userLocation = [lat, lng];

        renderUserMarker(userLocation);
        updateStationDistances(userLocation[0], userLocation[1]);

        if (baliMap) {
          baliMap.flyTo(userLocation, 14, { duration: 0.8 });
        }

        if ($btn.length) {
          $btn.html(`<i class="fa-solid fa-location-crosshairs text-sm text-emerald-600"></i><span>Location Detected • Nearest Charger</span>`);
        }

        if (typeof callback === "function") {
          callback(userLocation);
        } else if (autoFindNearest) {
          findAndRouteToNearestStation();
        }
      } else {
        handleFallback("Location Invalid.");
      }
    },
    (error) => {
      handleFallback(error ? error.message : "Location Denied.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function renderUserMarker(coords) {
  if (!baliMap || !coords || !coords[0] || !coords[1]) return;

  const userIcon = L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <span class="animate-ping" style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: #38bdf8; opacity: 0.75;"></span>
        <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background-color: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; z-index: 9999;">
          <i class="fa-solid fa-user"></i>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  if (userMarker) {
    userMarker.setLatLng(coords);
    userMarker.setIcon(userIcon);
  } else {
    userMarker = L.marker(coords, { icon: userIcon, zIndexOffset: 3000 })
      .bindPopup(`<div class="p-1 text-xs font-extrabold text-slate-800"><i class="fa-solid fa-location-dot text-sky-500 mr-1"></i> Lokasi Anda Saat Ini</div>`)
      .addTo(baliMap);
  }

  if (baliMap) {
    setTimeout(() => {
      baliMap.invalidateSize();
    }, 150);
  }
}

function updateStationDistances(userLat, userLng) {
  allStations.forEach((st) => {
    // Estimated driving road distance (~1.25x straight line)
    const straightDist = calculateDistanceKm(userLat, userLng, st.coordinates[0], st.coordinates[1]);
    const roadDist = straightDist * 1.25;
    st.numericDistance = roadDist;
    st.distance = roadDist < 1 ? `${Math.round(roadDist * 1000)} m` : `${roadDist.toFixed(1)} km`;
  });

  // Sort stations by distance ascending (closest first)
  allStations.sort((a, b) => (a.numericDistance || 0) - (b.numericDistance || 0));

  renderBaliStations();
}

function getFilteredStations() {
  const filterType = $("[data-bali-filter].bg-\\[var\\(--secondary\\)\\]").attr("data-bali-filter") || "All";
  const speedFilter = $("#filter-charging-speed").val() || "All";
  const connectorFilter = $("#filter-connector-type").val() || "All";

  return allStations.filter((st) => {
    const matchesFilter = filterType === "All" || st.type === filterType;

    let matchesSpeed = true;
    if (speedFilter === "Standard") {
      matchesSpeed = st.power.includes("7 kW") || st.power.includes("22 kW");
    } else if (speedFilter === "Fast") {
      matchesSpeed = st.power.includes("50 kW");
    } else if (speedFilter === "Ultra-Fast") {
      matchesSpeed = st.power.includes("150 kW") || st.power.includes("350 kW");
    }

    const matchesConnector = connectorFilter === "All" || st.connector === connectorFilter;

    return matchesFilter && matchesSpeed && matchesConnector;
  });
}

function findAndRouteToNearestStation() {
  const filtered = getFilteredStations();
  if (!filtered.length) {
    const $btn = $("#btn-detect-location");
    if ($btn.length) {
      $btn.html(`<i class="fa-solid fa-triangle-exclamation text-sm text-amber-500"></i><span>Tidak Ada Charger Sesuai Filter</span>`);
      setTimeout(() => {
        $btn.html(`<i class="fa-solid fa-location-crosshairs text-sm text-emerald-600"></i><span>Gunakan Lokasi Saya • Cari Charger Terdekat</span>`);
      }, 3000);
    }
    return;
  }
  const nearest = filtered[0];
  drawRouteToStation(nearest);
}

function drawRouteToStation(station) {
  if (!baliMap || !station) return;
  const origin = userLocation || [-8.6705, 115.2126];
  const dest = station.coordinates;

  if (currentRouteLine) {
    baliMap.removeLayer(currentRouteLine);
    currentRouteLine = null;
  }

  const dist = calculateDistanceKm(origin[0], origin[1], dest[0], dest[1]) * 1.25;
  const estMinutes = Math.max(2, Math.round((dist / 30) * 60));

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;

  fetch(osrmUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.routes && data.routes[0]) {
        const routeGeo = data.routes[0].geometry;
        const realDistKm = (data.routes[0].distance / 1000).toFixed(1);
        const realDurationMins = Math.round(data.routes[0].duration / 60);

        currentRouteLine = L.geoJSON(routeGeo, {
          style: {
            color: "#0EA5E9",
            weight: 6,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          },
        }).addTo(baliMap);

        showRouteCard(station, `${realDistKm} km`, `${realDurationMins} mnt`, origin, dest);
      } else {
        fallbackPolyline(origin, dest, station, dist, estMinutes);
      }
    })
    .catch(() => {
      fallbackPolyline(origin, dest, station, dist, estMinutes);
    });

  const bounds = L.latLngBounds([origin, dest]);
  baliMap.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

  selectStation(station.id, false);
}

function fallbackPolyline(origin, dest, station, dist, estMinutes) {
  currentRouteLine = L.polyline([origin, dest], {
    color: "#0EA5E9",
    weight: 5,
    opacity: 0.85,
    dashArray: "10, 10",
  }).addTo(baliMap);

  const distFormatted = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  showRouteCard(station, distFormatted, `${estMinutes} mnt`, origin, dest);
}

function showRouteCard(station, distStr, durationStr, origin, dest) {
  station.distance = distStr;
  $("#route-target-name").text(station.name);
  $("#route-distance").text(distStr);
  $("#route-duration").text(durationStr);

  // Synchronize distance in station sidebar list item and popup
  $(`[data-station-id="${station.id}"] .station-dist-text`).text(distStr);
  $(`.popup-station-dist-${station.id}`).text(distStr);

  const gmapsUrl = getGoogleMapsUrl(dest, userLocation || origin);
  $("#route-google-maps-btn").attr("href", gmapsUrl);

  $("#route-info-card").removeClass("hidden");
}

function renderBaliStations() {
  if (!baliMap) return;

  const filtered = getFilteredStations();

  // Render Sidebar List
  const listHtml = filtered.length
    ? filtered
      .map(
        (st, idx) => `
      <div
        data-station-id="${st.id}"
        class="p-4 rounded-2xl bg-white border transition-all cursor-pointer station-card-item shadow-sm hover:shadow-md ${selectedStationId === st.id
            ? "border-2 border-[var(--secondary)] shadow-md shadow-emerald-500/10 bg-emerald-50/40"
            : "border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
          }"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                ${st.name}
                <span
                  class="w-2 h-2 rounded-full ${st.status === "Available"
            ? "bg-emerald-500 shadow-sm shadow-emerald-500"
            : st.status === "Busy"
              ? "bg-amber-500"
              : st.status === "Maintenance"
                ? "bg-blue-500"
                : "bg-slate-400"
          }"
                  title="${st.status}"
                ></span>
              </h3>
              ${userLocation && idx === 0
            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs">Nearest</span>`
            : ""
          }
            </div>
            <p class="text-xs text-slate-500 mt-1">
              ${st.location} • <span class="text-emerald-600 font-bold station-dist-text">${st.distance}</span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <div class="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <i class="fa-solid fa-star text-[10px]"></i>
              <span>${st.rating}</span>
            </div>
            <span class="text-[10px] font-bold text-slate-500">${st.price}</span>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs font-medium">
          <span class="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200/60">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            ${st.available}
          </span>
          <div class="flex items-center gap-1.5">
            <button data-route-id="${st.id}" class="btn-route-action px-2 py-1 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] text-white text-[11px] font-bold shadow transition flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-diamond-turn-right text-[10px]"></i>
              <span>Route</span>
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("")
    : `
      <div class="text-center py-12 text-slate-500">
        <i class="fa-solid fa-location-dot text-3xl mb-2 opacity-40 text-slate-400"></i>
        <p class="text-sm font-semibold">Stasiun tidak ditemukan.</p>
      </div>
    `;

  $("#bali-stations-list").html(listHtml);
  $("#bali-filtered-count").text(`${filtered.length} result`);
  $("#bali-visible-count").text(`Displaying ${filtered.length} stations`);

  // Render Map Markers
  baliMarkersMap = {};
  if (baliClusterGroup) {
    baliClusterGroup.clearLayers();

    filtered.forEach((st) => {
      const icon = L.divIcon({
        className: "bg-transparent",
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-white border-2 ${st.type === "Public Station" ? "border-[var(--secondary)]" : "border-amber-500"
          } shadow-xl flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-110">
              <img src="../asset/img/logo.png" alt="Voltmap Station" class="w-full h-full object-contain" />
            </div>
            <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 mx-auto -mt-1 rounded-xs border-r border-b border-white/50"></div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 40],
        popupAnchor: [0, -40],
      });

      const popupGmapsUrl = getGoogleMapsUrl(st.coordinates, userLocation);
      const popupHtml = `
        <div class="p-1 min-w-[200px]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="font-extrabold text-sm text-slate-900">${st.name}</h4>
            <span class="w-2 h-2 rounded-full shrink-0 ${st.status === "Available" ? "bg-emerald-500" : st.status === "Busy" ? "bg-amber-500" : "bg-gray-400"
        }" title="${st.status}"></span>
          </div>
          <p class="text-xs text-gray-600 mb-2">${st.location} • <span class="popup-station-dist-${st.id} font-bold text-emerald-700">${st.distance}</span></p>
          <div class="flex items-center gap-1.5 mb-3 flex-wrap">
            <span class="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">${st.connector}</span>
            <span class="text-xs font-bold text-[var(--secondary)] bg-emerald-50 px-2 py-0.5 rounded">${st.power}</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">${st.available}</span>
          </div>
          <div class="w-full flex items-center justify-center">
            <button data-route-id="${st.id}" class="btn-route-action py-1.5 px-2 w-full rounded-xl bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-route text-[10px]"></i>
              <span>Route Map</span>
            </button>
          </div>
        </div>
      `;

      const marker = L.marker(st.coordinates, { icon }).bindPopup(popupHtml);
      baliMarkersMap[st.id] = marker;

      marker.on("click", () => {
        selectStation(st.id, false);
      });

      if (selectedStationId && st.id === selectedStationId) {
        currentSelectedMarker = marker;
        marker.addTo(baliMap);
        marker.setZIndexOffset(9000);
        const popup = marker.getPopup();
        if (popup) {
          popup.options.autoClose = false;
          popup.options.closeOnClick = false;
        }
        setTimeout(() => {
          if (marker.getPopup() && !marker.getPopup().isOpen()) marker.openPopup();
        }, 100);
      } else {
        baliClusterGroup.addLayer(marker);
      }
    });
  }
}

function initBaliSearchAndFilter() {
  let currentFilter = "All";
  let currentSpeed = "All";
  let currentConnector = "All";

  $(document).on("click", "#btn-detect-location", function () {
    detectUserLocation(true);
  });

  $(document).on("click", "#btn-close-route", function () {
    if (currentRouteLine && baliMap) {
      baliMap.removeLayer(currentRouteLine);
      currentRouteLine = null;
    }
    $("#route-info-card").addClass("hidden");
  });

  $(document).on("click", ".btn-route-action, [data-route-id]", function (e) {
    e.stopPropagation();
    const id = parseInt($(this).attr("data-route-id"), 10);
    const station = allStations.find((s) => s.id === id);
    if (station) {
      if (!userLocation) {
        detectUserLocation(false, () => {
          drawRouteToStation(station);
        });
      } else {
        drawRouteToStation(station);
      }
    }
  });

  $(document).on("click", "[data-bali-filter]", function () {
    currentFilter = $(this).attr("data-bali-filter");
    $("[data-bali-filter]").each(function () {
      if ($(this).attr("data-bali-filter") === currentFilter) {
        $(this).addClass("bg-[var(--secondary)] text-white shadow-md shadow-emerald-500/20").removeClass("bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60 bg-slate-900 text-slate-400 hover:text-white");
      } else {
        $(this).removeClass("bg-[var(--secondary)] text-white shadow-md shadow-emerald-500/20").addClass("bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60");
      }
    });
    renderBaliStations();
  });

  $(document).on("change", "#filter-charging-speed", function () {
    renderBaliStations();
  });

  $(document).on("change", "#filter-connector-type", function () {
    renderBaliStations();
  });

  $(document).on("click", "[data-station-id]", function (e) {
    if ($(e.target).closest(".btn-route-action, [data-route-id]").length) return;

    const id = parseInt($(this).attr("data-station-id"), 10);
    selectStation(id, true);
  });
}

/* ==========================================
   THIRD PARTY PLUGINS
   ========================================== */
function initPlugins() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }

  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {});
  }
}
