import { loadIndex, saveCapsule, saveIndex, loadCap } from "./STORAGE.js";
import { show } from "./main.js";

export function setupAuthorPage() {
  // your author.js code goes here
  console.log("set app age is running !!");
  // --- Author form submit handling ---
  document.getElementById("author-form").onsubmit = (e) => {
    e.preventDefault();

    const capsule = {
      id: document.getElementById("cap-id").value || Date.now().toString(),
      title: document.getElementById("cap-title").value,
      subject: document.getElementById("cap-subject").value,
      level: document.getElementById("cap-level").value,
      description: document.getElementById("cap-desc").value,
      notes: document
        .getElementById("cap-notes")
        .value.split("\n")
        .filter((n) => n.trim() !== ""),
      flashcards: Array.from(document.querySelectorAll(".fc-front")).map(
        (input, i) => ({
          front: input.value,
          back: document.querySelectorAll(".fc-back")[i].value,
        })
      ),
      quiz: Array.from(document.querySelectorAll(".quiz-q")).map((input) => {
        const block = input.parentElement;
        const choices = Array.from(block.querySelectorAll(".quiz-choice")).map(
          (c) => c.value
        );
        return {
          question: input.value,
          choices,
          answer: parseInt(block.querySelector(".quiz-answer").value),
          explanation: block.querySelector(".quiz-explain").value,
        };
      }),
      updatedAt: Date.now(),
    };
    const isEditing = document.getElementById("cap-id").value !== "";
    if (isEditing) {
      localStorage.removeItem(`pc_capsule_${capsule.id}`);
      const index = loadIndex().filter((c) => c.id !== capsule.id);
      saveIndex(index);
    }

    // Save capsule and update index
    saveCapsule(capsule);
    const index = loadIndex() || [];
    index.push({
      id: capsule.id,
      title: capsule.title,
      subject: capsule.subject,
      level: capsule.level,
      updatedAt: capsule.updatedAt,
    });

    saveIndex(index);

    alert("✅ Capsule saved!");
    show("library");
  };

  document.getElementById("addFlashcard").onclick = () => addFlashcardRow();

  // --- Quiz block logic ---

  document.getElementById("addQuiz").onclick = () => addQuizBlock();
}

export { addFlashcardRow, addQuizBlock };

function addFlashcardRow(front = "", back = "") {
  const row = document.createElement("div");
  row.innerHTML = `
    <input class="fc-front form-control bg-dark text-light border-light mb-2" placeholder="Front" value="${front}">
<input class="fc-back form-control bg-dark text-light border-light mb-2" placeholder="Back" value="${back}">
    <button type="button" class="btnDel">X</button>
  `;
  row.querySelector(".btnDel").onclick = () => row.remove();
  document.getElementById("flashcardsEditor").appendChild(row);
}

function addQuizBlock(
  q = "",
  choices = ["", "", "", ""],
  answerIndex = 0,
  explain = ""
) {
  const block = document.createElement("div");
  block.innerHTML = `
   <label class="form-label text-light">Quiz questions:</label>
    <input class="quiz-q   form-control bg-dark text-light border-light mb-2" " placeholder="Question" value="${q}">
   <div class = "col-md-6">
    <div class="choice-container mb-3">
  <input class="quiz-choice form-control bg-dark text-light border-light mb-2" placeholder="Choice 1">
</div>
<button type="button" class="btn btn-outline-light btn-sm mb-3 btnAddChoice">+ Add Choice</button>
<div class="w-100"></div></div></div>
<label class="form-label text-light">Correct Answer :</label>
<input class="form-control quiz-answer bg-dark text-light border-light mb-2" type="number" min="1" max="4" value="${answerIndex} " style ="width :80px">
<label class="form-label text-light">Explanation (optional)</label>
<textarea class="form-control quiz-explain bg-dark text-light border-light mb-2" rows="3" placeholder="Explanation">${explain}</textarea> 
    <button type="button" class="btnDel">X</button>
  `;
  const choiceContainer = block.querySelector(".choice-container");
  const addChoiceBtn = block.querySelector(".btnAddChoice");

  addChoiceBtn.onclick = () => {
    const currentChoices = choiceContainer.querySelectorAll(".quiz-choice");
    if (currentChoices.length >= 4) return;

    const input = document.createElement("input");
    input.className =
      "quiz-choice form-control bg-dark text-light border-light mb-2";
    input.placeholder = `Choice ${currentChoices.length + 1}`;
    choiceContainer.appendChild(input);
  };
  block.querySelector(".btnDel").onclick = () => block.remove();
  document.getElementById("quizEditor").appendChild(block);
}
