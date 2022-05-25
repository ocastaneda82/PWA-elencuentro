// Generating texts content based on the Template
const textsTemplate = `<dt>
DAY <strong>TITLE</strong>
</dt>
<dd>
<span><strong>BOOK</strong> CHAP:ORIVER</span>
<button class="btn api-verses" data-book="BOOK" data-chapter="CHAP" data-verses="VERS"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_8_18)">
<path d="M1.375 3.88849C2.59188 3.37974 4.33675 2.83111 6.0335 2.66061C7.86225 2.47636 9.41325 2.74724 10.3125 3.69461V17.0954C9.02687 16.3666 7.3975 16.2662 5.89463 16.4175C4.27213 16.5825 2.63587 17.0514 1.375 17.5326V3.88849ZM11.6875 3.69461C12.5868 2.74724 14.1378 2.47636 15.9665 2.66061C17.6632 2.83111 19.4081 3.37974 20.625 3.88849V17.5326C19.3627 17.0514 17.7279 16.5811 16.1054 16.4189C14.6011 16.2662 12.9731 16.3652 11.6875 17.0954V3.69461ZM11 2.45161C9.64563 1.28699 7.68213 1.11374 5.89463 1.29249C3.81288 1.50286 1.71188 2.21649 0.402875 2.81186C0.282767 2.86649 0.180916 2.95452 0.109479 3.06546C0.0380417 3.17639 3.65357e-05 3.30554 0 3.43749L0 18.5625C3.18477e-05 18.6775 0.0289261 18.7907 0.084036 18.8917C0.139146 18.9926 0.21871 19.0782 0.31544 19.1404C0.41217 19.2027 0.522974 19.2397 0.637702 19.248C0.75243 19.2563 0.867415 19.2357 0.972125 19.1881C2.18488 18.6381 4.13875 17.9767 6.03212 17.7856C7.9695 17.5904 9.59338 17.9052 10.4637 18.9915C10.5282 19.0718 10.6098 19.1366 10.7026 19.1811C10.7954 19.2256 10.8971 19.2488 11 19.2488C11.1029 19.2488 11.2046 19.2256 11.2974 19.1811C11.3902 19.1366 11.4718 19.0718 11.5363 18.9915C12.4066 17.9052 14.0305 17.5904 15.9665 17.7856C17.8612 17.9767 19.8165 18.6381 21.0279 19.1881C21.1326 19.2357 21.2476 19.2563 21.3623 19.248C21.477 19.2397 21.5878 19.2027 21.6846 19.1404C21.7813 19.0782 21.8609 18.9926 21.916 18.8917C21.9711 18.7907 22 18.6775 22 18.5625V3.43749C22 3.30554 21.962 3.17639 21.8905 3.06546C21.8191 2.95452 21.7172 2.86649 21.5971 2.81186C20.2881 2.21649 18.1871 1.50286 16.1054 1.29249C14.3179 1.11236 12.3544 1.28699 11 2.45161Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_8_18">
<rect width="22" height="22" fill="white"/>
</clipPath>
</defs>
</svg>
</button>
</dd>`;
// const range = (min, max) =>
//   Array.from({ length: max - min + 1 }, (_, i) => min + i);
// const runRange = (arr) => {
//   return arr.length === 2 ? range(arr[0], arr[1]) : arr[0];
// };
let content = '';
for (let i = 0; i < texts.length; i++) {
  let versesOriginal = String(texts[i].verses).replace(',', '-');
  let entry = textsTemplate
    .replace(/DAY/g, texts[i].day)
    .replace(/TITLE/g, texts[i].title)
    .replace(/BOOK/g, texts[i].book)
    .replace(/CHAP/g, texts[i].chapter)
    .replace(/ORIVER/g, versesOriginal)
    .replace(/VERS/g, texts[i].verses);
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
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('Service worker registered');
  });
  // navigator.serviceWorker.register('/PWA-elencuentro/sw.js');
}

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  console.log('Prompt was triggered');
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'flex';

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

navigator.serviceWorker.onmessage = (event) => {
  const message = JSON.parse(event.data);
  //TODO: detect the type of message and refresh the view
  console.log(message);
  if (message && message.type.includes('/bibles/')) {
    console.log('List of attendees to date', message.data);
    renderAttendees(message.data);
  }
};

const buttonApi = document.querySelectorAll('.api-verses');
console.log(buttonApi);
buttonApi.forEach((item) => {
  item.addEventListener('click', () => {
    let book = item.getAttribute('data-book');
    let chapter = item.getAttribute('data-chapter');
    let verses = item.getAttribute('data-verses');
    let arrVerses = verses.split(',').filter((i) => i !== ',');
    console.log(book, chapter, arrVerses);
    getPassagesFromApi(book, chapter, arrVerses);
  });
});

async function getBooksFromApi() {
  var myHeaders = new Headers();
  myHeaders.append('accept', 'application/json');
  myHeaders.append('api-key', '9e3691df3405154e2a29a793923104bd');

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };
  let response = await fetch(
    'https://api.scripture.api.bible/v1/bibles/b32b9d1b64b4ef29-01/books',
    requestOptions
  );
  let data = await response.json();
  data = JSON.stringify(data);
  data = JSON.parse(data);
  return data;
}
function toggleModal(id, data) {
  const modal = document.getElementById(id);
  if (modal) {
    const container = modal.getElementsByClassName('modal-content')[0];
    container.insertAdjacentHTML('afterend', data);
    const bool = modal.getAttribute('active') === String(true);
    modal.setAttribute('active', !bool);
  }
}

function transformBooks(book, books) {
  let changedBook = books?.data.find((item) => item.name === book);
  changedBook = changedBook.abbreviation;
  return changedBook;
}

async function getPassagesFromApi(book, chapter, arrVerses) {
  let books = await getBooksFromApi();
  let abbrBook = await transformBooks(book, books);
  var myHeaders = new Headers();
  myHeaders.append('accept', 'application/json');
  myHeaders.append('api-key', '9e3691df3405154e2a29a793923104bd');

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  let response = await fetch(
    `https://api.scripture.api.bible/v1/bibles/b32b9d1b64b4ef29-01/passages/${abbrBook}.${chapter}.${arrVerses[0]}-${abbrBook}.${chapter}.${arrVerses[1]}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false&use-org-id=false`,
    requestOptions
  );
  let { data } = await response.json();
  data = JSON.stringify(data);
  data = JSON.parse(data);
  toggleModal('PASSAGES_MODAL', data.content);
  console.log(data.content);
}
