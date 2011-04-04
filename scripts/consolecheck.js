// if console is not available -> mock it to prevent errors
try {
    var c = console;
}
catch (e) {
    console = {};
    console.log = function () { };
    console.debug = function () { };
    console.warn = function () { };
    console.error = function () { };
    console.dir = function () { };
}