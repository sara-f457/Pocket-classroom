// js/storage.js
export const IDX_KEY = "pc_capsules_index";
export const CAP_KEY = (id) => `pc_capsule_${id}`;

export const loadIndex = () => {
  try {
    return JSON.parse(localStorage.getItem(IDX_KEY)) || [];
  } catch (e) {
    return [];
  }
};

export const loadCap = (id) => {
  try {
    const data = JSON.parse(localStorage.getItem(CAP_KEY(id)));
    if (!data || typeof data !== "object") {
      return {
        title: "Untitled",
        subject: "Unknown",
        level: "N/A",
        description: "",
        notes: [],
        flashcards: [],
        quiz: [],
        id,
      };
    }
    return {
      ...data,
      notes: Array.isArray(data.notes) ? data.notes : [],
      flashcards: Array.isArray(data.flashcards) ? data.flashcards : [],
      quiz: Array.isArray(data.quiz) ? data.quiz : [],
    };
  } catch {
    return null;
  }
};

export const saveIndex = (index) => {
  localStorage.setItem(IDX_KEY, JSON.stringify(index));
};

export const saveCapsule = (capsule) => {
  localStorage.setItem(CAP_KEY(capsule.id), JSON.stringify(capsule));
};
