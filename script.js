const darkModeButton = document.querySelector("[data-toggle]");
const finalLineButton = document.querySelector("[data-message]");
const finalLine = document.querySelector(".final-line");
const revealNodes = document.querySelectorAll(".reveal");
const introSequence = document.querySelector("[data-intro]");
const memoryPrints = document.querySelectorAll("[data-memory-print]");

let introDismissed = false;
const memoryTouchStarts = new WeakMap();

const removeIntroListeners = () => {
  window.removeEventListener("wheel", handleIntroGesture);
  window.removeEventListener("touchmove", handleIntroGesture);
  window.removeEventListener("keydown", handleIntroGesture);
};

const completeIntro = () => {
  if (introDismissed) {
    return;
  }

  introDismissed = true;
  removeIntroListeners();
  introSequence?.classList.add("is-exiting");

  window.setTimeout(() => {
    document.body.classList.remove("intro-active");
    introSequence?.classList.add("is-complete");
  }, 760);
};

const handleIntroGesture = (event) => {
  if (event.type === "wheel" && Math.abs(event.deltaY) < 6) {
    return;
  }

  if (event.type === "keydown") {
    const dismissKeys = ["ArrowDown", "PageDown", "Space", "Enter"];

    if (!dismissKeys.includes(event.code) && !dismissKeys.includes(event.key)) {
      return;
    }
  }

  event.preventDefault();
  completeIntro();
};

if (introSequence) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches) {
    completeIntro();
  } else {
    window.addEventListener("wheel", handleIntroGesture, { passive: false });
    window.addEventListener("touchmove", handleIntroGesture, { passive: false });
    window.addEventListener("keydown", handleIntroGesture);
  }
}

const updateMemoryPrint = () => {
  memoryPrints.forEach((memoryPrint) => {
    const { top } = memoryPrint.getBoundingClientRect();
    const triggerPoint = window.innerHeight * 0.72;
    memoryPrint.classList.toggle("is-ready", top < triggerPoint);
  });
};

updateMemoryPrint();
window.addEventListener("scroll", updateMemoryPrint, { passive: true });
window.addEventListener("resize", updateMemoryPrint);

const setMemoryFlip = (memoryPrint, isFlipped) => {
  memoryPrint.classList.toggle("is-flipped", isFlipped);
};

const canControlMemoryPrint = (memoryPrint) => {
  if (!memoryPrint.classList.contains("is-ready")) {
    return false;
  }

  const rect = memoryPrint.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1;
};

const handleMemoryWheel = (memoryPrint, event) => {
  if (!canControlMemoryPrint(memoryPrint)) {
    return;
  }

  const horizontalDelta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;

  if (Math.abs(horizontalDelta) < 12) {
    return;
  }

  event.preventDefault();
  setMemoryFlip(memoryPrint, horizontalDelta > 0);
};

const handleMemoryTouchStart = (memoryPrint, event) => {
  if (!canControlMemoryPrint(memoryPrint)) {
    return;
  }

  memoryTouchStarts.set(memoryPrint, event.touches[0]?.clientX ?? 0);
};

const handleMemoryTouchMove = (memoryPrint, event) => {
  if (!canControlMemoryPrint(memoryPrint)) {
    return;
  }

  const startX = memoryTouchStarts.get(memoryPrint) ?? 0;
  const currentX = event.touches[0]?.clientX ?? startX;
  const deltaX = startX - currentX;

  if (Math.abs(deltaX) < 24) {
    return;
  }

  event.preventDefault();
  setMemoryFlip(memoryPrint, deltaX > 0);
};

const handleMemoryKeydown = (event) => {
  const activeMemoryPrint = Array.from(memoryPrints).find((memoryPrint) =>
    canControlMemoryPrint(memoryPrint)
  );

  if (!activeMemoryPrint) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setMemoryFlip(activeMemoryPrint, true);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setMemoryFlip(activeMemoryPrint, false);
  }
};

memoryPrints.forEach((memoryPrint) => {
  memoryPrint.addEventListener("wheel", (event) => handleMemoryWheel(memoryPrint, event), {
    passive: false,
  });
  memoryPrint.addEventListener(
    "touchstart",
    (event) => handleMemoryTouchStart(memoryPrint, event),
    {
      passive: true,
    }
  );
  memoryPrint.addEventListener(
    "touchmove",
    (event) => handleMemoryTouchMove(memoryPrint, event),
    {
      passive: false,
    }
  );
});

window.addEventListener("keydown", handleMemoryKeydown);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealNodes.forEach((node) => observer.observe(node));

darkModeButton?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkModeButton.textContent = document.body.classList.contains("dark")
    ? "Turn off night mode"
    : "Turn on night mode";
});

finalLineButton?.addEventListener("click", () => {
  finalLine.hidden = false;
  finalLineButton.hidden = true;
});
