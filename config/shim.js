global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

window.URL.createObjectURL = function() {
  return "objectURL";
};
