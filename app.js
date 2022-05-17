// Generating texts content based on the Template
const textsTemplate = `<dt>
TITLE
</dt>
<dd>
VERS
<button class="btn">Clic</button>
</dd>`;
let content = '';
for (let i = 0; i < texts.length; i++) {
  let entry = textsTemplate
    .replace(/TITLE/g, texts[i].title)
    .replace(/VERS/g, texts[i].vers);
  content += entry;
}
document.getElementById('content').innerHTML = content;
//Month
const contentMonth = month;
document.getElementById('month').innerHTML = contentMonth;
//Questions
const qTemplates = `<li>
QUESTION
</li>`;
let questionsContent = '';
for (let i = 0; i < questions.length; i++) {
  let entry = qTemplates.replace(/QUESTION/g, questions[i]);
  questionsContent += entry;
}
document.getElementById('questions').innerHTML = questionsContent;

// Registering Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/PWA-elencuentro/sw.js');
}

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', () => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});
