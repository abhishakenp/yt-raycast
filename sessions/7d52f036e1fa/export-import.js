import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient, User, ChatThread, Message, Provider, Tag, Attachment, Archive } from "@prisma/client";
import jwt from "jsonwebtoken";
import multer from "multer";
import archiver from "archiver";
import unzipper from "unzipper";
import { Readable } from "stream";

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware to verify JWT and attach user to request
 */
async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new Error("User not found");
    (req as any).user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Helper to stream a JSON object as a file entry inside a zip archive
 */
function addJsonToArchive(
  archive: archiver.Archiver,
  entryName: string,
  data: unknown
) {
  const json = JSON.stringify(data, null, 2);
  archive.append(json, { name: entryName });
}

/**
 * Export endpoint – returns a zip file containing all user data
 */
router.get(
  "/export",
  authenticate,
  async (req: Request, res: Response) => {
    const user = (req as any).user as User;

    // Gather data
    const [threads, providers, tags, archives] = await Promise.all([
      prisma.chatThread.findMany({
        where: { userId: user.id },
        include: {
          messages: {
            include: {
              attachments: true,
            },
          },
          tags: true,
        },
      }),
      prisma.provider.findMany({ where: { userId: user.id } }),
      prisma.tag.findMany({ where: { userId: user.id } }),
      prisma.archive.findMany({ where: { userId: user.id } }),
    ]);

    // Create zip stream
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="chat-collector-export-${new Date()
        .toISOString()
        .slice(0, 10)}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).end();
    });
    archive.pipe(res);

    // Add JSON files
    addJsonToArchive(archive, "user.json", { id: user.id, email: user.email, name: user.name });
    addJsonToArchive(archive, "providers.json", providers);
    addJsonToArchive(archive, "tags.json", tags);
    addJsonToArchive(archive, "archives.json", archives);
    addJsonToArchive(archive, "threads.json", threads);

    // Finalize archive
    await archive.finalize();
  }
);

/**
 * Import endpoint – accepts a zip file and merges data into the current user account
 */
router.post(
  "/import",
  authenticate,
  upload.single("file"),
  async (req: Request, res: Response) => {
    const user = (req as any).user as User;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const zipBuffer = req.file.buffer;
    const zipStream = Readable.from(zipBuffer);
    const directory = await unzipper.Open.buffer(zipBuffer);

    // Helper to read JSON entry
    const readJson = async (path: string) => {
      const file = directory.files.find((f) => f.path === path);
      if (!file) throw new Error(`Missing ${path} in archive`);
      const content = await file.buffer();
      return JSON.parse(content.toString("utf-8"));
    };

    try {
      // Parse all JSON files
      const [importedUser, providers, tags, archives, threads] = await Promise.all([
        readJson("user.json"),
        readJson("providers.json"),
        readJson("tags.json"),
        readJson("archives.json"),
        readJson("threads.json"),
      ]);

      // Basic sanity check – ensure the export belongs to the same user (or allow cross‑user import)
      if (importedUser.id !== user.id) {
        // For privacy‑by‑design we only allow importing into the same account.
        return res
          .status(403)
          .json({ error: "Import file does not belong to the authenticated user" });
      }

      // Upsert providers
      for (const p of providers as Provider[]) {
        await prisma.provider.upsert({
          where: { id: p.id },
          update: { ...p, userId: user.id },
          create: { ...p, userId: user.id },
        });
      }

      // Upsert tags
      for (const t of tags as Tag[]) {
        await prisma.tag.upsert({
          where: { id: t.id },
          update: { ...t, userId: user.id },
          create: { ...t, userId: user.id },
        });
      }

      // Upsert archives
      for (const a of archives as Archive[]) {
        await prisma.archive.upsert({
          where: { id: a.id },
          update: { ...a, userId: user.id },
          create: { ...a, userId: user.id },
        });
      }

      // Upsert chat threads, messages, and attachments
      for (const thread of threads as ChatThread[]) {
        const createdThread = await prisma.chatThread.upsert({
          where: { id: thread.id },
          update: { ...thread, userId: user.id },
          create: { ...thread, userId: user.id },
        });

        // Messages
        for (const msg of thread.messages as Message[]) {
          const createdMsg = await prisma.message.upsert({
            where: { id: msg.id },
            update: { ...msg, chatThreadId: createdThread.id },
            create: { ...msg, chatThreadId: createdThread.id },
          });

          // Attachments
          for (const att of msg.attachments as Attachment[]) {
            await prisma.attachment.upsert({
              where: { id: att.id },
              update: { ...att, messageId: createdMsg.id },
              create: { ...att, messageId: createdMsg.id },
            });
          }
        }

        // Thread‑Tag linking (many‑to‑many)
        if (thread.tags && (thread.tags as Tag[]).length > 0) {
          await prisma.chatThread.update({
            where: { id: createdThread.id },
            data: {
              tags: {
                set: (thread.tags as Tag[]).map((t) => ({ id: t.id })),
              },
            },
          });
        }
      }

      res.json({ status: "import_successful" });
    } catch (err) {
      console.error("Import error:", err);
      res.status(500).json({ error: "Failed to import data", details: (err as Error).message });
    }
  }
);

export default router;