const PLAIN_TEXT_EXTS = new Set(["txt", "md", "csv", "json", "xml", "yaml", "yml"]);

export async function extractFileText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (PLAIN_TEXT_EXTS.has(ext)) {
    return file.text();
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/extract", {
    method: "POST",
    body: formData,
  });

  const data = await response
    .json()
    .catch(() => ({ error: "Invalid server response" }));

  if (!response.ok) {
    throw new Error(
      data.error ??
        "Could not extract text. Try saving as TXT or paste the content directly."
    );
  }

  return data.text as string;
}

export function fileTypeLabel(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (PLAIN_TEXT_EXTS.has(ext)) return "Plain text";
  if (ext === "pdf") return "PDF";
  if (ext === "docx" || ext === "doc") return "Word document";
  return ext.toUpperCase();
}
