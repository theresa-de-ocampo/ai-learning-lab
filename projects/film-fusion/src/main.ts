import "./style.css";

type GenerateImageResponse = { imageDataUrl: string } | { error: string };

const form = document.querySelector<HTMLFormElement>("#fusion-form")!;
const fields = document.querySelector<HTMLFieldSetElement>("#fields")!;
const filmInput = document.querySelector<HTMLInputElement>("#film-title")!;
const styleInput = document.querySelector<HTMLInputElement>("#style")!;
const buttonLabel = document.querySelector<HTMLElement>("#button-label")!;
const preview = document.querySelector<HTMLElement>("#preview")!;
const placeholder = document.querySelector<HTMLElement>("#placeholder")!;
const resultImage = document.querySelector<HTMLImageElement>("#result-image")!;
const loading = document.querySelector<HTMLElement>("#loading")!;
const status = document.querySelector<HTMLElement>("#status")!;
const errorMessage = document.querySelector<HTMLElement>("#error")!;
const caption = document.querySelector<HTMLElement>("#caption")!;
let isLoading = false;

document
  .querySelectorAll<HTMLButtonElement>("[data-example]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.dataset.field === "film" ? filmInput : styleInput;
      input.value = button.dataset.example ?? "";
      input.setCustomValidity("");
      input.focus();
    });
  });

[filmInput, styleInput].forEach((input) => {
  input.addEventListener("input", () => input.setCustomValidity(""));
});

function setLoading(value: boolean) {
  isLoading = value;
  fields.disabled = value;
  preview.setAttribute("aria-busy", String(value));
  loading.hidden = !value;
  buttonLabel.textContent = value ? "Creating your scene…" : "Generate image";
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(
      () =>
        finish(new Error("The image took too long to load. Please try again.")),
      15_000
    );
    function finish(error?: Error) {
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (error) reject(error);
      else resolve();
    }
    image.onload = () => finish();
    image.onerror = () =>
      finish(
        new Error(
          "The generated image could not be displayed. Please try again."
        )
      );
    image.src = src;
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isLoading) return;
  for (const input of [filmInput, styleInput]) {
    input.value = input.value.trim();
    input.setCustomValidity(
      input.value ? "" : "Please enter a value or choose an example."
    );
  }
  if (!form.reportValidity()) return;

  const filmTitle = filmInput.value;
  const style = styleInput.value;
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  status.textContent = "Generating your scene. This can take a minute or two.";
  setLoading(true);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filmTitle, style }),
      signal: AbortSignal.timeout(135_000)
    });
    let data: GenerateImageResponse;
    try {
      data = await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        ["TimeoutError", "AbortError"].includes(error.name)
      )
        throw error;
      throw new Error(
        "The server returned an unreadable response. Please try again."
      );
    }
    if (!response.ok) {
      throw new Error(
        data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
          ? data.error
          : "Image generation failed. Please try again."
      );
    }
    if (
      !data ||
      typeof data !== "object" ||
      !("imageDataUrl" in data) ||
      typeof data.imageDataUrl !== "string" ||
      !data.imageDataUrl.startsWith("data:image/png;base64,") ||
      data.imageDataUrl.length <= "data:image/png;base64,".length
    ) {
      throw new Error("No usable image was returned. Please try again.");
    }

    // Preload before replacing the previous successful image.
    await loadImage(data.imageDataUrl);
    resultImage.src = data.imageDataUrl;
    resultImage.alt = `A scene inspired by ${filmTitle}, in ${style} style`;
    resultImage.hidden = false;
    placeholder.hidden = true;
    caption.textContent = `${filmTitle} · ${style}`;
    status.textContent = "Your scene is ready. Try another combination.";
  } catch (error) {
    let message = "Something went wrong. Please try again.";
    if (error instanceof Error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        message = "Generation timed out. Please try again.";
      } else if (error instanceof TypeError) {
        message =
          "Could not reach the server. Check your connection and try again.";
      } else {
        message = error.message;
      }
    }
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    status.textContent = "Your inputs are saved. You can try again.";
  } finally {
    setLoading(false);
  }
});
