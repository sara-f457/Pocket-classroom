// js/main.js
// Pocket Classroom — Main entry file
// Purpose: handle navigation (Library / Author / Learn) and basic test render

import { loadIndex, saveCapsule, saveIndex, loadCap } from "./STORAGE.js";
import { setupAuthorPage } from "./author.js";

import { renderLibrary } from "./library.js";

const sections = {
  library: document.getElementById("library-section"),
  author: document.getElementById("author-section"),
  learn: document.getElementById("learn-section"),
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Pocket Classroom started");

  // --- Section references ---

  let flashcardIndex = 0;
  let showingBack = false;

  document.getElementById("import-json").addEventListener("change", (e) => {
    alert("📂 File selected!");
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (data.schema !== "pocket-classroom/v1") {
          alert("❌ Invalid schema.");
          return;
        }

        if (
          !data.title ||
          (!data.notes?.length &&
            !data.flashcards?.length &&
            !data.quiz?.length)
        ) {
          alert("❌ Capsule must have a title and at least one content type.");
          return;
        }

        const newId = Date.now().toString();
        const capsule = {
          ...data,
          id: newId,
          updatedAt: Date.now(),
        };

        saveCapsule(capsule);
        const index = loadIndex();
        index.push({
          id: capsule.id,
          title: capsule.title,
          subject: capsule.subject,
          level: capsule.level,
          updatedAt: capsule.updatedAt,
        });
        saveIndex(index);

        alert("✅ Capsule imported!");
        show("library");
      } catch (err) {
        alert("❌ Failed to import. Invalid JSON.");
      }
    };

    reader.readAsText(file);
  });
});

function show(view) {
  // Hide all sections
  Object.values(sections).forEach((sec) => (sec.hidden = true));

  // Show selected one
  const selected = sections[view];
  if (selected) selected.hidden = false;

  if (view === "library") renderLibrary();

  if (view === "author") setupAuthorPage();
  // Update active button highlight
  document.querySelectorAll("nav button[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
}

// --- Navbar buttons click handling ---
const navButtons = document.querySelectorAll("nav button[data-view]");
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => show(btn.dataset.view));
});

show("library");

export { show };
