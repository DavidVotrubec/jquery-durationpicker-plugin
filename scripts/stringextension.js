/*****************************************************************************************************************************/
/**
JS trim implementation
(Not implemented in IE, but already in FF & Chrome)
taken from http://blog.stevenlevithan.com/archives/faster-trim-javascript
*/

if (String.trim == undefined) {
    String.prototype.trim = function () {
        var str = this.replace(/^\s\s*/, ''),
		    ws = /\s/,
		    i = str.length;
        while (ws.test(str.charAt(--i)));
        return str.slice(0, i + 1);
    }
}

String.prototype.replaceAll = function (a, b) { return this.replace(new RegExp(a, 'g'), b) };

/*****************************************************************************************************************************/
/**
JS StringBuffer implementation
*/

function StringBuffer(/*optional string*/str) {
    this.buffer = [];
    if (str != undefined) this.buffer.push(str);
}
StringBuffer.prototype.append = function append(string) {
    this.buffer.push(string);
    return this;
};
StringBuffer.prototype.toString = function toString() {
    return this.buffer.join("");
};