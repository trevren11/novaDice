//alert('hello ' + document.location.href);
var keepGoing = 1;
(function wait() {
    if (keepGoing == 1) {
        setTimeout(function () {
            wait();
        }, 2000)
    }
})();
