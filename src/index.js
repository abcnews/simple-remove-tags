import { whenDOMReady } from "@abcnews/env-utils";
import { ensureBlockMount, exactMountSelector } from "@abcnews/mount-utils";

// Inserts CSS into document.head with a <style> element
const insertCSS = css => {
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

// Repeats a string a number of times (concatenated)
const repeatString = (string, times) => {
  let repeatedString = "";

  while (times > 0) {
    repeatedString += string;
    times--;
  }

  return repeatedString;
};

// 1. Wait for the document to be ready (including Presentation Layer hydration)
whenDOMReady.then(() => {
  // 2. Grab references to all #remove/#end remove mount points
  const openingMounts = [
    ...document.querySelectorAll(exactMountSelector("remove"))
  ];
  const closingMounts = [
    ...document.querySelectorAll(exactMountSelector("endremove"))
  ];

  // 3. Determine the largest number of elements between each pair of opening
  // and closing mount points (or remaining elements after an unclosed opener)
  const maxElementsBetweenMounts = openingMounts.reduce((max, openingMount) => {
    let numElementsBetweenMounts = 0;
    let nextElement = openingMount;

    while (
      ((nextElement = nextElement.nextElementSibling),
      nextElement !== null && closingMounts.indexOf(nextElement) === -1)
    ) {
      numElementsBetweenMounts++;
    }

    return Math.max(max, numElementsBetweenMounts);
  }, 0);

  // 4. Convert any a[id] & a[name] mounts to div[id][data-mount]
  [...openingMounts, ...closingMounts].forEach(ensureBlockMount);

  // 5. Create and insert a stylesheet that hides the mount points, and all
  // elements between, by adding enough sibling selectors to account for the
  // largest number between:
  //
  //   <style>
  //     #remove[data-mount],
  //     #remove[data-mount] + :not(#endremove),
  //     #remove[data-mount] + :not(#endremove) + :not(#endremove),
  //     ...,
  //     #endremove[data-mount] {
  //       display: none;
  //     }
  //   </style>
  //
  insertCSS(
    [...Array(maxElementsBetweenMounts + 1).keys()]
      .map(i => `#remove[data-mount]${repeatString(" + :not(#endremove)", +i)}`)
      .concat("#endremove[data-mount] { display: none !important }")
      .join()
  );
});
