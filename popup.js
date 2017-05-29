(function loadJQuery() {
    chrome.tabs.executeScript({
        file: 'js/jquery.js'
    });
})();

(function loadSocket() {
    chrome.tabs.executeScript({
        file: 'js/socket.js'
    });
})();

function trade() {
    chrome.tabs.executeScript({
        file: 'trade.js'
    });
}


function kill() {
    console.log("heydddd");

    // chrome.runtime.getBackgroundPage(function (result) {
    //     console.log("heydd");
    //     alert(result.document.getElementById('kill'));
    //     // alert(result.getElementById('trade').value);
    // });
    // chrome.runtime.getBackgroundPage(getStuff);

    chrome.tabs.executeScript({
        file: 'kill.js'
    });
}

document.getElementById('trade').addEventListener('click', trade);
document.getElementById('kill').addEventListener('click', kill);


// function getStuff(result) {
//     // console.log($('#crypto option:selected').text());
//     console.log($('#crypto'));
//     console.log("hey");
// }
