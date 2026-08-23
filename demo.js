(() => {
  const paper = document.getElementById("demo-paper");
  const toast = document.getElementById("demo-toast");
  const list = document.getElementById("demo-saved");
  if (!paper || !toast || !list) return;

  const saved = new Set();

  function stripWord(raw) {
    return String(raw).replace(/^[^a-zA-Z'-]+|[^a-zA-Z'-]+$/g, "");
  }

  function tokenAtPoint(x, y) {
    const range = document.caretRangeFromPoint?.(x, y);
    if (!range) return null;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;
    if (node.parentElement?.closest(".word")) return null;
    const text = node.textContent ?? "";
    let start = range.startOffset;
    let end = range.startOffset;
    while (start > 0 && /[a-zA-Z'-]/.test(text[start - 1] || "")) start -= 1;
    while (end < text.length && /[a-zA-Z'-]/.test(text[end] || "")) end += 1;
    const word = stripWord(text.slice(start, end));
    if (word.length < 2) return null;
    return { node, start, end, word };
  }

  function wrap({ node, start, end }) {
    const text = node.textContent ?? "";
    const parent = node.parentNode;
    if (!parent) return;
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = text.slice(start, end);
    const after = document.createTextNode(text.slice(end));
    node.textContent = text.slice(0, start);
    parent.insertBefore(span, node.nextSibling);
    parent.insertBefore(after, span.nextSibling);
  }

  paper.addEventListener("dblclick", (event) => {
    event.preventDefault();
    const hit = tokenAtPoint(event.clientX, event.clientY);
    window.getSelection()?.removeAllRanges();
    if (!hit) return;
    const key = hit.word.toLowerCase();
    if (saved.has(key)) {
      toast.textContent = `Already saved · ${hit.word}`;
      toast.classList.add("is-saved");
      return;
    }
    saved.add(key);
    wrap(hit);
    toast.textContent = `Saved · ${hit.word} · 已记为不清楚的词汇`;
    toast.classList.add("is-saved");
    const item = document.createElement("li");
    item.innerHTML = `<strong>${hit.word}</strong><span>不清楚</span>`;
    list.appendChild(item);
    list.hidden = false;
  });
})();
