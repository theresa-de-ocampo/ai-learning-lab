import "./style.css";
import { generateImage } from "./api";
import { createSceneForm } from "./form";
import { createScenePreview } from "./preview";

const form = createSceneForm();
const preview = createScenePreview();

form.onSubmit(async (details) => {
  form.setDisabled(true);
  preview.startLoading();

  try {
    const imageDataUrl = await generateImage(details);
    await preview.showImage(imageDataUrl, details);
  } catch (error) {
    preview.showError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    form.setDisabled(false);
    preview.finishLoading();
  }
});
