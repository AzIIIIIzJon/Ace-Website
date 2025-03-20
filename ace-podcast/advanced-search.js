function searchAdvancedPodcasts() {
    const searchTitle = document.getElementById("search-title").value;
    const searchUrl = document.getElementById("search-url").value;
    const searchTerm = document.getElementById("search-term").value;
    const searchLanguage = document.getElementById("search-langauge").value;

    document.getElementById("status-message").textContent = "";

    const resultsDiv = document.getElementById("podcast-list");
    resultsDiv.innerHTML = "<p>Suche läuft...</p>";

    fetchAdvancedPodcasts(searchTitle, searchUrl, searchTerm, searchLanguage);
}
async function fetchAdvancedPodcasts(title, url, term, language) {

    let apiUrl = new URL("https://api.fyyd.de/0.2/search/podcast/");
    apiUrl.searchParams.append("title", title);
    apiUrl.searchParams.append("url", url);
    apiUrl.searchParams.append("term", term);
    apiUrl.searchParams.append("language", language);

    console.log("URL:", apiUrl.href);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        insertAdvancedSearchResults(data);
    } catch (error) {
        console.log(error);
    }
}

function insertAdvancedSearchResults(data) {
    const resultsDiv = document.getElementById("podcast-list");
    resultsDiv.innerHTML = "";

    for (let podcast of data.data) {
        const podcastDiv = createPodcastCard(podcast);
        resultsDiv.appendChild(podcastDiv);
    }
}

function createPodcastCard(podcast) {
    const podcastDiv = document.createElement("div");
    podcastDiv.className = "col-md-4 podcast-item mb-4";

    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    const podcastImage = document.createElement("img");
    podcastImage.className = "card-img-top";
    podcastImage.src = podcast.layoutImageURL || "path/to/default/image";
    podcastImage.alt = podcast.title + " image";

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";

    const titleH5 = document.createElement("h5");
    titleH5.className = "card-title";
    titleH5.textContent = podcast.title;

    const descriptionP = document.createElement("p");
    descriptionP.className = "card-text";
    const maxLength = 300;
    descriptionP.textContent =
        podcast.description.substring(0, maxLength) + "...";

    const detailsButton = document.createElement("a");
    detailsButton.className = "btn btn-secondary";
    detailsButton.textContent = "Details";
    detailsButton.href = "#";

    detailsButton.addEventListener("click", function () {
        localStorage.setItem("selectedPodcast", JSON.stringify(podcast));
        window.location.href = "single-podcast.html";
    });

    cardBodyDiv.appendChild(titleH5);
    cardBodyDiv.appendChild(descriptionP);
    cardBodyDiv.appendChild(detailsButton);

    cardDiv.appendChild(podcastImage);
    cardDiv.appendChild(cardBodyDiv);

    podcastDiv.appendChild(cardDiv);

    return podcastDiv;
}

document.addEventListener("DOMContentLoaded", function () {
    
    const searchInputs = document.querySelectorAll("#search-title, #search-url, #search-term, #search-langauge");

    searchInputs.forEach(function (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                searchAdvancedPodcasts();
            }
        });
    });
}); 
