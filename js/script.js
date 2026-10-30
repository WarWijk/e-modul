
// Untuk Sidebar di HP

const openBtn = document.getElementById('open-sidebar-btn')
const navbar = document.getElementById('navbar')

function openSidebar() {
  navbar.classList.add('show')
  openBtn.setAttribute('aria-expanded', 'true')
}

function closeSidebar() {
  navbar.classList.remove('show')
  openBtn.setAttribute('aria-expanded', 'false')
}

// Bagian login

function gantiForm(id) {
  document.querySelectorAll('.form-cont').forEach(formCont => formCont.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// BAGIAN DRAG AND DROP

const draggableElements = document.querySelectorAll(".draggable");
const homePositions = new Map();
const completionTimers = new WeakMap();
const launchButtons = new WeakMap();

draggableElements.forEach((element) => {
  const homeParent = element.parentElement;
  const homeLeft = element.style.left;
  const homeTop = element.style.top;
  homePositions.set(element, { homeParent, homeLeft, homeTop });

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragLeft = 0;
  let dragTop = 0;

  const restoreHome = () => {
    const home = homePositions.get(element);
    if (!home) return;

    home.homeParent.append(element);
    element.style.position = "";
    element.style.left = home.homeLeft;
    element.style.top = home.homeTop;
    element.style.width = "";
    element.style.height = "";
    element.style.zIndex = "";
    element.style.pointerEvents = "";
  };

  element.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;

    const rect = element.getBoundingClientRect();
    event.preventDefault();
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragLeft = rect.left;
    dragTop = rect.top;
    element.setPointerCapture(pointerId);

    element.style.position = "fixed";
    element.style.left = `${dragLeft}px`;
    element.style.top = `${dragTop}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.zIndex = "1000";
    element.style.pointerEvents = "none";
  });

  element.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;

    dragLeft += event.clientX - startX;
    dragTop += event.clientY - startY;
    element.style.left = `${dragLeft}px`;
    element.style.top = `${dragTop}px`;
    startX = event.clientX;
    startY = event.clientY;
  });

  const finishDrag = (event, shouldPlace) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;

    const slot = shouldPlace
      ? document.elementFromPoint(event.clientX, event.clientY)?.closest(".answer-box")
      : null;
    const game = element.closest(".game-cont");
    const existingCard = slot?.querySelector(".draggable");

    if (
      slot &&
      game &&
      slot.closest(".game-cont") === game &&
      (!existingCard || existingCard === element)
    ) {
      slot.append(element);
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.width = "";
      element.style.height = "";
      element.style.zIndex = "";
      element.style.pointerEvents = "";
    } else {
      restoreHome();
    }

    updateGameResult(game);
  };

  element.addEventListener("pointerup", (event) => finishDrag(event, true));
  element.addEventListener("pointercancel", (event) => finishDrag(event, false));
  element.addEventListener("lostpointercapture", (event) => finishDrag(event, false));
});

function updateGameResult(game) {
  if (!game) return;
  const result = game.querySelector(".game-result");
  const slots = game.querySelectorAll(".answer-box[data-match]");
  if (!result || slots.length === 0) return;

  const allCorrect = [...slots].every((slot) => {
    const card = slot.querySelector(".draggable[data-match]");
    return card && card.dataset.match === slot.dataset.match;
  });

  if (!allCorrect) {
    result.textContent = "Belum tepat, coba lagi.";
    result.classList.remove("is-success");
    return;
  }

  if (game.dataset.completed === "true") return;

  game.dataset.completed = "true";
  result.textContent = "Selamat, Anda berhasil!";
  result.classList.add("is-success");
  completionTimers.set(game, setTimeout(() => closeGame(game), 2000));
}

function resetGame(game) {
  const timer = completionTimers.get(game);
  if (timer) clearTimeout(timer);
  completionTimers.delete(game);
  delete game.dataset.completed;

  game.querySelectorAll(".draggable").forEach((item) => {
    const home = homePositions.get(item);
    if (!home) return;

    home.homeParent.append(item);
    item.style.position = "";
    item.style.left = home.homeLeft;
    item.style.top = home.homeTop;
    item.style.width = "";
    item.style.height = "";
    item.style.zIndex = "";
    item.style.pointerEvents = "";
  });

  const result = game.querySelector(".game-result");
  if (result) {
    result.textContent = "";
    result.classList.remove("is-success");
  }
}

function openGame(game, button) {
  resetGame(game);
  game.querySelectorAll(".draggable").forEach((item) => item.classList.add("active"));
  launchButtons.set(game, button);
  game.hidden = false;
  document.body.classList.add("game-open");
  game.querySelector(".game-close")?.focus();
}

function closeGame(game) {
  resetGame(game);
  game.querySelectorAll(".draggable").forEach((item) => item.classList.remove("active"));
  game.hidden = true;
  document.body.classList.remove("game-open");
  launchButtons.get(game)?.focus({ preventScroll: true });
}

document.querySelectorAll("[data-open-game]").forEach((button) => {
  button.addEventListener("click", () => {
    const game = document.getElementById(button.dataset.openGame);
    if (game) openGame(game, button);
  });
});

document.querySelectorAll(".game-cont").forEach((game) => {
  game.querySelector(".game-close")?.addEventListener("click", () => closeGame(game));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openGameDialog = document.querySelector(".game-cont:not([hidden])");
  if (openGameDialog) closeGame(openGameDialog);
});

document.querySelectorAll(".game-session").forEach((session) => {
  session.addEventListener("click", (event) => {
    const button = event.target instanceof Element
      ? event.target.closest("[data-action]")
      : null;
    if (!button) return;

    const action = button.dataset.action;
    const game = session.closest(".game-cont");
    if (!game) return;

    if (action === "reset") {
      resetGame(game);
      game.querySelectorAll(".draggable").forEach((item) => item.classList.add("active"));
    }
  });
});