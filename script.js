// --- APPLICATION LOGIC ---

        // Get references to the DOM elements we'll be working with
const birdGrid = document.getElementById('bird-grid');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');

/**
         * Renders the bird cards to the page based on the provided data array.
         * @param {Array} birds - An array of bird objects to display.
         */
function renderBirds(birds) {
    // Show or hide the "No Results" message based on if the birds array is empty.
    noResults.classList.toggle('hidden', birds.length > 0);

            // **Efficiency Improvement**:
            // Instead of using innerHTML += in a loop, we build an array of HTML strings
            // and then join them together at the end. This is much faster because the browser
            // only has to update the DOM once.
            const gridHTML = birds.map(bird => `
                <div class="card-container h-96">
                    <div class="card w-full h-full rounded-lg shadow-lg bg-white overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300">
                        <!-- Card Front -->
                        <div class="card-face">
                            <img src="${bird.photo_url}" alt="Photo of ${bird.name}" class="w-full h-48 object-cover" 
                                 onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/4a5568?text=Image+Not+Available';">
                            <div class="p-4 flex-grow flex flex-col">
                                <h2 class="text-xl font-bold text-emerald-600">${bird.name}</h2>
                                <p class="text-sm text-gray-500 italic mb-2">${bird.scientific_name}</p>
                                <p class="text-gray-700 text-sm flex-grow">${bird.description}</p>
                                <p class="text-xs text-gray-400 mt-2">Photo: ${bird.photo_credit}</p>
                            </div>
                        </div>
                        <!-- Card Back -->
                        <div class="card-face card-back w-full h-full bg-emerald-700 text-white p-6 flex flex-col justify-center items-center text-center rounded-lg">
                            <h3 class="text-2xl font-bold">${bird.name}</h3>
                            <div class="mt-4">
                                <p class="font-semibold">Habitat:</p>
                                <p>${bird.habitat}</p>
                            </div>
                            <div class="mt-4">
                                <p class="font-semibold">Conservation Status:</p>
                                <span class="mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold ${getConservationStatusColor(bird.conservation_status)}">
                                    ${bird.conservation_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            birdGrid.innerHTML = gridHTML;
            
            // Add event listeners to the new cards for the flip effect.
            // This needs to be done *after* the cards are added to the DOM.
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('click', () => {
                    card.classList.toggle('is-flipped');
                });
            });
        }
        
        /**
         * Returns a Tailwind CSS class string for styling the conservation status badge.
         * @param {string} status - The conservation status string.
         * @returns {string} - The corresponding CSS classes.
         */
        function getConservationStatusColor(status) {
            switch (status) {
                case 'Endangered':
                    return 'bg-red-500 text-white';
                case 'Vulnerable':
                    return 'bg-orange-500 text-white';
                case 'Near Threatened':
                    return 'bg-yellow-400 text-gray-800';
                case 'Least Concern':
                    return 'bg-green-500 text-white';
                default:
                    return 'bg-gray-400 text-white';
            }
        }

        /**
         * Filters the birds based on the search input and re-renders the grid.
         */
        function handleSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const filteredBirds = allBirds.filter(bird => 
                bird.name.toLowerCase().includes(searchTerm) || 
                bird.scientific_name.toLowerCase().includes(searchTerm)
            );
            renderBirds(filteredBirds);
        }

        // --- INITIALIZATION ---
        // Add an event listener to the search input that calls handleSearch on every keystroke.
        searchInput.addEventListener('input', handleSearch);

        // Since the data is now local, we can render it immediately on page load.
        window.onload = () => {
            renderBirds(allBirds);
        };
