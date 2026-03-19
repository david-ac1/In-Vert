import path from "path";
import fs from "fs";
import { Router } from "express";
import multer from "multer";
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `evidence-${unique}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are accepted"));
        }
        cb(null, true);
    },
});
export const uploadRouter = Router();
uploadRouter.post("/upload", upload.single("file"), (request, response) => {
    if (!request.file) {
        response.status(400).json({ message: "No file provided" });
        return;
    }
    const baseUrl = process.env.SERVER_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
    const url = `${baseUrl}/uploads/${request.file.filename}`;
    response.json({ url });
});
