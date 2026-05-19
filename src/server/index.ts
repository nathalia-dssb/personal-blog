import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { uploadToS3 } from "./s3.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const port = process.env.PORT || 3001;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, "../../dist")));

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        images: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        comments: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

app.post("/api/posts", upload.array("images"), async (req, res) => {
  const { title, content, authorId } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    const imageUrls = await Promise.all(
      (files || []).map((file) => uploadToS3(file)),
    );

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: Number(authorId) || 1,
        images: {
          create: imageUrls
            .filter((url: string | undefined): url is string => !!url)
            .map((url: string) => ({ s3Url: url })),
        },
      },
      include: {
        images: true,
      },
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Failed to create post",
      details: error.message || String(error),
    });
  }
});

app.put("/api/posts/:id", upload.array("images"), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const results = await Promise.all(files.map((file) => uploadToS3(file)));
      imageUrls = results.filter(
        (url: string | undefined): url is string => !!url,
      );
    }

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        ...(imageUrls.length > 0 && {
          images: {
            deleteMany: {},
            create: imageUrls
              .filter((url: string | undefined): url is string => !!url)
              .map((url: string) => ({ s3Url: url })),
          },
        }),
      },
      include: {
        images: true,
      },
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.comment.deleteMany({ where: { postId: Number(id) } });
    await prisma.image.deleteMany({ where: { postId: Number(id) } });
    await prisma.post.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

app.post("/api/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { username, commentText } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: Number(id),
        username,
        commentText,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.post("/api/posts/:id/kudo", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        kudosCount: {
          increment: 1,
        },
      },
    });
    res.json({ kudosCount: post.kudosCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to add kudo" });
  }
});

app.get("/api/authors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let author = await prisma.author.findUnique({
      where: { id: Number(id) },
    });

    if (!author && id === "1") {
      author = await prisma.author.create({
        data: {
          id: 1,
          email: "author@blog.com",
          passwordHash: "hashed_password",
          name: "Nathaniel",
          bio: "Exploring the intersection of nature, life, and the quiet moments in between. Welcome to my anthology of stories and observations.",
          avatarUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
        },
      });
    }

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch author" });
  }
});

app.put("/api/authors/:id", upload.single("avatar"), async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;
  const file = req.file;

  try {
    let avatarUrl: string | undefined;
    if (file) {
      avatarUrl = await uploadToS3(file);
    }

    const author = await prisma.author.update({
      where: { id: Number(id) },
      data: {
        name,
        bio,
        ...(avatarUrl && { avatarUrl }),
      },
    });

    res.json(author);
  } catch (error) {
    res.status(500).json({ error: "Failed to update author" });
  }
});

// Handle React routing (SPA) - must be last
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
