const API_BASE = "https://pokeapi.co/api/v2";
const grid = document.getElementById("grid");
const pagination = document.getElementById("pagination");
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
let currentPage = 1;
let pageSize = parseInt(pageSizeSelect.value);

// --- Utility Functions ---
function padId(id) {
    return "#" + id.toString().padStart(3, "0");
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Fetch All Pokémon (basic info) ---
async function fetchAllPokemon() {
    // Get all Pokémon (limit 1010 for Gen IX)
    const res = await fetch(`${API_BASE}/pokemon?limit=1010`);
    const data = await res.json();
    // Add id from URL
    return data.results.map(p => ({
        name: p.name,
        url: p.url,
        id: parseInt(p.url.split("/").slice(-2)[0])
    }));
}

// --- Fetch Details for a Pokémon ---
async function fetchPokemonDetails(pokemon) {
    // Fetch details only if not already present
    if (pokemon.details) return pokemon.details;
    const res = await fetch(pokemon.url);
    const data = await res.json();
    // Get species for flags
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
        // When all cards are rendered, adjust layout
        if (rendered === pokemonList.length) {
            adjustGridLayout();
        }
    });
}

function renderPagination(total, page, pageSize) {
    const totalPages = Math.ceil(total / pageSize);
    pagination.innerHTML = "";
    // Prev button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-nav";
    prevBtn.textContent = "Prev";
    prevBtn.disabled = page === 1;
    prevBtn.onclick = () => goToPage(page - 1);
    pagination.appendChild(prevBtn);

    // Page numbers (simple version, can be improved)
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
            const btn = document.createElement("button");
            btn.className = "page";
            btn.textContent = i;
            if (i === page) btn.setAttribute("aria-current", "page");
            btn.onclick = () => goToPage(i);
            pagination.appendChild(btn);
        } else if (
            (i === 2 && page > 3) ||
            (i === totalPages - 1 && page < totalPages - 2)
        ) {
            const span = document.createElement("span");
            span.className = "ellipsis";
            span.textContent = "...";
            pagination.appendChild(span);
        }
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-nav";
    nextBtn.textContent = "Next";
    nextBtn.disabled = page === totalPages;
    nextBtn.onclick = () => goToPage(page + 1);
    pagination.appendChild(nextBtn);
}

// Dynamically adjust grid columns based on container width and card size
function adjustGridLayout() {
    const grid = document.getElementById("grid");
    if (!grid) return;
    const containerWidth = grid.offsetWidth;
    const minCardWidth = 240; // px, adjust if your card is wider
    const columns = Math.max(1, Math.floor(containerWidth / minCardWidth));
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    grid.style.height = "auto"; // Let height grow as needed
}

// --- Filtering, Sorting, Paging ---
function applyFilters() {
    let list = [...allPokemon];

    // Search
    const q = searchInput.value.trim().toLowerCase();
    if (q) {
        list = list.filter(p =>
            p.name.includes(q) ||
            padId(p.id).includes(q) ||
            (p.details && p.details.types.some(t => t.includes(q)))
        );
    }

    // Type
    const activeType = typeChips.querySelector(".chip.active");
    if (activeType) {
        const type = activeType.textContent.toLowerCase();
        list = list.filter(p => p.details && p.details.types.includes(type));
    }

    // Generation
    const gen = genSelect.value;
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
    const sort = sortSelect.value;
    list.sort((a, b) => {
        if (sort === "name_asc") return a.name.localeCompare(b.name);
        if (sort === "name_desc") return b.name.localeCompare(a.name);
        if (sort === "id_asc") return a.id - b.id;
        if (sort === "id_desc") return b.id - a.id;
        return 0;
    });

    filteredPokemon = list;
    currentPage = 1;
    updateView();
}

function updateView() {
    // Paging
    const total = filteredPokemon.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    resultsCount.textContent = `Showing ${start + 1}-${end} of ${total}`;
    renderGrid(filteredPokemon.slice(start, end));
    renderPagination(total, currentPage, pageSize);
}

function goToPage(page) {
    currentPage = page;
    updateView();
}

// --- Event Listeners ---
searchInput.addEventListener("input", applyFilters);
searchClear.addEventListener("click", () => {
    searchInput.value = "";
    applyFilters();
});
typeChips.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
        // If already active, unselect it
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
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    updateView();
});
window.addEventListener("resize", adjustGridLayout);

// --- Initial Load ---
(async function init() {
    allPokemon = await fetchAllPokemon();
    // Pre-fetch details for all (for filtering/sorting)
    await Promise.all(allPokemon.map(fetchPokemonDetails));
    applyFilters();
})();
