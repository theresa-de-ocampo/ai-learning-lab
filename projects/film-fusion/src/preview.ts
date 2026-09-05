import type { SceneDetails } from "./api";

export function createScenePreview() {
  const buttonLabel = document.querySelector<HTMLElement>("#button-label")!;
  const preview = document.querySelector<HTMLElement>("#preview")!;
  const placeholder = document.querySelector<HTMLElement>("#placeholder")!;
  const resultImage =
    document.querySelector<HTMLImageElement>("#result-image")!;
  const loading = document.querySelector<HTMLElement>("#loading")!;
  const status = document.querySelector<HTMLElement>("#status")!;
  const errorMessage = document.querySelector<HTMLElement>("#error")!;
  const caption = document.querySelector<HTMLElement>("#caption")!;

  function startLoading() {
    errorMessage.hidden = true;
    errorMessage.textContent = "";
    status.textContent =
      "Generating your scene. This can take a minute or two.";
    preview.setAttribute("aria-busy", "true");
    loading.hidden = false;
    buttonLabel.textContent = "Creating your scene…";
  }

  function finishLoading() {
    preview.setAttribute("aria-busy", "false");
    loading.hidden = true;
    buttonLabel.textContent = "Generate image";
  }

  async function showImage(
    imageDataUrl: string,
    { filmTitle, style }: SceneDetails
  ) {
    // Keep the previous successful image until the new one has loaded.
    await loadImage(imageDataUrl);
    resultImage.src = imageDataUrl;
    resultImage.alt = `A scene inspired by ${filmTitle}, in ${style} style`;
    resultImage.hidden = false;
    placeholder.hidden = true;
    caption.textContent = `${filmTitle} · ${style}`;
    status.textContent = "Your scene is ready. Try another combination.";
  }

  function showError(message: string) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    status.textContent = "Your inputs are saved. You can try again.";
  }

  return { startLoading, finishLoading, showImage, showError };
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
