
var state={
  allEpisodes:[] ,
  searchTerm: "",
  allShows: [],
  showsCache:{}

};
const endpoint ="https://api.tvmaze.com/shows"
const fetchShows = async () => {
  const loadingElem = document.getElementById("loading");
  loadingElem.style.display = "block";
  try {
    const response = await fetch(endpoint);
    const shows = await response.json();
    //console.log(fetchShows)
    state.allShows = shows.sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )
  populateShowsDropdown(state.allShows);

  const firstShowId = state.allShows[0].id;
  await fetchEpisodes(firstShowId); 
  } catch (error) {
    loadingElem.innerText = "Error loading shows. " + error;

  } finally {
    loadingElem.style.display = "none";
  }


}
const fetchEpisodes = async (showId) => {
  const loadingElem = document.getElementById("loading");
  loadingElem.style.display = "block"; // Show loading
  try {
    if (state.showsCache[showId]) {
      state.allEpisodes = state.showsCache[showId]
    } else {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    const episodes = await response.json();
    state.allEpisodes = episodes;
    state.showsCache[showId] = episodes;
    }
    setup(); // Only run setup *after* data is ready
  } catch (error) {
    loadingElem.innerText = "Error fetching data. Please try again later."+ error;
  }
  finally {
    loadingElem.style.display = "none"; // Hide loading
  }
};

function setup() {
  render(state.allEpisodes);
  populateDropdown(state.allEpisodes);
  setupDropdown(state.allEpisodes);
  setupSearch(state.allEpisodes);
 
}
const template = document.querySelector("template");
const searchInput = document.getElementById("search-box");
const episodeSelect = document.getElementById("episode-select");
const showSelect = document.getElementById("shows-dropdown")

const countResult = document.getElementById("result-count")


const createEpisodeCard = (episode) => {
  const clone = template.content.cloneNode(true);

  // Setting the h3 text content to the episode name
  clone.querySelector("h3").textContent = `${episode.name} \n S${episode.season.toString().padStart(2, 0)}E${episode.number.toString().padStart(2, 0)}`;

  // Setting the description text content to the episode summary
  clone.querySelector("p").textContent = episode.summary.replace(/<\/?p>/g, "");

  // Setting the image src to the episode image
  const img = clone.querySelector("img");
  img.src = episode.image.medium;
  img.alt = episode.name;
  img.classList.add("episode-image");

  return clone;
};


const rootElem = document.getElementById("root");

function render(episodeList) {
  rootElem.textContent = ""; // Clear previous content before adding new episodes

  const filmCards = episodeList.map(createEpisodeCard); // Create all episode cards first

  rootElem.append(...filmCards); // Append all episode cards at once
  countResult.textContent = howManyEpisodes(episodeList); // Update the count of episodes found
}


 function setupSearch(allEpisodes) {
   searchInput.addEventListener("input", () => {
     const query = searchInput.value.toLowerCase();
     const searchTerm= state.searchTerm = query; // Update the state with the search term
     const filteredEpisodes = state.allEpisodes.filter(ep =>
       ep.name.toLowerCase().includes(searchTerm) || ep.summary.toLowerCase().includes(searchTerm) 
       || ep.season.toString().includes(searchTerm) || ep.number.toString().includes(searchTerm)
     );

    render(filteredEpisodes);
   });
}


function populateDropdown(episodes) {
  episodeSelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Episodes";
  episodeSelect.appendChild(allOption);


  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `S${ep.season.toString().padStart(2, '0')}E${ep.number.toString().padStart(2, '0')} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });
}


function setupDropdown(allEpisodes) {
  episodeSelect.onchange = () => {
    const selectedId = episodeSelect.value;
    if (selectedId === "all") {
      render(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.find(ep => ep.id.toString() === selectedId);
      render([selectedEpisode]);
    }
    searchInput.value = ""; // Clear search input when dropdown is used
  };
}

function howManyEpisodes(episodes) {
  return episodes.length===0? `No episode was found` : episodes.length === 1
    ? `${episodes.length} episode was found`
    : `${episodes.length} episodes found`;
 }

 function populateShowsDropdown(shows){
  showSelect.innerHTML = "";

  shows.forEach(show =>{
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);

  })

  showSelect.addEventListener("change", async () => {
  const selectedShowId = showSelect.value;
  searchInput.value = "";
  episodeSelect.innerHTML = "";
  await fetchEpisodes(selectedShowId);
  
  });


  
 }

window.onload = fetchShows;
