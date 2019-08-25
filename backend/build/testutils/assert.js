"use strict";
exports.__esModule = true;
function assert(expression) {
    if (!expression) {
        throw 'Expression does not evaluate to true.';
    }
}
exports.assert = assert;
function assertThrows(code) {
    try {
        code();
    }
    catch (e) {
        return;
    }
    throw 'Expected exception not thrown.';
}
exports.assertThrows = assertThrows;
assertThrows(function () {
    throw Error('TEST ERROR');
});
assert(true === true);
