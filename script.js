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

const challengeSelect = document.querySelector("#challenge");
const challengeList = document.querySelector("#challengeList");
const guestNameInput = document.querySelector("#guestName");
const photoInput = document.querySelector("#photo");
const uploadButton = document.querySelector("#uploadButton");
const statusText = document.querySelector("#status");
const previewWrap = document.querySelector("#previewWrap");
const preview = document.querySelector("#preview");
const fileLabel = document.querySelector("#fileLabel");

challenges.forEach((text, index) => {
  const option = document.createElement("option");
  option.value = String(index + 1);
  option.textContent = `${String(index + 1).padStart(2, "0")} — ${text}`;
  challengeSelect.appendChild(option);

  const item = document.createElement("div");
  item.className = "challenge-item";
  item.innerHTML = `
    <span class="challenge-number">${String(index + 1).padStart(2, "0")}</span>
    <span>${escapeHtml(text)}</span>
  `;
  challengeList.appendChild(item);
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

uploadButton.addEventListener("click", uploadPhoto);

async function uploadPhoto() {
  clearStatus();

  const challengeNumber = challengeSelect.value;
  const file = photoInput.files[0];
  const guestName = guestNameInput.value.trim();

  if (!challengeNumber) {
    showStatus("Bitte wählt zuerst eine Challenge aus.", "error");
    return;
  }

  if (!file) {
    showStatus("Bitte wählt ein Foto aus.", "error");
    return;
  }

  if (!file.type.startsWith("image/")) {
    showStatus("Bitte ladet nur eine Bilddatei hoch.", "error");
    return;
  }

  uploadButton.disabled = true;
  uploadButton.firstElementChild.textContent = "Wird hochgeladen …";

  const challengeText = challenges[Number(challengeNumber) - 1];
  const safeGuestName = guestName || "anonym";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("tags", `hochzeit-2026,fotochallenge,challenge-${challengeNumber}`);
  formData.append(
    "context",
    `challenge_number=${challengeNumber}|challenge=${sanitizeContext(challengeText)}|guest=${sanitizeContext(safeGuestName)}`
  );

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const message = result?.error?.message || "Der Upload ist fehlgeschlagen.";
      throw new Error(message);
    }

    showStatus("Upload abgeschlossen. Vielen Dank für euer Foto.", "success");
    challengeSelect.value = "";
    guestNameInput.value = "";
    photoInput.value = "";
    previewWrap.hidden = true;
    preview.removeAttribute("src");
    fileLabel.textContent = "Foto aufnehmen oder auswählen";
  } catch (error) {
    console.error(error);
    showStatus(
      "Der Upload hat nicht funktioniert. Bitte prüft eure Verbindung und versucht es erneut.",
      "error"
    );
  } finally {
    uploadButton.disabled = false;
    uploadButton.firstElementChild.textContent = "Foto hochladen";
  }
}

function showStatus(message, type) {
  statusText.textContent = message;
  statusText.className = `status ${type}`;
}

function clearStatus() {
  statusText.textContent = "";
  statusText.className = "status";
}

function sanitizeContext(value) {
  return String(value)
    .replace(/[|=]/g, "-")
    .slice(0, 250);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
