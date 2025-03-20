function searchPodcasts() {
  const searchTitle = document.getElementById("search-title").value;
  const resultsDiv = document.getElementById("podcast-list");
  resultsDiv.innerHTML = "<p>Suche läuft...</p>";

  fetchPodcasts(searchTitle);
}

async function fetchPodcasts(title) {
  let url = new URL("https://api.fyyd.de/0.2/search/podcast/");
  url.searchParams.append("title", title);

  console.log("URL:", url.href);

  try {
    const response = await fetch(url);
    const data = await response.json();
    insertSearchResults(data);
  } catch (error) {
    console.log(error);
  }
}
function insertSearchResults(data) {
  const resultsDiv = document.getElementById("podcast-list");
  resultsDiv.innerHTML = "";

  const limitedData = data.data.slice(0, 9);

  for (let podcast of limitedData) {
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
  detailsButton.className = "btn btn-secondary ";
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


async function fetchRecommendedPodcasts() {
  try {
    const response = await fetch(
      "https://api.fyyd.de/0.2/podcast/recommend?podcast_id=22"
    );
    const data = await response.json();
    insertRecommendedPodcasts(data);
  } catch (error) {
    console.error("Error fetching recommended podcasts:", error);
  }
}


function insertRecommendedPodcasts(data) {
  const resultsDiv = document.getElementById("recommended-podcasts");
  resultsDiv.innerHTML = "";

  if (!data || !data.data || data.data.length === 0) {
    resultsDiv.innerHTML = "<p>No recommended podcasts available.</p>";
    return;
  }

  const limitedData = data.data.slice(0, 6);

  for (let podcast of limitedData) {
    const podcastDiv = createPodcastCard(podcast);
    resultsDiv.appendChild(podcastDiv);
  }
}

async function fetchLatestPodcasts() {
  try {
    const response = await fetch("https://api.fyyd.de/0.2/podcast/latest");
    const data = await response.json();
    insertLatestPodcasts(data);
  } catch (error) {
    console.error("Error fetching latest podcasts:", error);
  }
}

function insertLatestPodcasts(data) {
  const resultsDiv = document.getElementById("latest-podcasts");
  resultsDiv.innerHTML = "";

  if (!data || !data.data || data.data.length === 0) {
    resultsDiv.innerHTML = "<p>No latest podcasts available.</p>";
    return;
  }

  const limitedData = data.data.slice(0, 6);

  for (let podcast of limitedData) {
    const podcastDiv = createPodcastCard(podcast);
    resultsDiv.appendChild(podcastDiv);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchRecommendedPodcasts();
  fetchLatestPodcasts();
  document
    .getElementById("search-title")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        searchPodcasts();
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const selectedPodcast = localStorage.getItem("selectedPodcast");
  if (selectedPodcast) {
    const podcast = JSON.parse(selectedPodcast);
    fetchPodcastDetails(podcast.id);
  } else {
    console.error("No podcast data found in localStorage");
    alert("No podcast data found. Please select a podcast from the list.");
  }
});

function fetchPodcastDetails(podcastId) {
  fetch(`https://api.fyyd.de/0.2/podcast/episodes?podcast_id=${podcastId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1) {
        const podcast = data.data;
        episodes = podcast.episodes;
        displayPodcastDetails(podcast);
        displayEpisodes(podcast.episodes);
      } else {
        console.error("Invalid podcast data from API");
      }
    })
    .catch((error) => console.error("Error fetching podcast details:", error));
}

function displayPodcastDetails(podcast) {
  document.getElementById("podcastImage").src =
    podcast.layoutImageURL || "path/to/default/image";
  document.getElementById("podcastTitle").textContent = podcast.title;
  document.getElementById("podcastAuthor").textContent = podcast.author;
  document.getElementById("podcastLanguage").textContent = podcast.language;
  document.getElementById("podcastLastPub").textContent = podcast.lastpub;
  document.getElementById("podcastRank").textContent = podcast.rank;
  document.getElementById("podcastEpisodeCount").textContent =
    podcast.episode_count;
  document.getElementById("podcastDescription").textContent =
    podcast.description;
}

function displayEpisodes(episodes) {
  const episodeList = document.getElementById("episode-list");
  episodeList.innerHTML = "";
  if (Array.isArray(episodes) && episodes.length > 0) {
    episodes.forEach((episode, index) => {
      const listItem = document.createElement("div");
      listItem.className = "list-group-item episode-card";
      listItem.innerHTML = `
              <div>
                  <h5 class="mb-1">${episode.title}</h5>
                  <small>${formatDuration(episode.duration)}</small>
              </div>
              <button class="btn btn-primary btn-sm" onclick="playEpisode(${index})">Play</button>
          `;
      episodeList.appendChild(listItem);
    });
  } else {
    episodeList.innerHTML =
      "<div class='list-group-item'>No episodes available</div>";
    console.error("Invalid episodes data");
  }
}

let audio = new Audio();
let currentEpisode = null;
let episodes = [];
let title = '';
let imgURL = '';

function checkPlayerState() {
  const state = JSON.parse(localStorage.getItem("playerState"));
  if (state) {
    currentEpisode = state.currentEpisode;
    episodes = state.episodes || [];
    audio.src = state.url;
    audio.currentTime = state.currentTime;
    title = state.title;
    imgURL = state.imgURL;
    updatePlayerUI();

    if (state.isPlaying) {
      audio.play();
      updatePlayButtonIcon(true);
    } else {
      updatePlayButtonIcon(false);
    }
  }
}

function updatePlayerUI() {
  document.getElementById("playerImage").src = imgURL || "path/to/default/image";
  document.getElementById("playerTitle").textContent = title;
  document.getElementById("playerAuthor").textContent = '';

  
  const followedEpisodes = JSON.parse(localStorage.getItem('followedEpisodes')) || [];
  const isFollowing = followedEpisodes.some(episode => episode.title === title);

  const followIcon = document.getElementById('followIcon');
  if (isFollowing) {
    followIcon.classList.remove('bi-heart');
    followIcon.classList.add('bi-heart-fill');
  } else {
    followIcon.classList.remove('bi-heart-fill');
    followIcon.classList.add('bi-heart');
  }
}



document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("playButton")) {
    document.getElementById("playButton").addEventListener("click", togglePlay);
    document.getElementById("prevButton").addEventListener("click", playPreviousEpisode);
    document.getElementById("nextButton").addEventListener("click", playNextEpisode);
    document.getElementById("seekBar").addEventListener("input", seekAudio);
    audio.addEventListener("timeupdate", updateSeekBar);
    audio.addEventListener("loadedmetadata", displayTotalTime);

    checkPlayerState();
    updatePlayerUI();
  }

  if (document.body.id === "single-podcast-page") {
    const selectedPodcast = localStorage.getItem("selectedPodcast");
    if (selectedPodcast) {
      const podcast = JSON.parse(selectedPodcast);
      fetchPodcastDetails(podcast.id);
    }
  }
});


function fetchPodcastDetails(podcastId) {
  fetch(`https://api.fyyd.de/0.2/podcast/episodes?podcast_id=${podcastId}`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 1) {
        const podcast = data.data;
        episodes = podcast.episodes;
        displayPodcastDetails(podcast);
        displayEpisodes(podcast.episodes);
      } else {
        console.error("Invalid podcast data from API");
      }
    })
    .catch(error => console.error("Error fetching podcast details:", error));
}

function displayPodcastDetails(podcast) {
  document.getElementById("podcastImage").src = podcast.layoutImageURL || "path/to/default/image";
  document.getElementById("podcastTitle").textContent = podcast.title;
  document.getElementById("podcastAuthor").textContent = podcast.author;
  document.getElementById("podcastLanguage").textContent = podcast.language;
  document.getElementById("podcastLastPub").textContent = podcast.lastpub;
  document.getElementById("podcastRank").textContent = podcast.rank;
  document.getElementById("podcastEpisodeCount").textContent = podcast.episode_count;
  document.getElementById("podcastDescription").textContent = podcast.description;
}

function displayEpisodes(episodes) {
  const episodeList = document.getElementById("episode-list");
  episodeList.innerHTML = "";
  if (Array.isArray(episodes) && episodes.length > 0) {
    episodes.forEach((episode, index) => {
      const listItem = document.createElement("div");
      listItem.className = "list-group-item episode-card";
      listItem.innerHTML =
        `<div>
                <h5 class="mb-1">${episode.title}</h5>
                <small>${formatDuration(episode.duration)}</small>
            </div>
            <button class="btn btn-primary btn-sm" onclick="playEpisode(${index})">Play</button>`;
      episodeList.appendChild(listItem);
    });
  } else {
    episodeList.innerHTML = "<div class='list-group-item'>No episodes available</div>";
    console.error("Invalid episodes data");
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

function playEpisode(index) {
  if (episodes[index]) {
    const episode = episodes[index];
    title = episode.title;
    imgURL = episode.imgURL;
    audio.src = episode.enclosure;
    audio.play();
    currentEpisode = index;
    updatePlayer(episode);
    updatePlayerUI();
    savePlayerState();
  }
}


function togglePlay() {
  if (audio.paused) {
    audio.play();
    updatePlayButtonIcon(true);
  } else {
    audio.pause();
    updatePlayButtonIcon(false);
  }
  savePlayerState();
}

function playPreviousEpisode() {
  if (currentEpisode !== null && currentEpisode > 0) {
    playEpisode(currentEpisode - 1);
  }
}

function playNextEpisode() {
  if (currentEpisode !== null && currentEpisode < episodes.length - 1) {
    playEpisode(currentEpisode + 1);
  }
}

function updatePlayer(episode) {
  document.getElementById("playerImage").src = episode.imgURL || "path/to/default/image";
  const truncatedTitle = episode.title.length > 120 ? episode.title.substring(0, 60) + "..." : episode.title;
  document.getElementById("playerTitle").textContent = truncatedTitle;
  document.getElementById("playerAuthor").textContent = episode.author;
}


function updatePlayButtonIcon(isPlaying) {
  const playButton = document.getElementById("playButton");
  if (isPlaying) {
    playButton.innerHTML = '<i class="bi bi-pause-circle-fill"></i>';
  } else {
    playButton.innerHTML = '<i class="bi bi-play-circle-fill"></i>';
  }
}

function savePlayerState() {
  const state = {
    currentEpisode,
    currentTime: audio.currentTime,
    isPlaying: !audio.paused,
    url: audio.src,
    title,
    imgURL,
    episodes
  };
  localStorage.setItem("playerState", JSON.stringify(state));
}

function seekAudio(event) {
  const seekTime = (audio.duration * event.target.value) / 100;
  audio.currentTime = seekTime;
  savePlayerState();
}

function updateSeekBar() {
  const seekBar = document.getElementById("seekBar");
  const currentTimeDisplay = document.getElementById("currentTime");
  const value = (audio.currentTime / audio.duration) * 100 || 0;
  seekBar.value = value;
  currentTimeDisplay.textContent = formatDuration(Math.floor(audio.currentTime));
}

function displayTotalTime() {
  const totalTimeDisplay = document.getElementById("totalTime");
  totalTimeDisplay.textContent = formatDuration(Math.floor(audio.duration));
}

document.getElementById('followButton').addEventListener('click', function () {
  const isFollowing = toggleFollow();

  if (isFollowing) {
    addEpisodeToFollowed();
  } else {
    removeEpisodeFromFollowed();
  }
});

function toggleFollow() {
  const followIcon = document.getElementById('followIcon');
  const isFollowing = followIcon.classList.contains('bi-heart-fill');

  if (isFollowing) {
    followIcon.classList.remove('bi-heart-fill');
    followIcon.classList.add('bi-heart');
  } else {
    followIcon.classList.remove('bi-heart');
    followIcon.classList.add('bi-heart-fill');
  }

  const playerTitle = document.getElementById('playerTitle').textContent;
  let followedEpisodes = JSON.parse(localStorage.getItem('followedEpisodes')) || [];
  
  if (isFollowing) {
    followedEpisodes = followedEpisodes.filter(episode => episode.title !== playerTitle);
  } else {
    followedEpisodes.push({
      title: playerTitle,
      author: document.getElementById('playerAuthor').textContent,
      image: document.getElementById('playerImage').src
    });
  }

  localStorage.setItem('followedEpisodes', JSON.stringify(followedEpisodes));

  displayFollowedEpisodes();

  return !isFollowing;
}

document.addEventListener("DOMContentLoaded", function () {
  displayFollowedEpisodes();
});

function displayFollowedEpisodes() {
  const followedEpisodesContainer = document.getElementById("followed-episodes");
  const followedEpisodes = JSON.parse(localStorage.getItem("followedEpisodes")) || [];

  followedEpisodesContainer.innerHTML = ""; 

  if (followedEpisodes.length === 0) {
    followedEpisodesContainer.innerHTML = "<p class='text-center'>No followed episodes yet.</p>";
    return;
  }

  followedEpisodes.forEach(episode => {
    const episodeCard = createFollowedEpisodeCard(episode);
    followedEpisodesContainer.appendChild(episodeCard);
  });
}

function createFollowedEpisodeCard(episode) {
  const episodeDiv = document.createElement("div");
  episodeDiv.className = "col-md-4 followed-episode-item mb-4";

  const cardDiv = document.createElement("div");
  cardDiv.className = "card";

  const episodeImage = document.createElement("img");
  episodeImage.className = "card-img-top";
  episodeImage.src = episode.image || "path/to/default/image";
  episodeImage.alt = episode.title + " image";

  const cardBodyDiv = document.createElement("div");
  cardBodyDiv.className = "card-body";

  const titleH5 = document.createElement("h5");
  titleH5.className = "card-title";
  titleH5.textContent = episode.title;

  const authorP = document.createElement("p");
  authorP.className = "card-text";
  authorP.textContent = "Author: " + episode.author;

  const heartButton = document.createElement("button");
  heartButton.className = "btn btn-danger mt-2";
  heartButton.innerHTML = "&#10084;";

  heartButton.addEventListener("click", function () {
    removeFollowedEpisode(episode.title);
  });

  cardBodyDiv.appendChild(titleH5);
  cardBodyDiv.appendChild(authorP);
  cardBodyDiv.appendChild(heartButton); 

  cardDiv.appendChild(episodeImage);
  cardDiv.appendChild(cardBodyDiv);

  episodeDiv.appendChild(cardDiv);

  return episodeDiv;
}

function removeFollowedEpisode(title) {
  let followedEpisodes = JSON.parse(localStorage.getItem("followedEpisodes")) || [];

  followedEpisodes = followedEpisodes.filter(episode => episode.title !== title);

  localStorage.setItem("followedEpisodes", JSON.stringify(followedEpisodes));

  displayFollowedEpisodes();
}

