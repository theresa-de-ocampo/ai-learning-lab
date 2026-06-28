export function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

/**
 * Toggle loading state for the request lifecycle.
 * When entering: hides output, resets textarea, animates lamp.
 * When exiting: shows output, restores lamp to compact state.
 */
export function setLoading(isLoading) {
  const lampButton = document.getElementById("lamp-button");
  const lampText = document.querySelector(".lamp-text");
  const userInput = document.getElementById("user-input");
  const outputContainer = document.getElementById("output-container");

  lampButton.disabled = isLoading;

  if (isLoading) {
    // Hide output and reset textarea
    outputContainer.classList.add("hidden");
    outputContainer.classList.remove("visible");
    userInput.style.height = "auto";

    // Animate lamp
    lampButton.classList.remove("compact");
    lampButton.classList.add("loading");
    lampText.textContent = "Summoning Gift Ideas...";
  } else {
    // Show output
    outputContainer.classList.remove("hidden");
    outputContainer.classList.add("visible");

    // Restore lamp to compact state
    lampButton.classList.remove("loading");
    lampButton.classList.add("compact");
    lampText.textContent = "Rub the Lamp";
  }
}

export function showStream() {
  const outputContainer = document.getElementById("output-container");
  outputContainer.classList.remove("hidden");
  outputContainer.classList.add("visible");
}
