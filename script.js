/* Burma Birds Portal interactions */
const STORAGE = {
  observations: "burmaBirdsObservations",
  identifications: "burmaBirdsIdentifications",
  documents: "burmaBirdsDocuments"
};

const state = {
  birds: [...allBirds],
  observations: loadJSON(STORAGE.observations, []),
  identifications: loadJSON(STORAGE.identifications, []),
  documents: loadJSON(STORAGE.documents, []),
  activeTab: "species"
};

const $ = (sel) => document.querySelector(sel);

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function statusClass(status) {
  const value = normalize(status);
  if (value.includes("least")) return "status-lc";
  if (value.includes("near")) return "status-nt";
  if (value.includes("vulnerable")) return "status-vu";
  if (value.includes("endangered") && !value.includes("critically")) return "status-en";
  if (value.includes("critical")) return "status-cr";
  return "status-lc";
}

function speciesKey(name) {
  return normalize(name);
}

function enrichBirds() {
  const map = new Map(state.birds.map(b => [speciesKey(b.name), { ...b, observations_count: 0, identifications_count: 0, provisional: false }]));

  for (const obs of state.observations) {
    const key = speciesKey(obs.species);
    if (!map.has(key)) {
      map.set(key, {
        id: `obs-${key}`,
        name: obs.species,
        scientific_name: obs.scientific_name || "Unverified record",
        family: obs.family || "Unverified",
        region: obs.region || "Nationwide",
        photo_url: obs.photo_url || "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=1200&q=80",
        photo_credit: obs.photo_credit || "User observation",
        description: obs.notes || "Observed by a citizen contributor.",
        habitat: obs.habitat || "Unspecified habitat",
        habitat_group: obs.habitat || "Unspecified",
        conservation_status: "Needs review",
        endemic: false,
        observations_count: 0,
        identifications_count: 0,
        provisional: true
      });
    }
    map.get(key).observations_count += Number(obs.count || 1);
  }

  for (const idn of state.identifications) {
    const key = speciesKey(idn.bestMatch.name);
    if (!map.has(key)) {
      map.set(key, {
        id: `id-${key}`,
        name: idn.bestMatch.name,
        scientific_name: idn.bestMatch.scientific_name || "Preliminary match",
        family: idn.bestMatch.family || "Unverified",
        region: idn.region || "Nationwide",
        photo_url: idn.photoUrl || "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1200&q=80",
        photo_credit: "Identification record",
        description: idn.bestMatch.description || "Added through the identify workflow.",
        habitat: idn.bestMatch.habitat || "Unspecified habitat",
        habitat_group: idn.bestMatch.habitat_group || "Unspecified",
        conservation_status: idn.bestMatch.conservation_status || "Preliminary",
        endemic: Boolean(idn.bestMatch.endemic),
        observations_count: 0,
        identifications_count: 0,
        provisional: true
      });
    }
    map.get(key).identifications_count += 1;
  }

  return [...map.values()].sort((a, b) => {
    const scoreA = (a.identifications_count + a.observations_count) * 100 + (a.endemic ? 5 : 0) + (a.provisional ? -1 : 0);
    const scoreB = (b.identifications_count + b.observations_count) * 100 + (b.endemic ? 5 : 0) + (b.provisional ? -1 : 0);
    return scoreB - scoreA || a.name.localeCompare(b.name);
  });
}

function renderStats(enriched) {
  const observations = state.observations.reduce((sum, o) => sum + Number(o.count || 1), 0);
  const documents = state.documents.length;
  const identifications = state.identifications.length;
  const threatened = enriched.filter(b => /threatened|vulnerable|endangered|critical/i.test(b.conservation_status)).length;
  const endemic = enriched.filter(b => b.endemic).length;

  const stats = [
    ["Species", enriched.length],
    ["Observations", observations],
    ["Documents", documents],
    ["Identifications", identifications],
    ["Endemic", endemic],
    ["Threatened", threatened]
  ];

  $("#statsGrid").innerHTML = stats.map(([label, value]) => `
    <div class="stat-card">
      <p class="text-3xl font-black">${value}</p>
      <p class="mt-1 text-sm text-slate-300">${label}</p>
    </div>
  `).join("");
}

function renderSpecies(enriched) {
  const cards = $("#speciesCards");
  const table = $("#speciesTable");

  cards.innerHTML = enriched.map(bird => {
    const totalRecords = (bird.observations_count || 0) + (bird.identifications_count || 0);
    return `
      <article class="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 hover-lift">
        <div class="relative">
          <img src="${bird.photo_url}" alt="${bird.name}" class="h-56 w-full object-cover" />
          <div class="absolute left-4 top-4 flex gap-2">
            <span class="status-badge ${statusClass(bird.conservation_status)}">${bird.conservation_status}</span>
            ${bird.endemic ? '<span class="status-badge bg-fuchsia-400/15 text-fuchsia-200">Endemic</span>' : ""}
          </div>
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-xl font-bold">${bird.name}</h3>
              <p class="text-sm italic text-slate-400">${bird.scientific_name}</p>
            </div>
            ${bird.provisional ? '<span class="record-pill">Provisional</span>' : ""}
          </div>
          <p class="mt-3 text-sm text-slate-300">${bird.description}</p>
          <div class="mt-4 flex flex-wrap gap-2 text-xs">
            <span class="record-pill">${bird.family}</span>
            <span class="record-pill">${bird.habitat_group}</span>
            <span class="record-pill">${bird.region}</span>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <p class="text-xs text-slate-400">Habitat</p>
              <p class="mt-1 font-semibold">${bird.habitat}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <p class="text-xs text-slate-400">Records</p>
              <p class="mt-1 font-semibold">${totalRecords}</p>
            </div>
          </div>
          <p class="mt-3 text-xs text-slate-500">Photo: ${bird.photo_credit}</p>
        </div>
      </article>
    `;
  }).join("");

  table.innerHTML = enriched.map(bird => {
    const totalRecords = (bird.observations_count || 0) + (bird.identifications_count || 0);
    return `
      <tr class="align-top">
        <td class="px-5 py-4">
          <div class="font-semibold text-slate-100">${bird.name}</div>
          <div class="text-xs text-slate-400">${bird.endemic ? "Endemic" : "Native"}</div>
        </td>
        <td class="px-5 py-4 italic text-slate-300">${bird.scientific_name}</td>
        <td class="px-5 py-4"><span class="status-badge ${statusClass(bird.conservation_status)}">${bird.conservation_status}</span></td>
        <td class="px-5 py-4 text-slate-300">${bird.habitat_group}</td>
        <td class="px-5 py-4 text-slate-200">${totalRecords}</td>
      </tr>
    `;
  }).join("");
}

function renderOptions(enriched) {
  const list = $("#speciesOptions");
  list.innerHTML = enriched.map(b => `<option value="${b.name}"></option>`).join("");
}

function renderObservations() {
  const list = $("#observationsList");
  if (!state.observations.length) {
    list.innerHTML = '<div class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No observations yet. Add the first field record.</div>';
    return;
  }
  list.innerHTML = [...state.observations].reverse().map(obs => `
    <article class="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-semibold">${obs.species}</h4>
          <p class="text-xs text-slate-400">${obs.location || "Unknown location"} • ${obs.date || "No date"}</p>
        </div>
        <span class="record-pill">Count ${obs.count || 1}</span>
      </div>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        ${obs.region ? `<span class="record-pill">${obs.region}</span>` : ""}
        ${obs.habitat ? `<span class="record-pill">${obs.habitat}</span>` : ""}
      </div>
      ${obs.notes ? `<p class="mt-3 text-sm text-slate-300">${obs.notes}</p>` : ""}
      ${obs.photo_url ? `<img src="${obs.photo_url}" alt="${obs.species}" class="mt-3 h-40 w-full rounded-2xl object-cover" />` : ""}
    </article>
  `).join("");
}

function renderIdentifications() {
  const list = $("#identificationsList");
  if (!state.identifications.length) {
    list.innerHTML = '<div class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No identifications yet. Use the identify tab.</div>';
    return;
  }
  list.innerHTML = [...state.identifications].reverse().map(item => `
    <article class="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-semibold">${item.bestMatch.name}</h4>
          <p class="text-xs text-slate-400">${item.bestMatch.scientific_name}</p>
        </div>
        <span class="record-pill">${Math.round(item.score)}% match</span>
      </div>
      <p class="mt-2 text-sm text-slate-300">Matched using your selected traits.</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        ${item.region ? `<span class="record-pill">${item.region}</span>` : ""}
        ${item.habitat ? `<span class="record-pill">${item.habitat}</span>` : ""}
        ${item.size ? `<span class="record-pill">${item.size}</span>` : ""}
      </div>
    </article>
  `).join("");
}

function renderDocuments() {
  const list = $("#documentsList");
  if (!state.documents.length) {
    list.innerHTML = '<div class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No documents uploaded yet.</div>';
    return;
  }
  list.innerHTML = [...state.documents].reverse().map(doc => `
    <article class="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-semibold">${doc.title}</h4>
          <p class="text-xs text-slate-400">${doc.category} • ${doc.source || "No source"}</p>
        </div>
        ${doc.fileName ? `<span class="record-pill">${doc.fileName}</span>` : ""}
      </div>
      ${doc.summary ? `<p class="mt-3 text-sm text-slate-300">${doc.summary}</p>` : ""}
      <div class="mt-3 flex gap-2">
        ${doc.fileData ? `<a class="btn-secondary px-4 py-2" href="${doc.fileData}" download="${doc.fileName || "document"}" type="button">Download</a>` : ""}
      </div>
    </article>
  `).join("");
}

function guessBestMatch(input) {
  const guess = normalize(input.guess);
  const region = normalize(input.region);
  const habitat = normalize(input.habitat);
  const notes = normalize(input.notes);
  const behavior = normalize(input.behavior);
  const color = normalize(input.color);
  const size = normalize(input.size);

  let scored = state.birds.map(bird => {
    let score = 0;
    const haystack = normalize([
      bird.name,
      bird.scientific_name,
      bird.description,
      bird.habitat,
      bird.family,
      bird.region,
      bird.habitat_group
    ].join(" "));

    if (guess && haystack.includes(guess)) score += 65;
    if (region && normalize(bird.region).includes(region)) score += 18;
    if (habitat && normalize(bird.habitat_group).includes(habitat)) score += 20;
    if (notes && notes.split(/\s+/).some(token => token.length > 3 && haystack.includes(token))) score += 12;
    if (behavior && haystack.includes(behavior)) score += 8;
    if (color && haystack.includes(color)) score += 8;
    if (size && /small|medium|large/.test(size)) {
      const sizeMap = { small: ["bulbul", "nuthatch", "lark", "minivet"], medium: ["parakeet", "treepie", "bulbul"], large: ["hornbill", "peafowl"] };
      const birdText = normalize(bird.name + " " + bird.description);
      const matches = sizeMap[size.toLowerCase()] || [];
      if (matches.some(k => birdText.includes(k))) score += 10;
    }
    if (bird.endemic) score += 4;
    if (/endangered|vulnerable/.test(normalize(bird.conservation_status))) score += 2;
    return { bird, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const fallback = state.birds[0];
  return {
    bestMatch: best && best.score > 0 ? best.bird : fallback,
    score: Math.min(99, Math.max(best ? best.score : 0, 20))
  };
}

async function readPhoto(file) {
  if (!file) return "";
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function showTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tab}`);
  });
  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function wireTabs() {
  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab) showTab(tab);
    });
  });

  document.querySelectorAll("[data-tab-target]").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tabTarget));
  });

  const menuButton = $("#menuButton");
  const mobileNav = $("#mobileNav");
  menuButton?.addEventListener("click", () => mobileNav.classList.toggle("hidden"));
}

function saveAndRender() {
  saveJSON(STORAGE.observations, state.observations);
  saveJSON(STORAGE.identifications, state.identifications);
  saveJSON(STORAGE.documents, state.documents);

  const enriched = enrichBirds();
  renderStats(enriched);
  renderSpecies(enriched);
  renderOptions(enriched);
  renderObservations();
  renderIdentifications();
  renderDocuments();
}

function wireFilters() {
  ["searchInput", "habitatFilter", "statusFilter", "regionFilter"].forEach(id => {
    $("#" + id)?.addEventListener("input", applyFilters);
    $("#" + id)?.addEventListener("change", applyFilters);
  });
  $("#resetFilters")?.addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#habitatFilter").value = "";
    $("#statusFilter").value = "";
    $("#regionFilter").value = "";
    applyFilters();
  });
}

function applyFilters() {
  const search = normalize($("#searchInput").value);
  const habitat = normalize($("#habitatFilter").value);
  const status = normalize($("#statusFilter").value);
  const region = normalize($("#regionFilter").value);

  const filtered = enrichBirds().filter(bird => {
    const haystack = normalize(`${bird.name} ${bird.scientific_name} ${bird.description} ${bird.habitat} ${bird.region} ${bird.family}`);
    return (!search || haystack.includes(search)) &&
      (!habitat || normalize(bird.habitat_group).includes(habitat)) &&
      (!status || normalize(bird.conservation_status).includes(status)) &&
      (!region || normalize(bird.region).includes(region));
  });

  renderSpecies(filtered);
  renderStats(filtered);
}

function wireIdentifyForm() {
  $("#identifyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const photo = $("#identifyPhoto").files?.[0];
    const payload = {
      guess: $("#identifyGuess").value,
      region: $("#identifyRegion").value,
      habitat: $("#identifyHabitat").value,
      color: $("#identifyColor").value,
      size: $("#identifySize").value,
      behavior: $("#identifyBehavior").value,
      notes: $("#identifyNotes").value
    };
    const matched = guessBestMatch(payload);
    const photoUrl = await readPhoto(photo).catch(() => "");
    const entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      photoUrl,
      ...payload,
      bestMatch: {
        name: matched.bestMatch.name,
        scientific_name: matched.bestMatch.scientific_name,
        family: matched.bestMatch.family,
        habitat: matched.bestMatch.habitat_group || matched.bestMatch.habitat,
        habitat_group: matched.bestMatch.habitat_group,
        conservation_status: matched.bestMatch.conservation_status,
        endemic: matched.bestMatch.endemic,
        description: matched.bestMatch.description
      },
      score: matched.score
    };
    state.identifications.push(entry);
    $("#identifyResult").innerHTML = `
      <div class="flex items-start gap-4">
        <img src="${photoUrl || matched.bestMatch.photo_url}" alt="${matched.bestMatch.name}" class="h-20 w-20 rounded-2xl border border-white/10 object-cover" />
        <div>
          <p class="font-semibold text-emerald-300">Best match: ${matched.bestMatch.name}</p>
          <p class="mt-1 text-sm text-slate-300">${matched.bestMatch.scientific_name}</p>
          <p class="mt-1 text-xs text-slate-400">Confidence score: ${Math.round(matched.score)}%</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="status-badge ${statusClass(matched.bestMatch.conservation_status)}">${matched.bestMatch.conservation_status}</span>
            ${matched.bestMatch.endemic ? '<span class="status-badge bg-fuchsia-400/15 text-fuchsia-200">Endemic</span>' : ""}
          </div>
        </div>
      </div>
    `;
    $("#identifyForm").reset();
    saveAndRender();
    showTab("species");
  });
}

function wireObservationForm() {
  $("#observationDate").valueAsDate = new Date();
  $("#observationForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const photo = $("#observationPhoto").files?.[0];
    const photoUrl = await readPhoto(photo).catch(() => "");
    const species = $("#observationSpecies").value.trim();
    if (!species) return;

    state.observations.push({
      id: crypto.randomUUID(),
      species,
      count: Number($("#observationCount").value || 1),
      location: $("#observationLocation").value.trim(),
      date: $("#observationDate").value,
      region: $("#observationRegion").value,
      habitat: $("#observationHabitat").value,
      notes: $("#observationNotes").value.trim(),
      photo_url: photoUrl
    });

    $("#observationForm").reset();
    $("#observationDate").valueAsDate = new Date();
    saveAndRender();
    showTab("species");
  });
}

function wireDocumentForm() {
  $("#documentForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = $("#documentFile").files?.[0];
    let fileData = "";
    let fileName = "";
    if (file) {
      fileName = file.name;
      if (file.size < 3 * 1024 * 1024) {
        fileData = await readPhoto(file).catch(() => "");
      }
    }

    state.documents.push({
      id: crypto.randomUUID(),
      title: $("#documentTitle").value.trim(),
      category: $("#documentCategory").value,
      source: $("#documentSource").value.trim(),
      summary: $("#documentSummary").value.trim(),
      fileName,
      fileData,
      createdAt: new Date().toISOString()
    });

    $("#documentForm").reset();
    saveAndRender();
    showTab("documents");
  });
}

(function init() {
  wireTabs();
  wireFilters();
  wireIdentifyForm();
  wireObservationForm();
  wireDocumentForm();

  const enriched = enrichBirds();
  renderStats(enriched);
  renderSpecies(enriched);
  renderOptions(enriched);
  renderObservations();
  renderIdentifications();
  renderDocuments();

  const featured = state.birds[6];
  if (featured) {
    $("#heroImage").src = featured.photo_url;
    $("#heroName").textContent = featured.name;
    $("#heroSci").textContent = featured.scientific_name;
    $("#heroStatus").textContent = featured.conservation_status;
    $("#heroHabitat").textContent = featured.habitat;
  }
})();
