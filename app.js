// Generating texts content based on the Template
const textsTemplate = `<dt>
TITLE
</dt>
<dd>
VERS
</dd>`;
let content = "";
for (let i = 0; i < texts.length; i++) {
  let entry = textsTemplate
    .replace(/TITLE/g, texts[i].title)
    .replace(/VERS/g, texts[i].vers);
  content += entry;
}
document.getElementById("content").innerHTML = content;
//Month
const contentMonth = month;
document.getElementById("month").innerHTML = contentMonth;
//Questions
const qTemplates = `<li>
QUESTION
</li>`;
let questionsContent = "";
for (let i = 0; i < questions.length; i++) {
  let entry = qTemplates.replace(/QUESTION/g, questions[i]);
  questionsContent += entry;
}
document.getElementById("questions").innerHTML = questionsContent;

// Registering Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/pwa-examples/js13kpwa/sw.js");
}
