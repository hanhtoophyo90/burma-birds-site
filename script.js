const birdGrid = document.getElementById('bird-grid');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');

function renderBirds(birds) {
    birdGrid.innerHTML = '';
    if (birds.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
    birds.forEach(bird => {
        const cardHTML = `
            <div class="card-container">
                <div class="card w-full h-full rounded-lg shadow-lg bg-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <img src="${bird.photo_url}" alt="${bird.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h2 class="text-xl font-bold text-emerald-600">${bird.name}</h2>
                        <p class="text-sm text-gray-500 italic mb-2">${bird.scientific_name}</p>
                        <p class="text-gray-700 text-sm">${bird.description}</p>
                        <p class="text-sm text-gray-600 mt-2"><strong>Habitat:</strong> ${bird.habitat}</p>
                        <p class="text-sm mt-1"><strong>Status:</strong> ${bird.conservation_status}</p>
                        <div class="text-xs text-gray-400 mt-1">Photo by ${bird.photo_credit}</div>
                    </div>
                </div>
            </div>`;
        birdGrid.innerHTML += cardHTML;
    });
}

function handleSearch() {
    const term = searchInput.value.toLowerCase();
    const filtered = birdData.filter(bird =>
        bird.name.toLowerCase().includes(term) ||
        bird.scientific_name.toLowerCase().includes(term)
    );
    renderBirds(filtered);
}

searchInput.addEventListener('input', handleSearch);
window.onload = () => renderBirds(birdData);