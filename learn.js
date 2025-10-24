function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
  );
}
let raw = localStorage.getItem("capsuleData");
let capsule;

try {
  capsule = JSON.parse(raw);
  if (!capsule || typeof capsule !== "object") throw new Error();
} catch {
  capsule = {
    title: "Untitled",
    subject: "Unknown",
    level: "N/A",
    description: "",
    notes: [],
    flashcards: [],
    quiz: [],
    id: "default",
  };
}

// setupLearnView(capsule);

export function setupLearnView(capsule) {
  console.log("DEBUG capsule:", capsule);
  console.log("Has notes?", capsule.notes);
  console.log("Has quiz?", capsule.quiz);
  capsule.notes = Array.isArray(capsule.notes) ? capsule.notes : [];

  const learnSection = document.getElementById("learn-section");
  learnSection.innerHTML = `
  <h2>${capsule.title}</h2>
  <p><strong>Subject:</strong> ${capsule.subject}</p>
  <p><strong>Level:</strong> ${capsule.level}</p>
  <p>${capsule.description}</p>
  <hr>

  <div id="learn-tabs" class="mb-3">
    <button class="btn btn-outline-secondary btn-sm me-2" data-tab="notes">Notes</button>
    <button class="btn btn-outline-secondary btn-sm me-2" data-tab="flashcards">Flashcards</button>
    <button class="btn btn-outline-secondary btn-sm me-2" data-tab="quiz">Quiz</button>
  </div>

  <div id="learn-notes" hidden>
  <input type="text" class="form-control mb-3" id="notesSearch" placeholder="Search notes..."aria-label="Search notes">
  <ol id="notesList">
  ${capsule.notes.map((n) => `<li>${escapeHTML(n)}</li>`).join("")}
</ol>
</div>



  <div id="learn-flashcard" hidden></div>
  <div id="quiz-container" hidden></div>
`;

  // const flashcard = document.querySelector(".flashcard");
  // if (flashcard) {
  //   flashcard.onclick = () => flashcard.classList.toggle("flipped");
  // }
  const learnTabs = document.querySelectorAll("#learn-tabs button");
  const learnViews = {
    notes: document.getElementById("learn-notes"),
    flashcards: document.getElementById("learn-flashcard"),
    quiz: document.getElementById("quiz-container"),
  };

  learnTabs.forEach((btn) => {
    btn.onclick = () => {
      const tab = btn.dataset.tab;
      Object.values(learnViews).forEach((el) => (el.hidden = true));
      learnViews[tab].hidden = false;
      // ✅ Render content when tab is shown
      if (tab === "flashcards") renderFlashcard();
      if (tab === "quiz") renderQuiz();

      // Optional: highlight active tab
      learnTabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  const notesSearch = document.getElementById("notesSearch");
  const notesList = document.getElementById("notesList");

  notesSearch.oninput = () => {
    const query = notesSearch.value.toLowerCase();
    const lis = notesList.querySelectorAll("li");

    capsule.notes.forEach((note, i) => {
      const li = lis[i];
      if (note.toLowerCase().includes(query) && query !== "") {
        li.style.backgroundColor = "#808683ff"; // light green
      } else {
        li.style.backgroundColor = ""; // reset
      }
    });
  };

  // learnViews.flashcards.hidden = false;

  let flashcardIndex = 0;
  let showingBack = false;

  function renderFlashcard() {
    const fc = capsule.flashcards[flashcardIndex];
    const flashcardDiv = document.getElementById("learn-flashcard");

    if (!fc) {
      flashcardDiv.innerHTML = "<p>No flashcards available.</p>";
      return;
    }

    flashcardDiv.innerHTML = `
    <div class="card p-4 mb-3 text-light position-relative shadow-sm">
      <div class="position-absolute top-0 end-0 p-2 text-light small">
        <strong>${flashcardIndex + 1}-${capsule.flashcards.length}</strong>
      </div>
      <div class="flip-wrapper ${showingBack ? "flipped" : ""} mb-5">
    <div class="flip-inner mb-5">
      <div class="flip-front">
        <p class="mb-5 text-center"><strong>Front:</strong><br>${escapeHTML(
          fc.front
        )}</p>
      </div>
      <div class="flip-back">
        <p class="mb-5 text-center"><strong>Back:</strong><br>${escapeHTML(
          fc.back
        )}</p>
      </div>
    </div>
  </div>

  </div>

      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-outline-primary btn-sm" id="flipFlashcard">Flip</button>
        <button class="btn btn-outline-secondary btn-sm" id="prevFlashcard">Previous</button>
        <button class="btn btn-outline-secondary btn-sm" id="nextFlashcard">Next</button>
      </div>

  `;

    document.getElementById("prevFlashcard").onclick = () => {
      if (flashcardIndex > 0) {
        flashcardIndex--;
        showingBack = false;
        renderFlashcard();
      }
    };

    document.getElementById("nextFlashcard").onclick = () => {
      if (flashcardIndex < capsule.flashcards.length - 1) {
        flashcardIndex++;
        showingBack = false;
        renderFlashcard();
      }
    };

    document.getElementById("flipFlashcard").onclick = () => {
      console.log("Flip clicked");
      showingBack = !showingBack;
      renderFlashcard();
    };
  }

  function renderQuiz() {
    let correctAnswers = 0;
    let answeredQuestions = new Set();
    const quizDiv = document.getElementById("quiz-container");

    if (!capsule.quiz || capsule.quiz.length === 0) {
      quizDiv.innerHTML = "<p>No quiz available.</p>";
      return;
    }

    quizDiv.innerHTML = capsule.quiz
      .map((q, i) => {
        return `
        <div class="card p-5 mb-3 text-light bg-dark">
          <p><strong>Q${i + 1}:</strong> ${q.question}</p>
          <ul class="list-unstyled">
            ${q.choices
              .map(
                (choice, j) => `
              <li>
                <button class="btn btn-outline-light btn-sm mb-1" data-index="${j}" data-q="${i}">
                  ${choice}
                </button>
              </li>
               `
              )
              .join("")}
          </ul>
          <div class="quiz-feedback" id="quiz-feedback-${i}"></div>
        </div>
      `;
      })
      .join("");

    capsule.quiz.forEach((q, i) => {
      q.choices.forEach((_, j) => {
        const btn = quizDiv.querySelector(
          `button[data-q="${i}"][data-index="${j}"]`
        );
        btn.onclick = () => {
          const feedback = document.getElementById(`quiz-feedback-${i}`);
          if (answeredQuestions.has(i)) return;
          answeredQuestions.add(i);

          if (j === q.answer) {
            correctAnswers++;
            feedback.innerHTML = `<p class="text-success">✅ Correct! ${q.explanation}</p>`;
          } else {
            feedback.innerHTML = `<p class="text-danger">❌ Incorrect. ${q.explanation}</p>`;
          }

          if (answeredQuestions.size === capsule.quiz.length) {
            const score = Math.round(
              (correctAnswers / capsule.quiz.length) * 100
            );
            const progressKey = `pc_progress_${capsule.id}`;
            const existingProgress =
              JSON.parse(localStorage.getItem(progressKey)) || {};
            const updatedProgress = {
              ...existingProgress,
              bestScore: Math.max(score, existingProgress.bestScore || 0),
            };
            localStorage.setItem(progressKey, JSON.stringify(updatedProgress));

            quizDiv.innerHTML += `
      <div class="mt-3 text-center">
        <p><strong>Your Score:</strong> ${score}%</p>
        <p><strong>Best Score:</strong> ${updatedProgress.bestScore}%</p>
      </div>
    `;
          }
        };
      });
    });

    // renderFlashcard();
    // renderQuiz();
  }
  document.querySelector('#learn-tabs button[data-tab="notes"]').click();
}
