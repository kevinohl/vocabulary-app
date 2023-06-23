import "./styles.css";
import "./assets/voc-db.json";

// Jump to line ~170 containing commitToDatabase() and implement the rest using node.

// Could technically just wrap the entire thing in a self-executing function
// to create a closure but meh...
const newVocEntries = [];

class VocabularyEntry {
  constructor(category, lesson, korean, english, note, id) {
    this.CATEGORY = category;
    this.KR = korean;
    this.ENG = english;
    this.NOTE = note;
    this.LESSON = lesson;
    this.ID = id;
  }

  static idCounter = -1;

  static setVocId() {
    this.idCounter += 1;
    return this.idCounter;
  }
}

// This segment updates the DOM to show the current voc entries in our list
function renderEntries() {
  const table = document.querySelector("#vocabulary-table");
  const currentEntries = document.querySelectorAll("tr td");
  currentEntries.forEach((line) => line.remove());
  newVocEntries.forEach((vocEntry) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${vocEntry.KR}</td>
        <td>${vocEntry.ENG}</td>
        <td>${vocEntry.NOTE}</td>
        <td>${vocEntry.CATEGORY}</td>
        <td>${vocEntry.LESSON}</td>
        <td><button class="edit-button">Edit</button></td>
        <td><button class="del-button">Delete</button></td>
        <td style="visibility:hidden">${vocEntry.ID}</td>
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

function deleteEntry() {
  const currentEntryId =
    this.parentNode.parentNode.querySelector("td:nth-of-type(8)").textContent;
  const rowToDelete = newVocEntries.findIndex(
    (vocEntry) => parseInt(vocEntry.ID, 10) === parseInt(currentEntryId, 10)
  );
  newVocEntries.splice(rowToDelete, 1);
  renderEntries();
}

function editEntry() {
  const submitEditButton = document.querySelector("#voc-edit-submit");
  const eCategory = document.querySelector("#edit-category");
  const eLesson = document.querySelector("#edit-lesson");
  const eKorean = document.querySelector("#edit-korean");
  const eEnglish = document.querySelector("#edit-english");
  const eNote = document.querySelector("#edit-note");
  // Toggle visibility of edit form and darkens/undarkens the background
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
    eCategory.value = entry.CATEGORY;
    eLesson.value = entry.LESSON;
    eKorean.value = entry.KR;
    eEnglish.value = entry.ENG;
    eNote.value = entry.NOTE;
  }
  // update the entry itself before rendering the list again
  function updateVocEntry(oldEntry) {
    newVocEntries[parseInt(oldEntry, 10)].CATEGORY = eCategory.value;
    newVocEntries[parseInt(oldEntry, 10)].LESSON = eLesson.value;
    newVocEntries[parseInt(oldEntry, 10)].KR = eKorean.value;
    newVocEntries[parseInt(oldEntry, 10)].ENG = eEnglish.value;
    newVocEntries[parseInt(oldEntry, 10)].NOTE = eNote.value;
    renderEntries();
    submitEditButton.removeEventListener("click", updateVocEntry);
    toggleEditForm();
  }
  // everything above this line is functions that are now called here
  const currentEntryId =
    this.parentNode.parentNode.querySelector("td:nth-of-type(8)").textContent;
  const entrytoEdit = newVocEntries.find(
    (vocEntry) => parseInt(vocEntry.ID, 10) === parseInt(currentEntryId, 10)
  );
  const indexToEdit = newVocEntries.findIndex(
    (vocEntry) => parseInt(vocEntry.ID, 10) === parseInt(currentEntryId, 10)
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

let localJson;
// so apparently, even with the async here the function takes a moment to assign
// data to localJson. Thus, we need to call the function early on
async function loadLocalJson() {
  // serving the file through the webpack dev-server:
  const response = await fetch("http://localhost:8080/assets/voc-db.json");
  // server the file through the python server on my PC:
  // const response = await fetch('http://192.168.178.34:8000/assets/voc-db.json');
  const data = await response.json();
  localJson = data;
}

function pushClassToJson(entry) {
  const convertedEntry = {
    KR: entry.KR,
    ENG: entry.ENG,
    NOTE: entry.NOTE,
    LESSON: entry.LESSON,
  };
  localJson[entry.CATEGORY].push(convertedEntry);
}

function generateDateString() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const dateString = `voc-db-${year}-${month}-${day}`;
  return dateString;
}

function commitToDatabase() {
  newVocEntries.forEach((entry) => pushClassToJson(entry));
  console.log(localJson);
  // convert the localJson object to a string and save it to a file:
  const jsonString = JSON.stringify(localJson);
  // NEED TO RETURN TO THIS LATER. NATIVELY, JS DOES NOT SUPPORT WRITING TO THE FILE SYSTEM.
  // THIS EXPLICITLY REQUIRES NODE AND ITS FS MODULE!!!
  // Local stoage BS can be done like this but that won't really help me do what I want to do long-term.
  /*   localStorage.setItem("voc-db-session", localJson);
  console.log(localStorage.getItem("voc-db-session")); */
  console.log(generateDateString());
  console.log(jsonString);
  // reload the local database
  loadLocalJson();
}

const submitButton = document.querySelector("#voc-entry-submit");
const commitButton = document.querySelector("#confirm-entries");
submitButton.addEventListener("click", submitVocEntry);
commitButton.addEventListener("click", commitToDatabase);

/* const testentry = new VocabularyEntry("Verb", "L69", "KKD", "OWO", "", 0);
let i = 0;
while (i < 20) {
  newVocEntries.push(testentry);
  i++;
} */

renderEntries();
loadLocalJson();

// REMEMBER: Before using JSON.stringify, we need to delete the id property from the object!
