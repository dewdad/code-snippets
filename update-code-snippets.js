void function() {
"use strict"

// update snippets from fromdewdad/code-snippets


let_us("execute some init tests", function(){
  if(location.origin !== "chrome-devtools://devtools") throw new Error('Cannot find scriptSnippets, are you running in the secondary DevTools?\n see https://github.com/dewdad/code-snippets#updating-local-code-snippets')
  ok(location.origin === "chrome-devtools://devtools", 'we are in devtools of devtools, good to go')
})


var repo = 'https://raw.githubusercontent.com/dewdad/code-snippets/learning-dom/'
var updated = []
var snippets


/* Main Logic*/
getHostSnippets()
    .then(checkAndUpdate)
    .then(saveToChrome)
    .catch(function(err){throw Error(err)})


/* Helpers */
function getHostSnippets(){
    return new Promise(function (resolve, reject) {      
      InspectorFrontendHost.getPreferences(function(prefs){
          resolve(prefs.scriptSnippets)
      })
    })
}


function checkAndUpdate(snips){
  snippets = JSON.parse(snips)
  var promise_chain = snippets.reduce(chainSnippet, Promise.resolve())
  return promise_chain
}


function saveToChrome(){
    console.log('fetched', updated.length, 'snippets')

      updated.forEach(function (update) {
        var snippet = snippets[update.index]
        console.assert(update.name === snippet.name,
          'name mismatch for update', update, snippet);
        snippet.content = update.content;
      });
      if (updated.length) {
        InspectorFrontendHost.setPreference("scriptSnippets", JSON.stringify(snippets))
        console.table(updated);
        console.log('please reopen DevTools to load updated code snippets');
      } else {
        console.log('nothing to update.');
      }
}


function chainSnippet(chain, snippet, k) {
  return chain.then(function () {
    return updateSnippet(k, snippet.id, snippet.name)
  });
}


function updateSnippet(k, id, filename) {
  return fetch(repo + filename + ".js")
    .then(function (source) {
      console.log('fetched new source for', id, filename)
      updated.push({
        index: k,
        id: id,
        content: source,
        name: filename
      })
      console.log(updated)
    }, function () {
      console.error('cannot find remote for', filename);
    });
}


// read code snippets from this repo via RawGit.com
function fetch(url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText)
      } else {
        reject(request.responseText)
      }
    }

    request.onerror = function (err) {
      reject(err)
    }

    request.send()
  })
}


/* nano test harness 
*/
function let_us(msg,f){console.log(msg); f()}
function ok(expr, msg){ expr? console.log("!pass "+msg) : console.log("?fail"+msg)}
// TODO: remove harness and tests


}('today is a good day')
