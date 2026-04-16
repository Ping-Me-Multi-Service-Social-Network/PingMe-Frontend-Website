export function getDisplayFileName(content: string, format?: string | null): string {
  const rawName = content.split("/").pop() || "File";
  const nameWithoutParams = rawName.split("?")[0]; // remove query strings if any

  if (format) {
    const cleanFormat = format.toLowerCase().replace(/^\./, ""); // remove dot if provided

    if (!nameWithoutParams.toLowerCase().endsWith(`.${cleanFormat}`)) {
      // If actual name lacks the proper extension, fallback to a clean File.ext
      return `File.${cleanFormat}`;
    }

    // If it's a raw UUID filename (e.g. 123e4567-e89b-12d3-a456-426614174000.pdf)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i;
    if (uuidRegex.test(nameWithoutParams)) {
      return `File.${cleanFormat}`;
    }

    return nameWithoutParams;
  }

  return nameWithoutParams;
}
