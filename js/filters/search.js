const API_BASE = "https://pokeapi.co/api/v2";
const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const typeChips = document.getElementById("typeChips");
const genSelect = document.getElementById("genSelect");
const sortSelect = document.getElementById("sortSelect");
const flagLegendary = document.getElementById("flagLegendary");
const flagHasMega = document.getElementById("flagHasMega");
const flagFullyEvolved = document.getElementById("flagFullyEvolved");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const resultsCount = document.getElementById("resultsCount");

let allPokemon = [];
let filteredPokemon = [];

// --- Utility Functions ---
function padId(id) {
    return "#" + id.toString().padStart(3, "0");
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Fetch All Pokémon (basic info) ---
async function fetchAllPokemon() {
    const res = await fetch(`${API_BASE}/pokemon?limit=1010`);
    const data = await res.json();
    return data.results.map(p => ({
        name: p.name,
        url: p.url,
        id: parseInt(p.url.split("/").slice(-2)[0])
    }));
}

// --- Fetch Details for a Pokémon ---
async function fetchPokemonDetails(pokemon) {
    if (pokemon.details) return pokemon.details;
    const res = await fetch(pokemon.url);
    const data = await res.json();
    const speciesRes = await fetch(data.species.url);
    const species = await speciesRes.json();
    pokemon.details = {
        types: data.types.map(t => t.type.name),
        sprite: data.sprites.front_default,
        isLegendary: species.is_legendary,
        hasMega: species.varieties.some(v => v.pokemon.name.includes("mega")),
        isFullyEvolved: !species.evolves_from_species,
        generation: parseInt(species.generation.url.match(/(\d+)\/?$/)[1])
    };
    return pokemon.details;
}

// --- Render Functions ---
function renderGrid(pokemonList) {
    grid.innerHTML = "";
    if (pokemonList.length === 0) {
        grid.innerHTML = "<div style='padding:2em;'>No Pokémon found.</div>";
        adjustGridLayout();
        // Still call repaginate to update resultsCount and pagination
        if (window.repaginate) window.repaginate();
        return;
    }
    let rendered = 0;
    pokemonList.forEach(async (pokemon) => {
        const details = await fetchPokemonDetails(pokemon);
        const typesHtml = details.types.map(
            t => `<span class="type t-${t}">${capitalize(t)}</span>`
        ).join("");
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
            <div class="thumb">
                <img src="${details.sprite}" alt="${capitalize(pokemon.name)}">
            </div>
            <div class="meta">
                <div class="row">
                    <span class="no">${padId(pokemon.id)}</span>
                    <span class="name">${capitalize(pokemon.name)}</span>
                </div>
                <div class="types">${typesHtml}</div>
            </div>
        `;
        grid.appendChild(card);
        rendered++;
        if (rendered === pokemonList.length) {
            adjustGridLayout();
            // Call repaginate after all cards are rendered
            if (window.repaginate) window.repaginate();
        }
    });
}

// Dynamically adjust grid columns based on container width and card size
function adjustGridLayout() {
    if (!grid) return;
    const containerWidth = grid.offsetWidth;
    const minCardWidth = 240;
    const columns = Math.max(1, Math.floor(containerWidth / minCardWidth));
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.height = "auto";
}

// --- Filtering, Sorting ---
function applyFilters() {
    // Only run filtering and update grid if there is any input/filter active
    const q = searchInput.value.trim().toLowerCase();
    const activeType = typeChips.querySelector(".chip.active");
    const gen = genSelect.value;
    const sort = sortSelect.value;
    const anyFlag = flagLegendary.checked || flagHasMega.checked || flagFullyEvolved.checked;

    // If nothing is selected/typed, do not update the grid (leave dummy cards)
    if (!q && !activeType && !gen && !anyFlag && (!sort || sort === "name_asc")) {
        // Optionally, you can still call repaginate to update pagination for dummy cards
        if (window.repaginate) window.repaginate();
        return;
    }

    let list = [...allPokemon];

    // Search
    if (q) {
        list = list.filter(p =>
            p.name.includes(q) ||
            padId(p.id).includes(q) ||
            (p.details && p.details.types.some(t => t.includes(q)))
        );
    }

    // Type
    if (activeType) {
        const type = activeType.textContent.toLowerCase();
        list = list.filter(p => p.details && p.details.types.includes(type));
    }

    // Generation
    if (gen) {
        list = list.filter(p => p.details && p.details.generation == gen);
    }

    // Flags
    if (flagLegendary.checked) {
        list = list.filter(p => p.details && p.details.isLegendary);
    }
    if (flagHasMega.checked) {
        list = list.filter(p => p.details && p.details.hasMega);
    }
    if (flagFullyEvolved.checked) {
        list = list.filter(p => p.details && p.details.isFullyEvolved);
    }

    // Sorting
    if (sort) {
        list.sort((a, b) => {
            if (sort === "name_asc") return a.name.localeCompare(b.name);
            if (sort === "name_desc") return b.name.localeCompare(a.name);
            if (sort === "id_asc") return a.id - b.id;
            if (sort === "id_desc") return b.id - a.id;
            return 0;
        });
    }

    filteredPokemon = list;
    renderGrid(filteredPokemon);
}

searchInput.addEventListener("input", applyFilters);
searchClear.addEventListener("click", () => {
    searchInput.value = "";
    applyFilters();
});
typeChips.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
        if (e.target.classList.contains("active")) {
            e.target.classList.remove("active");
        } else {
            typeChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
        }
        applyFilters();
    }
});
genSelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
flagLegendary.addEventListener("change", applyFilters);
flagHasMega.addEventListener("change", applyFilters);
flagFullyEvolved.addEventListener("change", applyFilters);
pageSizeSelect.addEventListener("change", () => {
    if (window.repaginate) window.repaginate();
});
window.addEventListener("resize", adjustGridLayout);

// --- Initial Load ---
(async function init() {
    allPokemon = await fetchAllPokemon();
    await Promise.all(allPokemon.map(fetchPokemonDetails));
    applyFilters();
})();
