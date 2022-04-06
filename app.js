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
