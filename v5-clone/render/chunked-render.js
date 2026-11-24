(() => {
  "use strict";

  let nextListId = 0;

  function renderChunked({ container, items, renderCard, cap = 1500, chunkSize = 100, labels }) {
    if (!Number.isSafeInteger(cap) || cap < 0 ||
        !Number.isSafeInteger(chunkSize) || chunkSize < 1) {
      throw new RangeError("Expected a nonnegative integer cap and a positive integer chunkSize");
    }

    // Button and live-status strings. Defaults are the English strings; the
    // app passes its own locale strings (t()/nf()) via `labels` so the
    // button and the aria-live status read correctly in both languages.
    const L = Object.assign({
      more: "Show more",
      none: "No matches.",
      all: "All matches shown.",
      counts: (shown, remaining) => shown + " shown, " + remaining + " remaining.",
    }, labels || {});

    const doc = container.ownerDocument;
    if (!container.id) {
      let id;
      do {
        id = "chunked-list-" + ++nextListId;
      } while (doc.getElementById(id));
      container.id = id;
    }

    const controls = doc.createElement("div");
    controls.className = "more-row";
    const status = doc.createElement("div");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    controls.append(status);

    const total = items.length;
    let shown = Math.min(total, cap, chunkSize);
    container.innerHTML = items.slice(0, shown).map(renderCard).join("");
    container.after(controls);

    function updateStatus() {
      const remaining = total - shown;
      const counts = L.counts(shown, remaining);
      if (total === 0) {
        status.textContent = L.none + " " + counts;
      } else if (remaining === 0) {
        status.textContent = L.all + " " + counts;
      } else {
        status.textContent = counts;
      }
    }

    updateStatus();
    if (shown < total) {
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.textContent = L.more;
      button.setAttribute("aria-controls", container.id);
      controls.append(button);

      button.addEventListener("click", () => {
        const end = Math.min(total, shown + chunkSize);
        container.insertAdjacentHTML("beforeend", items.slice(shown, end).map(renderCard).join(""));
        shown = end;
        updateStatus();
        if (shown === total) {
          if (doc.activeElement === button) {
            status.tabIndex = -1;
            status.focus();
          }
          button.remove();
        }
      });
    }

    return () => controls.remove();
  }

  // Both classic scripts and side-effect module imports use the same API.
  globalThis.renderChunked = renderChunked;
})();
