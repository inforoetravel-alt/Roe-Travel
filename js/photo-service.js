// photo-service.js
// Shared helper for pulling photos to replace the CSS gradient placeholders.
// Two independent sources, tried in this order per query:
//
// 1) Travelpayouts / Hotellook — REAL hotel data (real hotel, real photo)
//    matched by city name, via your approved Travelpayouts affiliate
//    account. Requires window.ROE_CONFIG.TRAVELPAYOUTS_TOKEN.
//
// 2) Unsplash — free stock photo matched by city/theme keywords (NOT a
//    real hotel — see README.md). Requires
//    window.ROE_CONFIG.UNSPLASH_ACCESS_KEY.
//
// With neither key set, every function below resolves to null and callers
// fall back to the existing CSS gradient placeholder — nothing on the site
// breaks if this file, or either key, is missing.
//
// Caches results in sessionStorage so a single visit never re-requests the
// same query twice, to stay well within each service's free rate limits.

const ROE_PHOTO_CACHE_PREFIX = "roe-photo:";
const ROE_HOTELLOOK_CACHE_PREFIX = "roe-hotellook:";

// ---------- Travelpayouts / Hotellook (real hotels) ----------
// cityQuery should be a plain city name, e.g. "Accra" — NOT the fictional
// hotel name from our placeholder JSON data, since Hotellook returns
// whatever real hotel it has on file for that city (not necessarily the
// same-named property in our own data).
async function roeGetHotellookPhoto(cityQuery, hotelOffset, photoIndex) {
  hotelOffset = hotelOffset || 0;
  photoIndex = photoIndex || 1;
  const token = window.ROE_CONFIG && window.ROE_CONFIG.TRAVELPAYOUTS_TOKEN;
  if (!token) return null;

  const cacheKey = ROE_HOTELLOOK_CACHE_PREFIX + cityQuery + ":" + hotelOffset + ":" + photoIndex;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) { /* sessionStorage unavailable — skip caching */ }

  try {
    // Request several real hotels for this city so different cards/fictional
    // entries in the same city can map to different real properties,
    // instead of every card in a city collapsing onto the same one hotel.
    const url = `https://engine.hotellook.com/api/v2/lookup.json?query=${encodeURIComponent(cityQuery)}&lang=en&lookFor=hotel&limit=6&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    // Defensive parsing — try the shapes Hotellook's lookup.json is known
    // to return; bail out to null (never throw) if none match.
    let hotels = null;
    if (data && data.results && Array.isArray(data.results.hotels) && data.results.hotels.length) {
      hotels = data.results.hotels;
    } else if (Array.isArray(data) && data.length) {
      hotels = data;
    }
    if (!hotels || !hotels.length) return null;

    const hotel = hotels[hotelOffset % hotels.length];
    const hotelId = hotel.id || hotel.hotelId;
    const hotelName = hotel.label || hotel.hotelName || hotel.name;
    if (!hotelId) return null;

    const result = {
      url: `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${photoIndex}/800/520.auto`,
      hotelName: hotelName || null,
      source: "hotellook"
    };

    try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch (err) { /* ignore */ }
    return result;
  } catch (err) {
    return null;
  }
}

// ---------- Unsplash (stock photo fallback) ----------
async function roeGetUnsplashPhoto(query) {
  const key = window.ROE_CONFIG && window.ROE_CONFIG.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const cacheKey = ROE_PHOTO_CACHE_PREFIX + query;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) { /* ignore */ }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data.results && data.results[0];
    if (!photo) return null;

    const result = {
      url: photo.urls.regular,
      photographer: photo.user.name,
      photographerLink: `${photo.user.links.html}?utm_source=roe_travel&utm_medium=referral`,
      unsplashLink: `https://unsplash.com/?utm_source=roe_travel&utm_medium=referral`,
      source: "unsplash"
    };

    try { sessionStorage.setItem(cacheKey, JSON.stringify(result)); } catch (err) { /* ignore */ }
    return result;
  } catch (err) {
    return null;
  }
}

// Tries Hotellook first (real hotel, matched by city), then falls back to
// Unsplash (stock photo, matched by the full query text).
async function roeGetPhoto(query, cityForHotellook, hotelOffset, photoIndex) {
  if (cityForHotellook) {
    const real = await roeGetHotellookPhoto(cityForHotellook, hotelOffset, photoIndex);
    if (real) return real;
  }
  return roeGetUnsplashPhoto(query);
}

// Finds every element with data-photo-query (and optional data-photo-city)
// in the given root, fetches a matching photo for each (deduping identical
// queries into one request), and applies it as a background image with a
// small attribution caption when the source requires one (Unsplash does;
// Hotellook does not).
async function roeHydratePhotos(root = document) {
  const hasAnyKey = window.ROE_CONFIG && (window.ROE_CONFIG.UNSPLASH_ACCESS_KEY || window.ROE_CONFIG.TRAVELPAYOUTS_TOKEN);
  if (!hasAnyKey) return; // no key configured — leave placeholders as-is

  const els = Array.from(root.querySelectorAll("[data-photo-query]"));
  const uniqueKeys = [...new Set(els.map(el => `${el.dataset.photoQuery}::${el.dataset.photoCity || ""}::${el.dataset.photoOffset || "0"}::${el.dataset.photoIndex || "1"}`))];

  const results = {};
  await Promise.all(uniqueKeys.map(async k => {
    const [query, city, offset, idx] = k.split("::");
    results[k] = await roeGetPhoto(query, city || null, parseInt(offset, 10) || 0, parseInt(idx, 10) || 1);
  }));

  els.forEach(el => {
    const k = `${el.dataset.photoQuery}::${el.dataset.photoCity || ""}::${el.dataset.photoOffset || "0"}::${el.dataset.photoIndex || "1"}`;
    const photo = results[k];
    if (!photo) return; // fetch failed or no result — gradient placeholder stays
    el.style.backgroundImage = `url(${photo.url})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.classList.add("has-photo");

    if (photo.source === "unsplash" && !el.querySelector(".photo-credit")) {
      const credit = document.createElement("a");
      credit.className = "photo-credit";
      credit.href = photo.photographerLink;
      credit.target = "_blank";
      credit.rel = "noopener";
      credit.textContent = `Photo: ${photo.photographer} / Unsplash`;
      el.style.position = el.style.position || "relative";
      el.appendChild(credit);
    }
  });
}
