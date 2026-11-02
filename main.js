const themeToggle = document.querySelector(".theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeKey = "watsapsap-theme";

function storedTheme() {
  try {
    const saved = localStorage.getItem(themeKey);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch (error) {
    return null;
  }
}

function applyTheme(theme, persist) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  if (themeMeta) themeMeta.content = theme === "dark" ? "#07111e" : "#f4f6fa";
  if (!persist) return;
  try {
    localStorage.setItem(themeKey, theme);
  } catch (error) {}
}

applyTheme(storedTheme() || (document.documentElement.dataset.theme === "dark" ? "dark" : "light"), false);

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next, true);
});

window.addEventListener("pageshow", () => {
  const saved = storedTheme();
  if (saved) applyTheme(saved, false);
});

window.addEventListener("storage", (event) => {
  if (event.key === themeKey && (event.newValue === "light" || event.newValue === "dark")) {
    applyTheme(event.newValue, false);
  }
});

const nav = document.querySelector("#site-nav");
const toggle = document.querySelector(".nav-toggle");
const header = document.querySelector(".site-header");

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
}

toggle.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) setMenu(false);
});

const links = [...nav.querySelectorAll('a[href^="#"]')];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateCurrentSection() {
  const line = header.offsetHeight + 32;
  let current = null;
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= line) current = section;
  });
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  if (atBottom) current = sections[sections.length - 1];
  links.forEach((link) => {
    if (current && link.getAttribute("href") === `#${current.id}`) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

const toTop = document.querySelector(".to-top");

function updateToTop() {
  toTop.hidden = window.scrollY < window.innerHeight * 0.45;
}

window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("is-stuck", window.scrollY > 8);
    updateCurrentSection();
    updateToTop();
  },
  { passive: true },
);
updateCurrentSection();
updateToTop();
window.addEventListener("pageshow", updateToTop);

toTop.addEventListener("click", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  document.querySelector(".brand").focus({ preventScroll: true });
});

const form = document.querySelector("#contact-form");
const success = document.querySelector("#form-success");
const subjectNote = document.querySelector("#subject-note");
const subjectInput = document.querySelector("#subject");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");

const fields = [
  {
    input: nameInput,
    error: document.querySelector("#name-error"),
    message: "Add your name so we know who to reply to.",
    valid: (value) => value.trim().length > 0,
  },
  {
    input: emailInput,
    error: document.querySelector("#email-error"),
    message: "Add an email address we can reply to.",
    valid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  },
  {
    input: subjectInput,
    error: document.querySelector("#subject-error"),
    message: "Tell us what you need, or choose a service above.",
    valid: (value) => value.trim().length > 0,
  },
];

function showError(field, show) {
  field.error.hidden = !show;
  field.error.textContent = show ? field.message : "";
  field.input.setAttribute("aria-invalid", show ? "true" : "false");
  if (show) {
    field.input.setAttribute("aria-describedby", field.error.id);
  } else {
    field.input.removeAttribute("aria-describedby");
  }
}

fields.forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.input.getAttribute("aria-invalid") === "true") {
      showError(field, !field.valid(field.input.value));
    }
  });
});

function openForm() {
  form.hidden = false;
  success.hidden = true;
}

document.querySelectorAll("[data-subject]").forEach((button) => {
  button.addEventListener("click", () => {
    openForm();
    subjectInput.value = button.dataset.subject;
    showError(fields[2], false);
    subjectNote.hidden = false;
    subjectNote.textContent = `Subject set to “${button.dataset.subject}”. Change it if that is not quite right.`;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("#contact").scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
    });
    window.setTimeout(() => subjectInput.focus(), reduce ? 0 : 350);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let firstInvalid = null;
  fields.forEach((field) => {
    const ok = field.valid(field.input.value);
    showError(field, !ok);
    if (!ok && !firstInvalid) firstInvalid = field.input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const body = [
    `Name: ${nameInput.value.trim()}`,
    `Email: ${emailInput.value.trim()}`,
    "",
    messageInput.value.trim() || "(No message added)",
  ].join("\n");

  const mailto = `mailto:info@watsapsap.com?subject=${encodeURIComponent(
    subjectInput.value.trim(),
  )}&body=${encodeURIComponent(body)}`;

  form.hidden = true;
  success.hidden = false;
  document.querySelector("#edit-message").focus();
  window.location.href = mailto;
});

document.querySelector("#edit-message").addEventListener("click", () => {
  openForm();
  nameInput.focus();
});

document.querySelectorAll(".bento-card").forEach((card) => {
  const toggle = card.querySelector(".bento-toggle");
  const reveal = card.querySelector(".bento-reveal");

  const syncReveal = () => {
    const open =
      card.classList.contains("is-open") ||
      card.matches(":hover") ||
      card.matches(":focus-within");
    reveal.inert = !open;
  };

  syncReveal();
  toggle.addEventListener("click", () => {
    const open = !card.classList.contains("is-open");
    card.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    syncReveal();
  });
  card.addEventListener("pointerenter", syncReveal);
  card.addEventListener("pointerleave", syncReveal);
  card.addEventListener("focusin", syncReveal);
  card.addEventListener("focusout", () => window.setTimeout(syncReveal, 0));
});

const miniPage = document.querySelector("#mini-page");
const miniResult = document.querySelector("#mini-result");
document.querySelectorAll("[data-device]").forEach((button) => {
  button.addEventListener("click", () => {
    const phone = button.dataset.device === "phone";
    miniPage.classList.toggle("is-phone", phone);
    document.querySelectorAll("[data-device]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    miniResult.textContent = phone
      ? "The same page, stacked for a phone. The booking action stays easy to reach."
      : "The same page, laid out for a wide screen.";
  });
});

const miniChat = document.querySelector("#mini-chat");
const miniQuestion = document.querySelector("#mini-question");

function answerServicePreview(question) {
  const text = question.toLowerCase();
  let reply = "This preview only knows one sample enquiry. Ask for a draft reply, or what to automate.";
  if (text.includes("reply") || text.includes("draft")) {
    reply = "Thanks for writing. We can visit on Thursday and will send a price the same day.";
  } else if (text.includes("automat") || text.includes("what")) {
    reply = "The first reply. Most enquiries ask the same three questions, and a draft can answer them.";
  }
  miniChat.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.textContent = reply;
  miniChat.append(paragraph);
}

document.querySelectorAll("[data-ai]").forEach((button) => {
  button.addEventListener("click", () => {
    miniQuestion.value = button.dataset.ai;
    answerServicePreview(button.dataset.ai);
  });
});

document.querySelector("#mini-ask").addEventListener("submit", (event) => {
  event.preventDefault();
  const question = miniQuestion.value.trim();
  if (!question) {
    miniQuestion.focus();
    return;
  }
  answerServicePreview(question);
});

const flowCopy = {
  now: "Enquiries arrive by phone, email and paper. Nothing sits in one place.",
  simplify: "One form, one list, and one person responsible for the reply.",
  handover: "The team runs it. We stay for the first month and fix defects for free.",
};

document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-step]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#flow-result").textContent = flowCopy[button.dataset.step];
  });
});

const archCopy = {
  site: "The public site. Enquiries start here, then pass to the tools you already use.",
  shop: "Orders from the site land in the shop, not in a shared inbox.",
  mail: "A new enquiry can join the mailing list when the customer asks.",
  diary: "A booking on the site takes a free slot in the diary.",
};

document.querySelectorAll("[data-node]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-node]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#arch-result").textContent = archCopy[button.dataset.node];
  });
});

const featuredWork = [
  {
    id: "tectum",
    name: "Tectum Ecobau",
    src: "assets/tectum.jpg",
    width: 1600,
    height: 822,
    alt: "Tectum Ecobau website shown on a desktop, laptop, tablet and phone",
  },
  {
    id: "virtus",
    name: "Virtus Respiratory Research",
    src: "assets/virtus.jpg",
    width: 1600,
    height: 811,
    alt: "Virtus Respiratory Research website shown across desktop and mobile screens",
  },
  {
    id: "leithaus",
    name: "Leithaus",
    src: "assets/leithaus.jpg",
    width: 1600,
    height: 884,
    alt: "Leithaus website shown across desktop and mobile screens",
  },
  {
    id: "america",
    name: "C& America Latina",
    src: "assets/america.jpg",
    width: 1400,
    height: 909,
    alt: "C and America Latina website shown on a desktop, laptop, tablet and phone",
  },
];

const shot = document.querySelector(".hero-shot");
const shotImg = shot.querySelector("img");
const shotTitle = shot.querySelector(".hero-shot-title");
let featuredIndex = Math.max(
  0,
  featuredWork.findIndex((project) => shot.getAttribute("href") === `#${project.id}`),
);
let featuredBusy = false;

function showFeatured(next) {
  const project = featuredWork[next];
  featuredIndex = next;
  shot.href = `#${project.id}`;
  shotImg.src = project.src;
  shotImg.width = project.width;
  shotImg.height = project.height;
  shotImg.alt = project.alt;
  shotTitle.textContent = `View ${project.name}`;
}

function randomOtherFeature() {
  let next = featuredIndex;
  while (next === featuredIndex) {
    next = Math.floor(Math.random() * featuredWork.length);
  }
  return next;
}

function rotateFeatured() {
  if (
    featuredBusy ||
    document.hidden ||
    shot.matches(":hover") ||
    shot.matches(":focus-within")
  ) {
    return;
  }

  featuredBusy = true;
  const next = randomOtherFeature();
  const incoming = new Image();
  let started = false;
  let revealed = false;

  const reveal = (event) => {
    if (revealed) return;
    if (event && event.propertyName && event.propertyName !== "opacity") return;
    revealed = true;
    shotImg.removeEventListener("transitionend", reveal);
    showFeatured(next);
    shotImg.classList.remove("is-fading");
    featuredBusy = false;
  };

  const fade = () => {
    if (started) return;
    started = true;
    shotImg.classList.add("is-fading");
    shotImg.addEventListener("transitionend", reveal);
    window.setTimeout(reveal, 700);
  };

  incoming.addEventListener("load", fade, { once: true });
  incoming.addEventListener("error", fade, { once: true });
  incoming.src = featuredWork[next].src;
  if (incoming.complete) fade();
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
showFeatured(Math.floor(Math.random() * featuredWork.length));

if (!reduceMotion) {
  window.setInterval(rotateFeatured, 6000);
}
