const SUPABASE_URL = "https://wcvukbdjrrusvrhsnbvf.supabase.co";
const SUPABASE_KEY = "sb_publishable_lmaPnsRP26-00iOknGpBOw_Dh4kgCNq";

const POLL_INTERVAL_MS = 5000;
const SLIDE_DURATION_MS = 8000;

const slide = document.querySelector("#slide");
const slideImage = document.querySelector("#slideImage");
const slideChallenge = document.querySelector("#slideChallenge");
const slideGuest = document.querySelector("#slideGuest");
const emptyState = document.querySelector("#emptyState");
const photoCount = document.querySelector("#photoCount");

let photos = [];
let currentIndex = 0;
let slideTimer = null;

async function fetchPhotos() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/photos?approved=eq.true&select=id,created_at,image_url,challenge_number,challenge_text,guest_name&order=created_at.desc&limit=200`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const incoming = await response.json();
    const hadNoPhotos = photos.length === 0;
    const hasNewPhoto = incoming.length > 0 && incoming[0]?.id !== photos[0]?.id;

    photos = incoming;
    photoCount.textContent = `${photos.length} ${photos.length === 1 ? "Beitrag" : "Beiträge"}`;

    if (photos.length === 0) {
      showEmptyState();
      return;
    }

    if (hadNoPhotos || hasNewPhoto) {
      currentIndex = 0;
      showPhoto(photos[currentIndex]);
      restartSlideTimer();
    }
  } catch (error) {
    console.error("Fotos konnten nicht geladen werden:", error);
  }
}

function showEmptyState() {
  emptyState.hidden = false;
  slide.hidden = true;
}

function showPhoto(photo) {
  emptyState.hidden = true;
  slide.hidden = false;
  slide.classList.remove("is-visible");

  const preload = new Image();
  preload.onload = () => {
    slideImage.src = photo.image_url;
    slideImage.alt = photo.challenge_text || "Hochzeitsfoto";
    slideChallenge.textContent = `${String(photo.challenge_number).padStart(2, "0")} — ${photo.challenge_text}`;
    slideGuest.textContent = photo.guest_name && photo.guest_name !== "anonym"
      ? `von ${photo.guest_name}`
      : "";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => slide.classList.add("is-visible"));
    });
  };
  preload.src = photo.image_url;
}

function nextPhoto() {
  if (photos.length === 0) return;
  currentIndex = (currentIndex + 1) % photos.length;
  showPhoto(photos[currentIndex]);
}

function restartSlideTimer() {
  clearInterval(slideTimer);
  slideTimer = setInterval(nextPhoto, SLIDE_DURATION_MS);
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowRight" || event.key === " ") nextPhoto();
  if (event.key.toLowerCase() === "f" && document.fullscreenEnabled) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});

fetchPhotos();
setInterval(fetchPhotos, POLL_INTERVAL_MS);
restartSlideTimer();
