let fuse; // holds our search engine
let timer;

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  let httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        let data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send();
}

// ==========================================
// load our search index, only executed once
// on DOMContentLoaded
//
const SearchOpt = { // fuse.js options; check fuse.js website for details
  shouldSort: true,
  distance: 10000,
  minMatchCharLength: 2,
  keys: [
    {
      name: 'title',
      weight: 2.5,
    },
    {
      name: 'content',
      weight: 1.5,
    },
    {
      name: 'permalink',
      weight: 1.0,
    },
  ]
};

const loadSearch = () => {
  fetchJSONFile('/search/index.json', (data) => {
    fuse = new Fuse(data, SearchOpt); // build the index from the json file
  });
}

// ==========================================
// a search query (for "term") letters are 
// typed in the search box.
const executeSearch = (term) => {
  let trimKeyword = term.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  let keywordList = trimKeyword.split(/\s+/);
  let searchPattern = keywordList.join(" | "); // multiple words search
  let highLightTitle = '';
  let highLightContent = '';

  let results = fuse.search(searchPattern); // the actual query being run using fuse.js
  let searchitems = []; // our results bucket

  let noResults = document.getElementById('search-no-result'); // Did we get any search results?

  const maininput = document.getElementById('search-input'); // input box for search

  const constructKeyword = (key) => '<em class="search-keyword">' + key + "</em>";

  if (results.length === 0 && maininput.value.length > 1) { // no results based on what was typed into the input box
    noResults.style.display = 'block';
    searchitems = [];
  }
  else { // build our html 
    for (let index in results.slice(0, 10)) { // only show first 10 results
      let regS = new RegExp(keywordList.join('|'), "gi");
      let item = results[index].item

      highLightContent = item.content.replace(regS, constructKeyword);
      highLightTitle = item.title.replace(regS, constructKeyword);

      const seachObject =
        '<li><a href="' + results[index].item.permalink +
        '" class="search-result-title">' + highLightTitle +
        '</a><p class="search-result">' + highLightContent +
        '</p></li>';
      searchitems.push(seachObject)
    }
    noResults.style.display = 'none';
  }

  document.getElementById("search-result-list").innerHTML = searchitems.join('');
}

// ==========================================
// execute search after 300ms typed
//
document.getElementById("search-input").oninput = function (e) {
  if (timer) {
    clearTimeout(timer)
    console.log('clear')
  }
  let searchWords = this.value
  timer = setTimeout(() => {
    executeSearch(searchWords)
  }, 300)
}
document.getElementById("search-input").onkeydown = function (e) {
  if (e.key == 'Enter') { return false; }
}

window.addEventListener("DOMContentLoaded", () => {
  loadSearch()
})
