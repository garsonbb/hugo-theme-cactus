var fuse; // holds our search engine
var list = document.getElementById('search-result-list'); // targets the <ul>
var maininput = document.getElementById('search-input'); // input box for search
var noResults = document.getElementById('search-no-result'); // Did we get any search results?

loadSearch();

// ==========================================
// execute search as each character is typed
//
document.getElementById("search-input").oninput = function (e) {
  executeSearch(this.value);
}
document.getElementById("search-input").onkeydown = function (e) {
  if (e.key == 'Enter') { return false; }
}

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
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
// on 
//
function loadSearch() {
  fetchJSONFile('/search/index.json', function (data) {
    let options = { // fuse.js options; check fuse.js website for details
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
    fuse = new Fuse(data, options); // build the index from the json file
  });
}

// ==========================================
// using the index we loaded on CMD-/, run 
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
  let trimKeyword = term.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  let keywordList = trimKeyword.split(/\s+/);
  let searchPattern = keywordList.join(" | "); // multiple words search
  let highLightTitle = '';
  let highLightContent = '';

  let results = fuse.search(searchPattern); // the actual query being run using fuse.js
  let searchitems = ''; // our results bucket

  if (results.length === 0 && maininput.value.length > 1) { // no results based on what was typed into the input box
    noResults.style.display = 'block';
    searchitems = '';
  } else { // build our html 
    for (let index in results.slice(0, 10)) { // only show first 10 results
      let regS = new RegExp(keywordList.join('|'), "gi");
      highLightContent = results[index].item.content.replace(regS, function (keyword) {
        return '<em class="search-keyword">' + keyword + "</em>";
      });
      highLightTitle = results[index].item.title.replace(regS, function (keyword) {
        return '<em class="search-keyword">' + keyword + "</em>";
      });
      searchitems = searchitems + '<li><a href="' + results[index].item.permalink + '" class="search-result-title">' + highLightTitle + '</a><p class="search-result">' + highLightContent + '</p></li>';
    }
    noResults.style.display = 'none';
  }

  document.getElementById("search-result-list").innerHTML = searchitems;
}