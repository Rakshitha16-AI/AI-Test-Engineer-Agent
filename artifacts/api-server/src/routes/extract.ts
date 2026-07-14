import { Router, type IRouter } from "express";
import multer from "multer";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post(
  "/",
  upload.single("file"),
  async (req: any, res: any) => {
    const file: Express.Multer.File | undefined = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";

    try {
      let text = "";

      if (ext === "pdf") {
        const pdfParse = (await import("pdf-parse")).default;
        const result = await pdfParse(file.buffer);
        text = result.text;
      } else if (ext === "docx" || ext === "doc") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else {
        text = file.buffer.toString("utf-8");
      }

      const clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

      if (!clean) {
        return res.status(422).json({
          error:
            "Could not extract readable text from this file. Try saving as TXT, or paste the content directly.",
        });
      }

      return res.json({ text: clean, fileName: file.originalname });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed";
      return res.status(500).json({ error: `Text extraction failed: ${msg}` });
    }
  }
);

export default router;
