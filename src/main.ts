import "./styles/main.scss";
import { emailAddress } from "./data/projects";
import { initFooterEyes } from "./dots/footerEyes";
import { initHeroPortrait } from "./dots/heroPortrait";
// import { initPersonas } from "./dots/personas"; // TODO: revisit at another time; consider for phase 2.
import { initIlluminate } from "./motion/illuminate";
import { initNav } from "./motion/nav";
import { initSmoothScroll } from "./motion/scroll";
// import { bindVolumeControl, playSfx } from "./audio/sfx"; // TODO: to revisit sound effects during phase 2.

function initEmailCopy() {
  const button = document.querySelector<HTMLButtonElement>("[data-email]");
  if (!button) return;
  const original = button.textContent ?? emailAddress;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      button.textContent = "Copied";
      // TODO: to revisit sound effects during phase 2.
      // void playSfx("cheer");
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      button.textContent = emailAddress;
    }
  });
}

function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

initSmoothScroll();
initNav();
initIlluminate();
initEmailCopy();
initAnchorScroll();

// TODO: to revisit sound effects during phase 2.
// const volume = document.querySelector<HTMLButtonElement>("[data-volume]");
// if (volume) bindVolumeControl(volume);

initHeroPortrait();
// TODO: revisit at another time; consider for phase 2.
// void initPersonas();
void initFooterEyes();
