// Keep summary aria-expanded aligned with details.open.
// ToggleEvent.newState is the committed state. details.open can still be the previous value while the event runs.

export function detailsIsOpen(details, event) {
  const state = event && typeof event.newState === "string" ? event.newState : "";
  if (state === "open" || state === "closed") return state === "open";
  return Boolean(details && details.open);
}

export function syncDetailsExpanded(details) {
  const summary = details?.querySelector?.("summary");
  if (!summary) return;
  const value = details.open ? "true" : "false";
  if (summary.getAttribute("aria-expanded") !== value) summary.setAttribute("aria-expanded", value);
}

export function bindDetailsExpanded(details) {
  if (!details) return () => {};
  const onToggle = (event) => {
    const summary = details.querySelector("summary");
    if (!summary) return;
    const open = detailsIsOpen(details, event);
    summary.setAttribute("aria-expanded", open ? "true" : "false");
  };
  details.addEventListener("toggle", onToggle);
  syncDetailsExpanded(details);
  return () => details.removeEventListener("toggle", onToggle);
}
