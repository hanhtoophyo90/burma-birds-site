document.addEventListener("DOMContentLoaded", () => {
  const birds = Array.isArray(window.allBirds) ? window.allBirds : [];

  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  const speciesGrid = document.querySelector("#speciesGrid");
  const searchInput = document.querySelector("#searchInput");
  const habitatFilter = document.querySelector("#habitatFilter");
  const statusFilter = document.querySelector("#statusFilter");
  const endemicFilter = document.querySelector("#endemicFilter");
  const resultsCount = document.querySelector("#resultsCount");
  const resetFilters = document.querySelector("#resetFilters");

  const habitatOptions = [...new Set(birds.map((b) => b.habitat).flatMap((h) => h.split(",").map((x) => x.trim())))]
    .filter(Boolean)
    .sort();

  if (habitatFilter) {
    habitatOptions.forEach((habitat) => {
      const option = document.createElement("option");
      option.value = habitat;
      option.textContent = habitat;
      habitatFilter.appendChild(option);
    });
  }

  const endemicCount = birds.filter((b) => b.endemic).length;
  const threatenedCount = birds.filter((b) => ["Near Threatened", "Vulnerable", "Endangered", "Critically Endangered"].includes(b.conservation_status)).length;
  const habitatsCount = new Set(birds.flatMap((b) => b.habitat.split(",").map((h) => h.trim()))).size;

  const statMap = {
    "stat-birds": birds.length,
    "stat-endemic": endemicCount,
    "stat-threatened": threatenedCount,
    "stat-habitats": habitatsCount
  };

  Object.entries(statMap).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  });

  function matchesFilters(bird) {
    const search = (searchInput?.value || "").trim().toLowerCase();
    const habitat = habitatFilter?.value || "";
    const status = statusFilter?.value || "";
    const endemic = endemicFilter?.value || "";

    const searchable = `${bird.name} ${bird.scientific_name} ${bird.description} ${bird.habitat} ${bird.region}`.toLowerCase();
    const habitatMatch = !habitat || bird.habitat.toLowerCase().includes(habitat.toLowerCase());
    const statusMatch = !status || bird.conservation_status === status;
    const endemicMatch =
      !endemic ||
      (endemic === "yes" && bird.endemic) ||
      (endemic === "no" && !bird.endemic);

    return searchable.includes(search) && habitatMatch && statusMatch && endemicMatch;
  }

  function getStatusClass(status) {
    if (status === "Endangered" || status === "Critically Endangered") return "endangered";
    if (status === "Vulnerable") return "vulnerable";
    return "near";
  }

  function renderBirdCard(bird) {
    const card = document.createElement("article");
    card.className = "species-card";

    const image = document.createElement("div");
    image.className = "species-image";
    image.style.backgroundImage = `url('${bird.photo_url}')`;

    const body = document.createElement("div");
    body.className = "species-body";
    body.innerHTML = `
      <h3>${bird.name}</h3>
      <p class="scientific"><em>${bird.scientific_name}</em></p>
      <div class="card-meta">
        <span class="badge">${bird.conservation_status}</span>
        ${bird.endemic ? '<span class="badge">Endemic</span>' : ''}
      </div>
      <p>${bird.habitat}</p>
      <button class="btn btn-secondary btn-small" type="button">Open details</button>
    `;

    body.querySelector("button").addEventListener("click", () => openDialog(bird));

    card.append(image, body);
    return card;
  }

  function renderSpecies() {
    if (!speciesGrid || !resultsCount) return;
    const filtered = birds.filter(matchesFilters);

    speciesGrid.innerHTML = "";
    if (filtered.length === 0) {
      resultsCount.textContent = "No species match your filters.";
      const empty = document.createElement("div");
      empty.className = "feature-card";
      empty.style.gridColumn = "1 / -1";
      empty.innerHTML = "<h3>No results</h3><p>Try resetting filters or searching with a different term.</p>";
      speciesGrid.appendChild(empty);
      return;
    }

    resultsCount.textContent = `${filtered.length} species found`;
    filtered.forEach((bird) => speciesGrid.appendChild(renderBirdCard(bird)));
  }

  searchInput?.addEventListener("input", renderSpecies);
  habitatFilter?.addEventListener("change", renderSpecies);
  statusFilter?.addEventListener("change", renderSpecies);
  endemicFilter?.addEventListener("change", renderSpecies);
  resetFilters?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (habitatFilter) habitatFilter.value = "";
    if (statusFilter) statusFilter.value = "";
    if (endemicFilter) endemicFilter.value = "";
    renderSpecies();
  });

  renderSpecies();

  const dialog = document.getElementById("speciesDialog");
  const dialogContent = document.getElementById("dialogContent");
  const closeDialog = document.getElementById("closeDialog");

  function openDialog(bird) {
    if (!dialog || !dialogContent) return;

    dialogContent.innerHTML = `
      <div class="dialog-grid">
        <div class="dialog-image" style="background-image:url('${bird.photo_url}')"></div>
        <div class="dialog-details">
          <h2>${bird.name}</h2>
          <p><em>${bird.scientific_name}</em></p>
          <div class="meta-list">
            <span><strong>Status:</strong> ${bird.conservation_status}</span>
            <span><strong>Habitat:</strong> ${bird.habitat}</span>
            <span><strong>Region:</strong> ${bird.region}</span>
            <span><strong>Endemic:</strong> ${bird.endemic ? "Yes" : "No"}</span>
            <span><strong>Photo credit:</strong> ${bird.photo_credit}</span>
          </div>
          <p>${bird.description}</p>
        </div>
      </div>
    `;
    dialog.showModal();
  }

  closeDialog?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!clickedInDialog) dialog.close();
  });
});
