// continents-page.js
// Renders destinations-by-continent.html from data/continents.json,
// cross-referencing each country's own data/countries/<slug>.json
// for its display name and a one-line description.

async function loadContinentsPage() {
  let continentData;
  try {
    const res = await fetch("data/continents.json");
    continentData = await res.json();
  } catch (err) {
    return;
  }

  const continents = continentData.continents;

  // Resolve each country's display name (fetch all country JSONs in parallel)
  const allSlugs = continents.flatMap(c => c.countries);
  const countryInfo = {};
  await Promise.all(allSlugs.map(async slug => {
    try {
      const res = await fetch(`data/countries/${slug}.json`);
      const data = await res.json();
      countryInfo[slug] = { name: data.country, intro: data.intro };
    } catch (err) {
      countryInfo[slug] = { name: slug, intro: "" };
    }
  }));

  // Jump chips
  const jumpEl = document.getElementById("continent-jump");
  jumpEl.innerHTML = continents
    .map(c => `<a class="chip" href="#${c.slug}">${c.name}</a>`)
    .join("");

  // Sections
  const sectionsEl = document.getElementById("continent-sections");
  sectionsEl.innerHTML = continents
    .map((c, i) => renderContinentSection(c, countryInfo, i % 2 === 1))
    .join("");

  if (typeof roeHydratePhotos === "function") roeHydratePhotos(sectionsEl);
}

function renderContinentSection(continent, countryInfo, shaded) {
  const cards = continent.countries
    .map(slug => {
      const info = countryInfo[slug] || { name: slug };
      return `
        <a class="dest-card" href="countries/${slug}.html" style="text-decoration:none; color:inherit;">
          <div class="dest-img" data-photo-query="${info.name} landmark"></div>
          <div class="dest-body">
            <h4>${info.name}</h4>
            <p class="from">${(info.intro || "").split(".")[0]}.</p>
          </div>
        </a>`;
    })
    .join("");

  return `
    <section id="${continent.slug}" class="${shaded ? "section-cloud" : ""}">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">${continent.name}</p>
          <h2>${continent.blurb}</h2>
          <p>Best time to visit: ${continent.bestTime}</p>
        </div>
        <div class="grid-3">${cards}</div>
      </div>
    </section>`;
}

document.addEventListener("DOMContentLoaded", loadContinentsPage);
