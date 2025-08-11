// Search functionality for the search box in mega-evolution.html

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    if (!searchInput || !searchClear) return;

    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        if (!query) {
            displayForms(currentFormType, true);
            return;
        }
        // Filter current form's Pokémon by name, type, or ID
        let keywords = formKeywords[currentFormType];
        let filtered = allPokemon.filter(p =>
            keywords.some(keyword => p.name.includes(keyword))
        );
        filtered = filtered.filter(poke =>
            poke.name.toLowerCase().includes(query) ||
            (allPokemonDetails[poke.name] && (
                allPokemonDetails[poke.name].types.some(t => t.type.name.includes(query)) ||
                allPokemonDetails[poke.name].id.toString() === query
            ))
        );
        currentFiltered = filtered;
        currentPage = 1;
        showFilteredResults(filtered);
    });

    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        displayForms(currentFormType, true);
    });
});

// Helper to show filtered results with pagination
async function showFilteredResults(filtered) {
    container.innerHTML = '';
    const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
    renderPagination(totalPages);

    const showingInfo = document.getElementById('showing-info');
    const start = (currentPage - 1) * CARDS_PER_PAGE + 1;
    const end = Math.min(currentPage * CARDS_PER_PAGE, filtered.length);
    showingInfo.textContent = `Showing ${filtered.length === 0 ? 0 : start}-${end} out of ${filtered.length}`;

    const pageItems = filtered.slice(start - 1, end);

    for (const poke of pageItems) {
        try {
            let data = allPokemonDetails[poke.name];
            if (!data) {
                const res = await fetch(poke.url);
                data = await res.json();
                allPokemonDetails[poke.name] = data;
            }

            const card = document.createElement('div');
            card.className = 'card';

            const img = document.createElement('img');
            img.src = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
            img.alt = data.name;
            card.appendChild(img);

            const idLabel = document.createElement('div');
            idLabel.textContent = `#${data.id}`;
            idLabel.style.fontSize = '0.85em';
            idLabel.style.color = '#888';
            idLabel.style.marginBottom = '2px';
            card.appendChild(idLabel);

            const title = document.createElement('h2');
            title.textContent = beautifyName(data.name);
            card.appendChild(title);

            const typesDiv = document.createElement('div');
            typesDiv.className = 'types';
            data.types.forEach(t => {
                const typeSpan = document.createElement('span');
                typeSpan.className = `type t-${t.type.name}`;
                typeSpan.textContent = t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1);
                typesDiv.appendChild(typeSpan);
            });
            card.appendChild(typesDiv);

            container.appendChild(card);
        } catch (e) {
            console.error(`Error fetching data for ${poke.name}:`, e);
            const errorCard = document.createElement('div');
                  }
    }
}