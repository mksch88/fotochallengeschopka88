const CLOUD_NAME = "zdsvvazz";
const UPLOAD_PRESET = "fotochallengeschopka88";

const challenges = [
  "Macht ein Selfie mit dem Brautpaar.",
  "Stellt ein berühmtes Gemälde nach.",
  "Erfindet ein Albumcover.",
  "Fotografiert drei Generationen gemeinsam.",
  "Haltet den wildesten Tanzmove fest.",
  "Macht ein Gruppenfoto mit mindestens sechs Personen.",
  "Fotografiert zwei Gäste, die sich heute neu kennengelernt haben.",
  "Findet drei Personen mit derselben Farbe im Outfit.",
  "Macht ein Foto, das wie eine Filmszene aussieht.",
  "Fotografiert einen besonders herzlichen Moment.",
  "Macht ein Bild aus einer ungewöhnlichen Perspektive.",
  "Fotografiert jemanden beim Anstoßen.",
  "Stellt eine bekannte Band nach.",
  "Macht ein elegantes Schwarz-Weiß-Foto.",
  "Fotografiert etwas, das Liebe symbolisiert – ohne Menschen.",
  "Haltet den lustigsten Gesichtsausdruck des Abends fest.",
  "Macht ein Foto mit jemandem, den ihr lange nicht gesehen habt.",
  "Fotografiert ein besonders schönes Detail der Dekoration.",
  "Macht ein Foto, auf dem alle gleichzeitig springen.",
  "Stellt eine Szene aus einem Musikvideo nach.",
  "Fotografiert die beste Tanzpaar-Pose.",
  "Macht ein kreatives Spiegelbild.",
  "Fotografiert die Schuhe von mindestens fünf Gästen.",
  "Erzählt mit einem einzigen Foto eine kleine Geschichte.",
  "Macht das Bild, das unbedingt ins Hochzeitsalbum gehört."
];

let currentIndex = Math.floor(Math.random() * challenges.length);

const views = [...document.querySelectorAll(".view")];
const challengeNumber = document.querySelector("#challengeNumber");
const challengeText = document.querySelector("#challengeText");
const challengeCounter = document.querySelector("#challengeCounter");
const uploadChallengeNumber = document.querySelector("#uploadChallengeNumber");
const uploadChallengeText = document.querySelector("#uploadChallengeText");
const guestNameInput = document.querySelector("#guestName");
const photoInput = document.querySelector("#photo");
const fileLabel = document.querySelector("#fileLabel");
const previewWrap = document.querySelector("#previewWrap");
const preview = document.querySelector("#preview");
const uploadButton = document.querySelector("#uploadButton");
const statusText = document.querySelector("#status");
const challengeList = document.querySelector("#challengeList");

function showView(id) {
  views.forEach(view => view.classList.toggle("is-active", view.id === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderChallenge() {
  const number = String(currentIndex + 1).padStart(2, "0");
  challengeNumber.textContent = number;
  challengeText.textContent = challenges[currentIndex];
  challengeCounter.textContent = `${number} / ${challenges.length}`;
  uploadChallengeNumber.textContent = number;
  uploadChallengeText.textContent = challenges[currentIndex];
}

function pickDifferentChallenge() {
  let next = currentIndex;
  while (next === currentIndex && challenges.length > 1) {
    next = Math.floor(Math.random() * challenges.length);
  }
  currentIndex = next;
  renderChallenge();
}

function resetUploadForm() {
  guestNameInput.value = "";
  photoInput.value = "";
  fileLabel.textContent = "Foto aufnehmen oder auswählen";
  previewWrap.hidden = true;
  preview.removeAttribute("src");
  statusText.textContent = "";
  statusText.className = "status";
}

challenges.forEach((text, index) => {
  const button = document.createElement("button");
  button.className = "challenge-list-item";
  button.innerHTML = `
    <span>${String(index + 1).padStart(2, "0")}</span>
    <span>${escapeHtml(text)}</span>
  `;
  button.addEventListener("click", () => {
    currentIndex = index;
    renderChallenge();
    showView("challengeView");
  });
  challengeList.appendChild(button);
});

document.querySelector("#enterButton").addEventListener("click", () => {
  renderChallenge();
  showView("challengeView");
});

document.querySelector("#backButton").addEventListener("click", () => showView("welcomeView"));
document.querySelector("#shuffleButton").addEventListener("click", pickDifferentChallenge);
document.querySelector("#chooseButton").addEventListener("click", () => showView("uploadView"));
document.querySelector("#allChallengesButton").addEventListener("click", () => showView("listView"));
document.querySelector("#listBackButton").addEventListener("click", () => showView("challengeView"));
document.querySelector("#uploadBackButton").addEventListener("click", () => showView("challengeView"));

document.querySelector("#nextChallengeButton").addEventListener("click", () => {
  resetUploadForm();
  pickDifferentChallenge();
  showView("challengeView");
});

document.querySelector("#finishButton").addEventListener("click", () => {
  resetUploadForm();
  showView("welcomeView");
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];

  if (!file) {
    previewWrap.hidden = true;
    preview.removeAttribute("src");
    fileLabel.textContent = "Foto aufnehmen oder auswählen";
    return;
  }

  fileLabel.textContent = file.name;
  preview.src = URL.createObjectURL(file);
  previewWrap.hidden = false;
});

uploadButton.addEventListener("click", async () => {
  const file = photoInput.files[0];
  const guestName = guestNameInput.value.trim() || "anonym";

  statusText.textContent = "";
  statusText.className = "status";

  if (!file) {
    statusText.textContent = "Bitte wählt zuerst ein Foto aus.";
    statusText.classList.add("error");
    return;
  }

  if (!file.type.startsWith("image/")) {
    statusText.textContent = "Bitte ladet nur eine Bilddatei hoch.";
    statusText.classList.add("error");
    return;
  }

  uploadButton.disabled = true;
  uploadButton.firstElementChild.textContent = "Wird hochgeladen …";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("tags", `hochzeit-2026,fotochallenge,challenge-${currentIndex + 1}`);
  formData.append(
    "context",
    `challenge_number=${currentIndex + 1}|challenge=${sanitizeContext(challenges[currentIndex])}|guest=${sanitizeContext(guestName)}`
  );

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/image/upload`,
      { method: "POST", body: formData }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error?.message || "Upload fehlgeschlagen");
    }

    showView("successView");
  } catch (error) {
    console.error(error);
    statusText.textContent = "Der Upload hat nicht funktioniert. Bitte versucht es erneut.";
    statusText.classList.add("error");
  } finally {
    uploadButton.disabled = false;
    uploadButton.firstElementChild.textContent = "Foto hochladen";
  }
});

function sanitizeContext(value) {
  return String(value).replace(/[|=]/g, "-").slice(0, 250);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderChallenge();
