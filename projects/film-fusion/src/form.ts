import type { SceneDetails } from "./api";

export function createSceneForm() {
  const form = document.querySelector<HTMLFormElement>("#fusion-form")!;
  const fields = document.querySelector<HTMLFieldSetElement>("#fields")!;
  const filmInput = document.querySelector<HTMLInputElement>("#film-title")!;
  const styleInput = document.querySelector<HTMLInputElement>("#style")!;

  form
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

  function readDetails(): SceneDetails | null {
    for (const input of [filmInput, styleInput]) {
      input.value = input.value.trim();
      input.setCustomValidity(
        input.value ? "" : "Please enter a value or choose an example."
      );
    }
    if (!form.reportValidity()) return null;

    return { filmTitle: filmInput.value, style: styleInput.value };
  }

  function onSubmit(handler: (details: SceneDetails) => Promise<void>) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (fields.disabled) {
        return;
      }

      const details = readDetails();
      if (details) {
        await handler(details);
      }
    });
  }

  function setDisabled(disabled: boolean) {
    fields.disabled = disabled;
  }

  return { onSubmit, setDisabled };
}
