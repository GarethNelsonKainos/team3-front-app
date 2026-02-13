// public/js/auth.js
// Sync JWT token between cookie and sessionStorage
(() => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (match && match[1]) {
    sessionStorage.setItem("token", match[1]);
  } else {
    sessionStorage.removeItem("token");
  }
})();
