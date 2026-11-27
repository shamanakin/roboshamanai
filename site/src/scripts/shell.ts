const root = document.documentElement;
if (root.dataset.shell !== "on") {
  root.dataset.shell = "on";

  const calmButtons = () => [...document.querySelectorAll<HTMLButtonElement>("[data-calm]")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function paintCalm(on: boolean) {
    root.classList.toggle("calm", on);
    if (on) root.classList.add("resolved");
    for (const button of calmButtons()) button.setAttribute("aria-pressed", on ? "true" : "false");
    try {
      localStorage.setItem("calm", on ? "1" : "0");
    } catch {
      /* private mode */
    }
  }

  paintCalm(root.classList.contains("calm"));

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("[data-calm]");
    if (!button) return;
    const next = !root.classList.contains("calm");
    if (reduced) {
      paintCalm(next);
      return;
    }
    button.classList.add("glitch");
    window.setTimeout(() => button.classList.remove("glitch"), 150);
    if (next) window.setTimeout(() => paintCalm(true), 120);
    else paintCalm(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const card = target.closest<HTMLElement>("[data-vt]");
    if (!card || reduced || root.classList.contains("calm")) return;
    for (const el of document.querySelectorAll<HTMLElement>("[data-vt]")) {
      el.style.viewTransitionName = "";
    }
    card.style.viewTransitionName = "open-card";
  });

  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("[data-copy]");
    if (!button) return;
    const id = button.getAttribute("data-copy");
    const node = id ? document.getElementById(id) : null;
    const text = node?.textContent?.trim() ?? "";
    if (!text) return;
    const previous = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
    } catch {
      const range = document.createRange();
      if (!node) return;
      range.selectNodeContents(node);
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      button.textContent = "Selected";
    }
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1400);
  });

  const filters = document.querySelector<HTMLElement>("[data-filters]");
  const grid = document.querySelector<HTMLElement>("[data-filter-grid]");
  if (filters && grid) {
    const buttons = [...filters.querySelectorAll<HTMLButtonElement>("[data-key]")];
    const cards = [...grid.querySelectorAll<HTMLElement>("[data-state], [data-tier]")];
    const status = document.querySelector<HTMLElement>("#filter-status");
    const empty = document.querySelector<HTMLElement>("[data-empty]");
    const keys = [...new Set(buttons.map((b) => b.dataset.key || ""))].filter(Boolean);
    const selected: Record<string, string> = {};
    const params = new URLSearchParams(location.search);
    for (const key of keys) selected[key] = params.get(key) || "all";

    const apply = () => {
      let shown = 0;
      for (const card of cards) {
        const match = keys.every((key) => selected[key] === "all" || card.dataset[key] === selected[key]);
        card.hidden = !match;
        if (match) shown += 1;
      }
      for (const button of buttons) {
        button.setAttribute("aria-pressed", button.dataset.value === selected[button.dataset.key || ""] ? "true" : "false");
      }
      if (status) status.textContent = `Showing ${shown} of ${cards.length}`;
      if (empty) empty.hidden = shown !== 0;
      const url = new URL(location.href);
      for (const key of keys) {
        if (selected[key] === "all") url.searchParams.delete(key);
        else url.searchParams.set(key, selected[key]);
      }
      history.replaceState(null, "", url);
    };

    filters.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const key = target.dataset.key;
      const value = target.dataset.value;
      if (!key || !value) return;
      selected[key] = value;
      if (!reduced) {
        target.classList.add("glitch");
        window.setTimeout(() => target.classList.remove("glitch"), 150);
      }
      apply();
    });
    apply();
  }

  const palette = document.getElementById("palette");
  const panel = document.getElementById("palette-panel");
  const input = document.getElementById("palette-input") as HTMLInputElement | null;
  const list = document.getElementById("palette-list");
  const site = document.getElementById("site");
  const openButton = document.getElementById("search-open");
  if (palette && panel && input && list && site && openButton) {
    let items: SearchItem[] = [];
    let loaded = false;
    let active = 0;
    let lastFocus: HTMLElement | null = null;

    interface SearchItem {
      title: string;
      summary: string;
      group: string;
      kicker: string;
      href: string;
      agent: string;
      draft: boolean;
    }

    const mode = () => document.body.dataset.mode || "human";
    const options = () => [...list.querySelectorAll<HTMLAnchorElement>("[role='option']")];

    function hrefFor(item: SearchItem) {
      return mode() === "agent" ? item.agent : item.href;
    }

    function paint(query: string) {
      const q = query.trim().toLowerCase();
      const matches = items.filter((item) => {
        if (!q) return true;
        return `${item.title} ${item.summary} ${item.kicker} ${item.group}`.toLowerCase().includes(q);
      });
      list.replaceChildren();
      let lastGroup = "";
      matches.slice(0, 24).forEach((item, index) => {
        if (item.group !== lastGroup) {
          lastGroup = item.group;
          const group = document.createElement("li");
          group.className = "palette-group mono";
          group.setAttribute("role", "presentation");
          group.textContent = item.group;
          list.append(group);
        }
        const row = document.createElement("li");
        row.setAttribute("role", "presentation");
        const link = document.createElement("a");
        link.className = "palette-item";
        link.id = `opt-${index}`;
        link.href = hrefFor(item);
        link.setAttribute("role", "option");
        link.tabIndex = -1;
        const title = document.createElement("span");
        title.textContent = item.title;
        const kicker = document.createElement("span");
        kicker.className = "mono muted";
        kicker.textContent = item.kicker;
        link.append(title, kicker);
        row.append(link);
        list.append(row);
      });
      if (matches.length === 0) {
        const none = document.createElement("li");
        none.className = "palette-group";
        none.textContent = "No matches";
        list.append(none);
      }
      active = 0;
      markActive();
    }

    function markActive() {
      const opts = options();
      opts.forEach((opt, index) => opt.classList.toggle("is-active", index === active));
      const current = opts[active];
      input.setAttribute("aria-activedescendant", current?.id || "");
      current?.scrollIntoView({ block: "nearest" });
    }

    async function openPalette() {
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      palette.hidden = false;
      site.inert = true;
      root.classList.add("palette-open");
      input.value = "";
      input.focus();
      if (!loaded) {
        const response = await fetch("/search-index.json");
        items = (await response.json()) as SearchItem[];
        loaded = true;
      }
      paint("");
    }

    function closePalette() {
      palette.hidden = true;
      site.inert = false;
      root.classList.remove("palette-open");
      input.setAttribute("aria-activedescendant", "");
      lastFocus?.focus();
    }

    openButton.addEventListener("click", () => {
      if (palette.hidden) void openPalette();
      else closePalette();
    });
    palette.querySelector(".palette-backdrop")?.addEventListener("click", closePalette);
    input.addEventListener("input", () => paint(input.value));
    input.addEventListener("keydown", (event) => {
      const opts = options();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        active = Math.min(opts.length - 1, active + 1);
        markActive();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        active = Math.max(0, active - 1);
        markActive();
      } else if (event.key === "Enter") {
        event.preventDefault();
        opts[active]?.click();
      } else if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      }
    });
    addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (palette.hidden) void openPalette();
        else closePalette();
      } else if (event.key === "Escape" && !palette.hidden) {
        closePalette();
      }
    });
  }
}
