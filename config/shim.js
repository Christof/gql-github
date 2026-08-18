global.requestAnimationFrame = function (callback) {
  setTimeout(callback, 0);
};

window.URL.createObjectURL = function () {
  return "objectURL";
};

// setImmediate is not propagated to the jsdom global in jest@27+
if (typeof setImmediate === "undefined") {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
  global.clearImmediate = clearTimeout;
}

// react-router-dom v7 requires TextEncoder/TextDecoder in the jsdom environment
const { TextEncoder, TextDecoder } = require("util");
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}
