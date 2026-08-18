// hotel-page.js
// Reusable renderer for /countries/hotel.html?country=<slug>&category=<key>&index=<n>
// One page serves every hotel on the site — no per-hotel files needed.

const CATEGORY_LABELS = {
  luxury: "Luxury Hotel",
  standard: "Standard Hotel",
  budget: "Budget Hotel",
  business: "Business Hotel",
  family: "Family Hotel",
  airportHotels: "Airport Hotel",
  beachResorts: "Beach Resort",
  mountainResorts: "Mountain Resort",
  romantic: "Romantic Hotel",
  pool: "Hotel with Pool",
  breakfast: "Hotel with Breakfast",
  parking: "Hotel with Parking",
  petFriendly: "Pet Friendly Hotel"
};

const SAMPLE_ROOM_TYPES = [
  { name: "Standard Room", multiplier: 1.0, desc: "Comfortable room with the essentials — free Wi-Fi, work desk, en-suite bathroom." },
  { name: "Deluxe Room", multiplier: 1.35, desc: "More space and a better view, plus a seating area." },
  { name: "Suite", multiplier: 1.9, desc: "Separate living area, premium amenities, and the best views in the hotel." }
];

const SAMPLE_REVIEWS = [
  { name: "Traveler from the UK", rating: 5, text: "Exactly as described — clean, well located, and the staff were genuinely helpful when we needed a late check-out." },
  { name: "Traveler from Canada", rating: 4, text: "Good value for the area. Room was smaller than expected but everything worked and it was quiet at night." },
  { name: "Traveler from Germany", rating: 5, text: "Would book again. Easy walk to the main attractions and breakfast was better than expected." }
];

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    country: p.get("country"),
    category: p.get("category"),
    index: parseInt(p.get("index"), 10)
  };
}

async function loadHotelPage() {
  const { country, category, index } = getParams();
  if (!country || !category || isNaN(index)) {
    document.getElementById("hotel-name").textContent = "Hotel not found";
    return;
  }

  let data;
  try {
    const res = await fetch(`../data/countries/${country}.json`);
    if (!res.ok) throw new Error("not found");
    data = await res.json();
  } catch (err) {
    document.getElementById("hotel-name").textContent = "Hotel not found";
    return;
  }

  const list = (data.categories && data.categories[category]) || [];
  const hotel = list[index];
  if (!hotel) {
    document.getElementById("hotel-name").textContent = "Hotel not found";
    return;
  }

  const categoryLabel = CATEGORY_LABELS[category] || category;

  // Gallery photos (real hotel photos require a licensed affiliate feed —
  // see README.md — these try Hotellook first for real photos of an
  // actual hotel in this city, with a different photo index per thumbnail
  // so the gallery shows different angles of the SAME real hotel rather
  // than 5 unrelated images; Unsplash queries below are also
  // city-specific so the fallback varies by destination too, not just
  // generic terms like "hotel room" that would look identical everywhere)
  const galleryQueries = [
    `${hotel.city} hotel exterior`,
    `${hotel.city} hotel room`,
    `${hotel.city} hotel lobby`,
    `${hotel.city} skyline`,
    `${hotel.city} hotel bathroom`
  ];
  const galleryEl = document.getElementById("hotel-gallery");
  if (galleryEl) {
    const mainEl = galleryEl.querySelector(".gallery-main");
    mainEl.dataset.photoQuery = galleryQueries[0];
    mainEl.dataset.photoCity = hotel.city;
    mainEl.dataset.photoOffset = String(index);
    mainEl.dataset.photoIndex = "1";
    galleryEl.querySelectorAll(".gallery-thumbs div").forEach((el, i) => {
      el.dataset.photoQuery = galleryQueries[i + 1] || galleryQueries[0];
      el.dataset.photoCity = hotel.city;
      el.dataset.photoOffset = String(index); // same real hotel as the main photo
      el.dataset.photoIndex = String(i + 2); // different angle: photos 2,3,4,5
    });
  }

  // Title + meta
  document.title = `${hotel.name}, ${hotel.city} — Roe Travel`;
  document.getElementById("page-title").textContent = `${hotel.name}, ${hotel.city} — Roe Travel`;
  document.getElementById("meta-desc").setAttribute("content",
    `${hotel.name} in ${hotel.area}, ${hotel.city}, ${data.country} — ${categoryLabel.toLowerCase()} from €${hotel.price} per night on Roe Travel.`);

  // Breadcrumb
  document.getElementById("crumb-country").innerHTML = `<a href="${country}.html" style="color:var(--slate);">${data.country}</a>`;
  document.getElementById("crumb-hotel").textContent = hotel.name;

  // Hero info
  document.getElementById("hotel-category-label").textContent = categoryLabel;
  document.getElementById("hotel-name").textContent = hotel.name;
  document.getElementById("hotel-stars").textContent = "★".repeat(hotel.stars) + "☆".repeat(5 - hotel.stars);
  document.getElementById("hotel-location").textContent = `${hotel.area}, ${hotel.city}, ${data.country}`;
  document.getElementById("hotel-price").textContent = `€${hotel.price}`;

  const amenEl = document.getElementById("hotel-amenities");
  if (hotel.amenities) {
    amenEl.innerHTML = hotel.amenities.map(a => `<span>${a}</span>`).join("");
  }

  // Description
  document.getElementById("hotel-desc-heading").textContent = `About ${hotel.name}`;
  document.getElementById("hotel-description").textContent =
    `${hotel.name} is a ${hotel.stars}-star ${categoryLabel.toLowerCase()} in ${hotel.area}, ${hotel.city}. ` +
    `Guests typically choose it for ${(hotel.amenities || []).slice(0, 2).join(" and ").toLowerCase() || "its location and value"}, ` +
    `with rates starting at €${hotel.price} per night.`;

  // Room types (generated from base price — placeholder pattern until real inventory connects)
  document.getElementById("room-types").innerHTML = SAMPLE_ROOM_TYPES.map(r => `
    <div class="dest-card">
      <div class="dest-body" style="padding-top:20px;">
        <h4>${r.name}</h4>
        <p class="from">${r.desc}</p>
        <p class="price">€${Math.round(hotel.price * r.multiplier)} <span>per night</span></p>
      </div>
    </div>`).join("");

  // Map placeholder + address
  document.getElementById("hotel-address").textContent = `${hotel.area}, ${hotel.city}, ${data.country}`;

  // Nearby attractions (reuse country-level list — placeholder until per-hotel distances exist)
  const attrEl = document.getElementById("nearby-attractions");
  if (data.topAttractions) {
    attrEl.innerHTML = data.topAttractions.slice(0, 4).map(a => `<li>${a}</li>`).join("");
  }

  // Guest reviews
  document.getElementById("guest-reviews").innerHTML = SAMPLE_REVIEWS.map(r => `
    <div class="contact-card" style="margin-bottom:14px;">
      <strong style="color:var(--ink);">${r.name}</strong>
      <span style="color:var(--amber-dark); margin-left:8px;">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
      <p style="margin:8px 0 0; font-size:14.5px; color:var(--slate-dark);">${r.text}</p>
    </div>`).join("");

  // FAQ + schema
  const faq = [
    { q: `What time is check-in and check-out at ${hotel.name}?`, a: "Standard check-in is from 3:00 PM and check-out is by 11:00 AM; early check-in and late check-out can often be arranged for a fee." },
    { q: `Is breakfast included at ${hotel.name}?`, a: hotel.amenities && hotel.amenities.some(a => /breakfast/i.test(a)) ? "Yes, breakfast is included in most rates at this hotel." : "Breakfast is available for some rate plans — check the rate details before booking if it matters to you." },
    { q: `Can I cancel my booking at ${hotel.name} for free?`, a: "Most rate plans at this hotel include free cancellation up to 24–48 hours before check-in; non-refundable rates are cheaper but lock in the booking." }
  ];
  document.getElementById("hotel-faq").innerHTML = faq
    .map(f => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`)
    .join("");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
  };
  const faqScript = document.createElement("script");
  faqScript.type = "application/ld+json";
  faqScript.textContent = JSON.stringify(faqSchema);
  document.head.appendChild(faqScript);

  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.name,
    "address": { "@type": "PostalAddress", "addressLocality": hotel.city, "addressRegion": hotel.area, "addressCountry": data.country },
    "starRating": { "@type": "Rating", "ratingValue": hotel.stars },
    "priceRange": `€${hotel.price}`
  };
  const hotelScript = document.createElement("script");
  hotelScript.type = "application/ld+json";
  hotelScript.textContent = JSON.stringify(hotelSchema);
  document.head.appendChild(hotelScript);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://roetravel.com/index.html" },
      { "@type": "ListItem", "position": 2, "name": "Hotels", "item": "https://roetravel.com/hotels.html" },
      { "@type": "ListItem", "position": 3, "name": data.country, "item": `https://roetravel.com/countries/${country}.html` },
      { "@type": "ListItem", "position": 4, "name": hotel.name, "item": window.location.href }
    ]
  };
  const bcScript = document.createElement("script");
  bcScript.type = "application/ld+json";
  bcScript.textContent = JSON.stringify(breadcrumbSchema);
  document.head.appendChild(bcScript);

  // Related hotels: other hotels in the same category (excluding this one)
  document.getElementById("related-heading").textContent = `More ${categoryLabel.toLowerCase()}s in ${data.country}`;
  const related = list
    .map((h, i) => ({ h, i }))
    .filter(x => x.i !== index)
    .slice(0, 3);
  document.getElementById("related-hotels").innerHTML = related.map(({ h, i }) => `
    <a class="dest-card" href="hotel.html?country=${country}&category=${category}&index=${i}" style="text-decoration:none; color:inherit;">
      <div class="dest-img" data-photo-query="${h.city} hotel" data-photo-city="${h.city}" data-photo-offset="${i}"><span class="badge">${"★".repeat(h.stars)}${"☆".repeat(5 - h.stars)}</span></div>
      <div class="dest-body">
        <h4>${h.name}</h4>
        <p class="from">${h.area}, ${h.city}</p>
        <p class="price">€${h.price} <span>per night</span></p>
      </div>
    </a>`).join("");

  if (typeof roeHydratePhotos === "function") roeHydratePhotos(document);
}

document.addEventListener("DOMContentLoaded", loadHotelPage);
