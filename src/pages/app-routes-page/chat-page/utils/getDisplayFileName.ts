export function getDisplayFileName(content: string, format?: string | null): string {
  try {
    const url = new URL(content);
    // Find the last segment of the path
    let rawName = url.pathname.split("/").pop() || "File";
    rawName = decodeURIComponent(rawName);

    // Some backends might append UUID prefixes, you can optionally strip them if they look like UUID_
    // e.g., 123e4567-e89b-12d3-a456-426614174000_FileName.pdf -> FileName.pdf
    const uuidPrefixRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
    if (uuidPrefixRegex.test(rawName)) {
      rawName = rawName.replace(uuidPrefixRegex, "");
    }

    if (format) {
      const cleanFormat = format.toLowerCase().replace(/^\./, "");
      if (!rawName.toLowerCase().endsWith(`.${cleanFormat}`)) {
        return `${rawName}.${cleanFormat}`;
      }
    }

    return rawName;
  } catch {
    // Fallback if content is not a full URL
    let rawName = content.split("/").pop() || "File";
    rawName = rawName.split("?")[0];
    try {
      rawName = decodeURIComponent(rawName);
    } catch {
      // Ignored
    }

    const uuidPrefixRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
    if (uuidPrefixRegex.test(rawName)) {
      rawName = rawName.replace(uuidPrefixRegex, "");
    }

    if (format) {
      const cleanFormat = format.toLowerCase().replace(/^\./, "");
      if (!rawName.toLowerCase().endsWith(`.${cleanFormat}`)) {
        return `${rawName}.${cleanFormat}`;
      }
    }
    return rawName;
  }
}
