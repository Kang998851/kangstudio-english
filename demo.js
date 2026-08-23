(() => {
  const paper = document.getElementById("demo-paper");
  const toast = document.getElementById("demo-toast");
  const list = document.getElementById("demo-saved");
  const prefsEl = document.getElementById("demo-prefs");
  const chromeLabel = document.getElementById("demo-chrome-label");
  if (!paper || !toast || !list) return;

  const GLOSS = {
    unusual: "不寻常的",
    speed: "速度",
    arguing: "主张",
    inflation: "通货膨胀",
    loosened: "放松",
    grip: "掌控",
    analysts: "分析师",
    decision: "决定",
    unprecedented: "前所未有的",
    peacetime: "和平时期",
    households: "家庭；住户",
    delay: "延迟",
    policy: "政策",
    prices: "价格",
    statement: "陈述",
    captures: "体现",
    attitude: "态度",
    toward: "对于",
    banks: "银行",
    central: "中央的",
    moved: "采取行动",
    week: "一周",
    feel: "感受到",
    between: "之间",
    author: "作者",
    which: "哪一项",
    best: "最好地",
  };

  const prefs = { instant: false, after: true };
  const saved = [];

  function stripWord(raw) {
    return String(raw).replace(/^[^a-zA-Z'-]+|[^a-zA-Z'-]+$/g, "");
  }

  function gloss(word) {
    return GLOSS[word.toLowerCase()] || "中文释义";
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

  function renderList() {
    list.innerHTML = "";
    if (!saved.length) {
      list.hidden = true;
      return;
    }
    saved.forEach((word) => {
      const item = document.createElement("li");
      const tag = prefs.after ? gloss(word) : "生词";
      item.innerHTML = `<strong>${word}</strong><span>${tag}</span>`;
      list.appendChild(item);
    });
    list.hidden = false;
  }

  function syncChrome() {
    if (chromeLabel) {
      chromeLabel.textContent = prefs.instant
        ? "Exam · Double-click to translate"
        : "Exam · Double-click any word";
    }
    toast.textContent = prefs.instant
      ? "双击单词会马上弹出中文，并记进生词。"
      : "在这段英文上双击任意单词，会记进生词。";
    toast.classList.remove("is-saved");
  }

  prefsEl?.querySelectorAll("[data-pref]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-pref");
      if (key !== "instant" && key !== "after") return;
      prefs[key] = !prefs[key];
      btn.classList.toggle("is-on", prefs[key]);
      btn.setAttribute("aria-pressed", String(prefs[key]));
      renderList();
      syncChrome();
    });
  });

  paper.addEventListener("dblclick", (event) => {
    event.preventDefault();
    const hit = tokenAtPoint(event.clientX, event.clientY);
    window.getSelection()?.removeAllRanges();
    if (!hit) return;
    const key = hit.word.toLowerCase();
    if (saved.some((w) => w.toLowerCase() === key)) {
      toast.textContent = prefs.instant
        ? `${hit.word} · ${gloss(hit.word)}`
        : `已经记过 · ${hit.word}`;
      toast.classList.add("is-saved");
      return;
    }
    saved.push(hit.word);
    wrap(hit);
    toast.textContent = prefs.instant
      ? `${hit.word} · ${gloss(hit.word)}`
      : `已记下 · ${hit.word}`;
    toast.classList.add("is-saved");
    renderList();
  });
})();
