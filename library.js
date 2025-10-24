import { loadIndex, loadCap, saveIndex } from "./STORAGE.js";
import { addFlashcardRow, addQuizBlock } from "./author.js";
import { setupLearnView } from "./learn.js";
import { show } from "./main.js";

function renderLibrary() {
  const grid = document.getElementById("capsules-grid");
  grid.innerHTML = "";

  const index = loadIndex() || [];
  if (index.length === 0) {
    grid.innerHTML = `
        <p >No capsules yet. Create one in the Author tab.</p>
      `;
    return;
  }

  index.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "col-12 ";

    const progress =
      JSON.parse(localStorage.getItem(`pc_progress_${entry.id}`)) || {};
    const bestScore = progress.bestScore || 0;
    const knownCount = progress.knownFlashcards?.length || 0;

    card.innerHTML = `
                <div class="card  capsule-card shadow-md mb-3 border-1 bg-black text-light">
          <div class="card-body">
            <h5 class="card-title">${entry.title}</h5>
            <p class="card-text mb-2">
              ${entry.subject} • ${entry.level}
            </p>
           <small class="text-light">
  Updated: ${new Date(entry.updatedAt).toLocaleDateString()}<br>
  Quiz Best Score: ${bestScore}%<br>
  Known Cards: ${knownCount}
</small>


            <div class="mt-2 d-flex  justify-content-end">
              <button class="btn btn-sm  me-2 btn-style">Learn</button>
              <button class="btn btn-sm  btn-outline-success me-2">Edit</button>
              <button class="btn btn-sm btn-outline-light me-2">Export</button>
              <button class="btn btn-sm btn-outline-danger">Delete</button>
            </div>
          </div>
        </div>
      `;

    grid.appendChild(card);

    // Learn button

    card.querySelector(".btn-style").onclick = () => {
      const capsule = loadCap(entry.id);
      if (!capsule) return alert("Capsule not found.");
      show("learn");
      setupLearnView(capsule);
    };

    // Edit button

    card.querySelector(".btn-outline-success").onclick = () => {
      const capsule = loadCap(entry.id);
      if (!capsule) return alert("Capsule not found.");

      show("author");
      document.getElementById("cap-id").value = capsule.id;
      // Prefill form fields
      document.getElementById("cap-title").value = capsule.title;
      document.getElementById("cap-subject").value = capsule.subject;
      document.getElementById("cap-level").value = capsule.level;
      document.getElementById("cap-desc").value = capsule.description;
      document.getElementById("cap-notes").value = capsule.notes.join("\n");

      // Clear and refill flashcards
      document.getElementById("flashcardsEditor").innerHTML = "";
      capsule.flashcards.forEach((fc) => addFlashcardRow(fc.front, fc.back));

      // Clear and refill quiz
      document.getElementById("quizEditor").innerHTML = "";
      capsule.quiz.forEach((q) =>
        addQuizBlock(q.question, q.choices, q.answer, q.explanation)
      );

      console.log("capsule.level =", capsule.level);
      console.log("capsule.subject =", capsule.subject);
      console.log("capsule.title =", capsule.title);
    };

    // Export button

    card.querySelector(".btn-outline-light").onclick = () => {
      const capsule = loadCap(entry.id);
      if (!capsule) return alert("Capsule not found.");

      // Add schema field for export
      const exportData = {
        schema: "pocket-classroom/v1",
        ...capsule,
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });

      const link = document.createElement("a");
      const safeTitle = capsule.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `${safeTitle || "capsule"}.json`;
      link.href = URL.createObjectURL(blob);
      link.click();

      URL.revokeObjectURL(link.href);
    };

    // Delete button
    card.querySelector(".btn-outline-danger").onclick = () => {
      localStorage.removeItem(`pc_capsule_${entry.id}`);
      const index = loadIndex().filter((c) => c.id !== entry.id);
      saveIndex(index);
      renderLibrary(); // Refresh view
    };
  });
}

export { renderLibrary };
