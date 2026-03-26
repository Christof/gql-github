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
