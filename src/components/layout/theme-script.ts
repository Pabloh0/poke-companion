/**
 * Runs inline in <head>, before the first paint, so the saved theme is applied
 * without a flash. Must stay tiny, dependency-free ES5 and wrapped in try/catch
 * (localStorage can be blocked). Pattern from the Next.js guide
 * "Preventing flash before hydration".
 */
export const THEME_STORAGE_KEY = "theme";

export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
