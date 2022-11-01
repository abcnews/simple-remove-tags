import { requestDOMPermit } from "@abcnews/env-utils";

if (process.env.NODE_ENV === "development") {
  console.debug(`[simple-remove-tags] public path: ${__webpack_public_path__}`);
  // TODO: Add this back once https://github.com/abcnews/env-utils/pull/26 lands
  // mockDecoyActivationEvents();
}

// Inserts CSS into document.head with a <style> element
const insertCSS = () => {
  const css = ".simple-remove-tags-hidden {display: none !important;}";
  const el = document.createElement("style");
  if (el.styleSheet) {
    el.styleSheet.cssText += css;
  } else {
    el.textContent += css;
  }

  el.setAttribute("type", "text/css");
  el.setAttribute("data-simple-remove-tags", "");
  document.querySelector("head").appendChild(el);
};

// 1. Wait for the document to be ready (including Presentation Layer hydration)
requestDOMPermit("remove").then((els) => {
  if (Array.isArray(els)) {
    insertCSS();
    els.forEach((el) => el.classList.add("simple-remove-tags-hidden"));
  } else {
    console.warn(
      "This version of simple-remove-tags is only compatible with PL rendered pages"
    );
  }
});
