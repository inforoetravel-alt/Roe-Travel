// country-page.js
// Reusable renderer for /countries/<slug>.html pages.
// Reads window.ROE_COUNTRY_SLUG, fetches ../data/countries/<slug>.json,
// and renders hero, cities, hotel categories, attractions, tips, and FAQ.
// Adding a new country = adding a new JSON file. No template changes needed.

const CATEGORY_LABELS = {
  luxury: "Luxury Hotels",
  standard: "Standard Hotels",
  budget: "Budget Hotels",
  business: "Business Hotels",
  family: "Family Hotels",
  airportHotels: "Airport Hotels",
  beachResorts: "Beach Resorts",
  mountainResorts: "Mountain Resorts",
  romantic: "Romantic Hotels",
  pool: "Hotels with Pool",
  breakfast: "Hotels with Breakfast",
  parking: "Hotels with Parking",
  petFriendly: "Pet Friendly Hotels"
};

async function loadCountryPage() {
  const slug = window.ROE_COUNTRY_SLUG;
  if (!slug) return;

  let data;
  try {
    const res = await fetch(`../data/countries/${slug}.json`);
    if (!res.ok) throw new Error("Country data not found");
    data = await res.json();
  } catch (err) {
    const heroEl = document.getElementById("country-hero");
    if (heroEl) {
      heroEl.querySelector("h1").textContent = "Country guide not found";
      heroEl.querySelector("p").textContent = "This country guide isn't published yet.";
    }
    return;
  }

  document.title = `Hotels in ${data.country} — Roe Travel`;

  // Hero + intro
  const heroEl = document.getElementById("country-hero");
  if (heroEl) {
    heroEl.querySelector("h1").textContent = `Hotels in ${data.country}`;
    heroEl.querySelector("p").textContent = data.intro;
  }

  // Featured cities
  const citiesEl = document.getElementById("featured-cities");
  if (citiesEl && data.featuredCities) {
    citiesEl.innerHTML = data.featuredCities
      .map(c => `<span class="chip" style="cursor:default;">${c}</span>`)
      .join("");
  }

  // Category tabs + panels
  const tabsEl = document.getElementById("category-tabs");
  const panelsEl = document.getElementById("category-panels");
  const categoryKeys = Object.keys(data.categories || {});

  if (tabsEl && panelsEl && categoryKeys.length) {
    tabsEl.innerHTML = categoryKeys
      .map((key, i) => `<button class="chip${i === 0 ? " active" : ""}" data-cat="${key}">${CATEGORY_LABELS[key] || key}</button>`)
      .join("");

    panelsEl.innerHTML = categoryKeys
      .map((key, i) => renderCategoryPanel(key, data.categories[key], i === 0, slug))
      .join("");

    if (typeof roeHydratePhotos === "function") roeHydratePhotos(panelsEl);

    tabsEl.querySelectorAll(".chip").forEach(btn => {
      btn.addEventListener("click", () => {
        tabsEl.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        panelsEl.querySelectorAll(".category-panel").forEach(p => {
          p.style.display = p.dataset.cat === btn.dataset.cat ? "" : "none";
        });
      });
    });
  }

  // Top attractions
  const attractionsEl = document.getElementById("top-attractions");
  if (attractionsEl && data.topAttractions) {
    attractionsEl.innerHTML = data.topAttractions.map(a => `<li>${a}</li>`).join("");
  }

  // Travel tips
  const tipsEl = document.getElementById("travel-tips");
  if (tipsEl && data.travelTips) {
    tipsEl.innerHTML = data.travelTips.map(t => `<li>${t}</li>`).join("");
  }

  // FAQ + schema
  const faqEl = document.getElementById("country-faq");
  if (faqEl && data.faq) {
    faqEl.innerHTML = data.faq
      .map(f => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`)
      .join("");

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data.faq.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
  }
}

function renderCategoryPanel(key, hotels, visible, slug) {
  const cards = (hotels || [])
    .map((h, i) => `
      <a class="dest-card" href="hotel.html?country=${slug}&category=${key}&index=${i}" style="text-decoration:none; color:inherit;">
        <div class="dest-img" data-photo-query="${h.city} hotel" data-photo-city="${h.city}"><span class="badge">${"★".repeat(h.stars)}${"☆".repeat(5 - h.stars)}</span></div>
        <div class="dest-body">
          <h4>${h.name}</h4>
          <p class="from">${h.area}, ${h.city}${h.amenities ? " · " + h.amenities.join(", ") : ""}</p>
          <p class="price">€${h.price} <span>per night</span></p>
        </div>
      </a>`)
    .join("");
  return `<div class="category-panel grid-3" data-cat="${key}" style="${visible ? "" : "display:none;"}">${cards}</div>`;
}

document.addEventListener("DOMContentLoaded", loadCountryPage);
