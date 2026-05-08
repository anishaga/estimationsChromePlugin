setInterval(function () {
  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = document.querySelectorAll('li[aria-label^="Column "]');

  columns.forEach(function (column) {
    const cardList = column.querySelector('[role="list"]');
    if (!cardList) return; // column not yet in viewport

    // ── Cards ───────────────────────────────────────────────────────────────
    const cards = cardList.querySelectorAll('[role="listitem"]');

    cards.forEach(function (card) {
      const titleEl = card.querySelector('[role="textbox"][aria-label^=" Task "]');
      if (!titleEl) return;

      let cardTitle = titleEl.textContent;
      const regexp = /(\(\s*([^)]+)\s*\)|\[\s*([^\]]+)\s*])/g;
      regexp.lastIndex = 0;
      let matchResult = regexp.exec(cardTitle);
      let extraRowSpans = [];

      let i = 0;
      while (i < 20 && matchResult !== null) {
        if (matchResult.length === 4) {
          let typeContent, matchIndex;
          if (matchResult[2] !== undefined) { typeContent = "label-default"; matchIndex = 2; }
          if (matchResult[3] !== undefined) { typeContent = "label-info";    matchIndex = 3; }

          if (typeContent) {
            const value = parseFloat(matchResult[matchIndex]);
            const span = document.createElement("span");
            span.classList.add("bootstrap-iso");
            span.style.margin = "3px";
            const label = document.createElement("span");
            label.classList.add("label", typeContent);
            if (!isNaN(value)) label.setAttribute("data-value", value.toString());
            label.textContent = matchResult[matchIndex];
            span.appendChild(label);
            extraRowSpans.push(span);

            cardTitle = cardTitle.slice(0, matchResult.index)
                      + cardTitle.slice(matchResult.index + matchResult[matchIndex].length + 2);
          }
        }
        regexp.lastIndex = 0;
        matchResult = regexp.exec(cardTitle);
        ++i;
      }

      if (extraRowSpans.length > 0) {
        // Remove old extraRow if present
        card.querySelector(".extraRow")?.remove();

        const extraRow = document.createElement("div");
        extraRow.classList.add("extraRow");
        extraRow.style.cssText = "margin-top:8px; padding: 0 8px 6px;";
        extraRowSpans.forEach(s => extraRow.appendChild(s));
		const contentWrapper = titleEl.parentElement.parentElement;
		contentWrapper.appendChild(extraRow);


        // ⚠️ Strips the bracketed tokens from the displayed title (DOM only, not saved)
        titleEl.textContent = cardTitle;
      }
    });

    // ── Column sum ───────────────────────────────────────────────────────────
    let sumOriginal = 0, hasOriginal = false;
    let sumRemaining = 0, hasRemaining = false;

    column.querySelectorAll(".extraRow span.label-default").forEach(el => {
      const v = el.getAttribute("data-value");
      if (v) { sumOriginal += parseFloat(v); hasOriginal = true; }
    });
    column.querySelectorAll(".extraRow span.label-info").forEach(el => {
      const v = el.getAttribute("data-value");
      if (v) { sumRemaining += parseFloat(v); hasRemaining = true; }
    });

    sumOriginal  = Math.round(sumOriginal  * 100) / 100;
    sumRemaining = Math.round(sumRemaining * 100) / 100;

    // Remove old plugin badge
    column.querySelector(".colEstimatesPlugin")?.remove();

    if (hasOriginal || hasRemaining) {
      const badge = document.createElement("div");
      badge.classList.add("bootstrap-iso", "colEstimatesPlugin");
      badge.style.cssText = "padding:4px 8px;";

      if (hasOriginal) {
        const el = document.createElement("span");
        el.classList.add("label", "label-default");
        el.style.margin = "3px";
        el.textContent = sumOriginal;
        badge.appendChild(el);
      }
      if (hasRemaining) {
        const el = document.createElement("span");
        el.classList.add("label", "label-info");
        el.style.margin = "3px";
        el.textContent = sumRemaining;
        badge.appendChild(el);
      }

      // Prepend to the column so it appears near the top
      column.insertBefore(badge, column.firstChild);
    }
  });
}, 3000);