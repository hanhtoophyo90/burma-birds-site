// **FIX**: The bird data is now embedded directly in the script.
        // This avoids the 'fetch' error caused by trying to load a local file.
        const allBirds = [
    {
                id: 1,
                name: "Burmese Bushlark",
                scientific_name: "Mirafra microptera",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/203495881/1800",
                photo_credit: "Angadachappa/Macaulay Library",
                description: "An endemic species found in the dry central plains of Burma. It's known for its lark-like appearance and melodious song, often delivered during a flight display.",
                habitat: "Dry scrubland, grasslands, and agricultural areas.",
                conservation_status: "Least Concern"
            },
            {
                id: 2,
                name: "White-browed Nuthatch",
                scientific_name: "Sitta victoriae",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/48774781/1800",
                photo_credit: "James Eaton/Macaulay Library",
                description: "A beautiful and rare bird found only in the Chin Hills of western Burma, primarily on Mount Victoria. It forages on tree trunks and branches, moving with characteristic nuthatch agility.",
                habitat: "Oak and rhododendron forests at high altitudes.",
                conservation_status: "Endangered"
            },
            {
                id: 3,
                name: "Hooded Treepie",
                scientific_name: "Crypsirina cucullata",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/306786611/1800",
                photo_credit: "Thibaud Aronson/Macaulay Library",
                description: "Another endemic species of Burma's central dry zone. It's a striking-looking bird with a velvety black hood, pale grey body, and a long, elegant tail. Often seen in small, noisy groups.",
                habitat: "Open forests, scrub, and cultivated land with scattered trees.",
                conservation_status: "Near Threatened"
            },
            {
                id: 4,
                name: "Green Peafowl",
                scientific_name: "Pavo muticus",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/305869381/1800",
                photo_credit: "Peter Ericsson/Macaulay Library",
                description: "A large and magnificent peafowl, native to Southeast Asia including Burma. It is more brightly colored and slender than its Indian relative. Its loud calls are a distinctive sound of the forest.",
                habitat: "Forest edges, grasslands, and riverine habitats.",
                conservation_status: "Endangered"
            },
            {
                id: 5,
                name: "Jerdon's Minivet",
                scientific_name: "Pericrocotus albifrons",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/203496031/1800",
                photo_credit: "Angadachappa/Macaulay Library",
                description: "A small, slender bird endemic to the central dry zone of Burma. The male has a striking black and white pattern with a distinctive white forehead, while the female is duller.",
                habitat: "Acacia scrub and dry, open country.",
                conservation_status: "Near Threatened"
            },
            {
                id: 6,
                name: "Grey-headed Parakeet",
                scientific_name: "Psittacula finschii",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/48858591/1800",
                photo_credit: "James Eaton/Macaulay Library",
                description: "A medium-sized parakeet with a distinctive grey head, green body, and long tail. It's found in foothill forests across Southeast Asia, including large parts of Burma.",
                habitat: "Broadleaf evergreen and mixed deciduous forests.",
                conservation_status: "Near Threatened"
            },
            {
                id: 7,
                name: "Great Hornbill",
                scientific_name: "Buceros bicornis",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/302812061/1800",
                photo_credit: "Gaurav Budania/Macaulay Library",
                description: "One of the largest hornbills, famous for its impressive yellow and black casque on top of its massive bill. The sound of its powerful wingbeats can be heard from a distance.",
                habitat: "Mature evergreen and moist deciduous forests.",
                conservation_status: "Vulnerable"
            },
            {
                id: 8,
                name: "Ayeyarwady Bulbul",
                scientific_name: "Pycnonotus blanfordi",
                photo_url: "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/333795311/1800",
                photo_credit: "Aung Naing Lin/Macaulay Library",
                description: "A common and familiar bird in Burma, especially along the Irrawaddy River. It's a plain-looking bulbul with subtle streaks and is often found in gardens and urban areas.",
                habitat: "Open woodland, cultivation, scrub, and gardens.",
                conservation_status: "Least Concern"
            },
            {
                id: 9,
                name: "Rufous-necked Hornbill",
                scientific_name: "Aceros nipalensis",
                photo_url: "...",
                photo_credit: "Photographer Name",
                description: "A large hornbill...",
                habitat: "Evergreen forests.",
                conservation_status: "Vulnerable"
            }

];
