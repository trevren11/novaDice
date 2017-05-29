function trade() {
  chrome.tabs.executeScript({
    file: 'trade.js'
  }); 
}

function kill() {
  chrome.tabs.executeScript({
    file: 'kill.js'
  }); 
}

document.getElementById('trade').addEventListener('click', trade);
document.getElementById('kill').addEventListener('click', kill);