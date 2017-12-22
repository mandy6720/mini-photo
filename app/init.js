import App from './app';

var didInit = false;

function init() {
    if (!didInit) {
        var rootElem = document.getElementById("app-root")
        App.init(rootElem);
    }
}

document.addEventListener('DOMContentLoaded', init);
