export type SceneDetails = {
  filmTitle: string;
  style: string;
};

type GenerateImageResponse = {
  imageDataUrl?: string;
  error?: string;
};

const PNG_DATA_URL_PREFIX = "data:image/png;base64,";

export async function generateImage(details: SceneDetails): Promise<string> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
      signal: AbortSignal.timeout(135_000)
    });

    const data: GenerateImageResponse | null = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data?.error === "string"
          ? data.error
          : "Image generation failed. Please try again."
      );
    }

    const imageDataUrl = data?.imageDataUrl;

    if (
      !imageDataUrl?.startsWith(PNG_DATA_URL_PREFIX) ||
      imageDataUrl.length <= PNG_DATA_URL_PREFIX.length
    ) {
      throw new Error("No usable image was returned. Please try again.");
    }

    return imageDataUrl;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        "The server returned an unreadable response. Please try again."
      );
    }

    if (
      error instanceof Error &&
      ["TimeoutError", "AbortError"].includes(error.name)
    ) {
      throw new Error("Generation timed out. Please try again.");
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Could not reach the server. Check your connection and try again."
      );
    }

    throw error;
  }
}
