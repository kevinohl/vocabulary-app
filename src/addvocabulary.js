import "./styles.css";

const submitButton = document.querySelector("#voc-entry-submit");
const newVocEntries = [];

class VocabularyEntry {
  constructor(category, lesson, korean, english, note, id) {
    this.category = category;
    this.lesson = lesson;
    this.korean = korean;
    this.english = english;
    this.note = note;
    this.id = id;
  }

  static idCounter = -1;

  static setVocId() {
    this.idCounter += 1;
    return this.idCounter;
  }
}

// This segment updates the current voc entries in our list
// TODO: get rid of circular dependence: renderEntries needs editEntry and vice-versa!
function renderEntries() {
  function deleteEntry() {
    const currentEntryId =
      this.parentNode.parentNode.querySelector("td:nth-of-type(8)").textContent;
    const rowToDelete = newVocEntries.findIndex(
      (vocEntry) => parseInt(vocEntry.id, 10) === parseInt(currentEntryId, 10)
    );
    newVocEntries.splice(rowToDelete, 1);
    renderEntries();
  }
  const table = document.querySelector("#vocabulary-table");
  const currentEntries = document.querySelectorAll("tr td");
  currentEntries.forEach((line) => line.remove());
  newVocEntries.forEach((vocEntry) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${vocEntry.korean}</td>
        <td>${vocEntry.english}</td>
        <td>${vocEntry.note}</td>
        <td>${vocEntry.category}</td>
        <td>${vocEntry.lesson}</td>
        <td><button class="edit-button">Edit</button></td>
        <td><button class="del-button">Delete</button></td>
        <td style="visibility:hidden">${vocEntry.id}</td>
      `;
    table.appendChild(newRow);

    const deleteButtons = document.querySelectorAll(".del-button");
    deleteButtons.forEach((button) =>
      button.addEventListener("click", deleteEntry)
    );

    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) =>
      button.addEventListener("click", editEntry)
    );
  });
}

function editEntry() {
  const submitEditButton = document.querySelector("#voc-edit-submit");
  const eCategory = document.querySelector("#edit-category");
  const eLesson = document.querySelector("#edit-lesson");
  const eKorean = document.querySelector("#edit-korean");
  const eEnglish = document.querySelector("#edit-english");
  const eNote = document.querySelector("#edit-note");
  // Toggle unhides/hides the edit form and darkens/undarkens the background
  function toggleEditForm() {
    const form = document.querySelector(".edit-container");
    const background1 = document.querySelector(".form-container");
    const background2 = document.querySelector(".display-container");
    const cancelButton = document.querySelector("#voc-edit-cancel");
    form.classList.toggle("hidden");
    background1.classList.toggle("darkened");
    background2.classList.toggle("darkened");
    if (!form.classList.contains("hidden")) {
      cancelButton.addEventListener("click", toggleEditForm);
    } else cancelButton.removeEventListener("click", toggleEditForm);
  }
  // copy over existing values from the entry we are trying to edit
  function populateEditForm(entry) {
    eCategory.value = entry.category;
    eLesson.value = entry.lesson;
    eKorean.value = entry.korean;
    eEnglish.value = entry.english;
    eNote.value = entry.note;
  }
  // update the entry itself before rendering the list again
  function updateVocEntry(oldEntry) {
    newVocEntries[parseInt(oldEntry, 10)].category = eCategory.value;
    newVocEntries[parseInt(oldEntry, 10)].lesson = eLesson.value;
    newVocEntries[parseInt(oldEntry, 10)].korean = eKorean.value;
    newVocEntries[parseInt(oldEntry, 10)].english = eEnglish.value;
    newVocEntries[parseInt(oldEntry, 10)].note = eNote.value;
    renderEntries();
    submitEditButton.removeEventListener("click", updateVocEntry);
    toggleEditForm();
  }
  // everything above this line is functions that are now called here
  const currentEntryId =
    this.parentNode.parentNode.querySelector("td:nth-of-type(8)").textContent;
  const entrytoEdit = newVocEntries.find(
    (vocEntry) => parseInt(vocEntry.id, 10) === parseInt(currentEntryId, 10)
  );
  const indexToEdit = newVocEntries.findIndex(
    (vocEntry) => parseInt(vocEntry.id, 10) === parseInt(currentEntryId, 10)
  );
  toggleEditForm();
  populateEditForm(entrytoEdit);
  submitEditButton.addEventListener("click", () => {
    updateVocEntry(indexToEdit);
  });
}

// This segment deals with the initial addition of a voc entry
function submitVocEntry(event) {
  event.preventDefault();
  const krField = document.querySelector("#korean");
  const vocCategory = document.getElementById("category").value;
  const vocLesson = document.getElementById("lesson").value.toUpperCase();
  const vocKorean = document.getElementById("korean").value;
  const vocEnglish = document.getElementById("english").value;
  const vocNote = document.getElementById("note").value;
  if (vocCategory && vocLesson && vocKorean && vocEnglish) {
    const newVocEntry = new VocabularyEntry(
      vocCategory,
      vocLesson,
      vocKorean,
      vocEnglish,
      vocNote,
      VocabularyEntry.setVocId()
    );
    // partial form reset, leaving category and lesson populated
    document.getElementById("korean").value = "";
    document.getElementById("english").value = "";
    document.getElementById("note").value = "";
    newVocEntries.push(newVocEntry);
    krField.focus();
    console.log(JSON.stringify(newVocEntry));
    renderEntries();
  } else alert("Please fill out all required fields.");
}

submitButton.addEventListener("click", submitVocEntry);

renderEntries();

// REMEMBER: Before using JSON.stringify, we need to delete the id property from the object!
