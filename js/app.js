const grid = document.getElementById("grid");
const pagination = document.getElementById("pagination");
const resultsCount = document.getElementById("resultsCount");
const pageSizeSelect = document.getElementById("pageSizeSelect");

let currentPage = 1;
let pageSize = parseInt(pageSizeSelect.value, 10);

function renderPage() {
  const cards = Array.from(grid.querySelectorAll(".card"));
  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (currentPage > totalPages) currentPage = totalPages;

  cards.forEach((card, i) => {
    const visible = i >= (currentPage - 1) * pageSize && i < currentPage * pageSize;
    card.style.display = visible ? "" : "none";
  });

  const start = total ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, total);
  resultsCount.textContent = `Showing ${start}-${end} of ${total}`;

  pagination.innerHTML = "";

  pagination.appendChild(makeNavBtn("Prev", currentPage === 1, () => {
    currentPage--;
    renderPage();
  }));

  const pageList = getPageList(currentPage, totalPages);
  pageList.forEach(p => {
    if (p === "...") {
      const span = document.createElement("span");
      span.className = "ellipsis";
      span.textContent = "...";
      pagination.appendChild(span);
    } else {
      const b = document.createElement("button");
      b.textContent = p;
      b.className = "page";
      if (p === currentPage) b.setAttribute("aria-current", "page");
      b.addEventListener("click", () => { currentPage = p; renderPage(); });
      pagination.appendChild(b);
    }
  });

  pagination.appendChild(makeNavBtn("Next", currentPage === totalPages, () => {
    currentPage++;
    renderPage();
  }));
}

function makeNavBtn(label, disabled, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = "page-nav";
  if (disabled) {
    btn.setAttribute("aria-disabled", "true");
    btn.classList.add("disabled");
  } else {
    btn.addEventListener("click", onClick);
  }
  return btn;
}

function getPageList(current, total) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

pageSizeSelect.addEventListener("change", () => {
  pageSize = parseInt(pageSizeSelect.value, 10);
  currentPage = 1;
  renderPage();
});

window.repaginate = function () {
  currentPage = 1;
  renderPage();
};

renderPage();
