import './styles.css'

const submitButton = document.querySelector("#voc-entry-submit");
const newVocEntries = [];


class VocabularyEntry {
    constructor(category, lesson, korean, english, note) {
      this.category = category;
      this.lesson = lesson;
      this.korean = korean;
      this.english = english;
      this.note = note;
    }
}


function submitVocEntry(event) {
    event.preventDefault();
    const vocForm = document.getElementById("vocabulary-form");
    const vocCategory = document.getElementById("category").value;
    const vocLesson = document.getElementById("lesson").value;
    const vocKorean = document.getElementById("korean").value;
    const vocEnglish = document.getElementById("english").value;
    const vocNote = document.getElementById("note").value;
    // if (vocNote == null) vocNote = "";
    if (vocCategory && vocLesson && vocKorean && vocEnglish) {
      const newVocEntry = new VocabularyEntry(vocCategory, vocLesson, vocKorean, vocEnglish, vocNote);
      // vocForm.reset();
      // partial form reset, leaving category and lesson populated
      document.getElementById("korean").value = "";
      document.getElementById("english").value = "";
      document.getElementById("note").checked = "";
      newVocEntries.push(newVocEntry);
      console.log(JSON.stringify(newVocEntry));
      // renderLibrary();
    }
    else alert("Please fill out all required fields.")
  }
  
  submitButton.addEventListener("click", submitVocEntry);