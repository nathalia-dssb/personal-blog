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
import bcrypt from "bcryptjs";
import swaggerUi from "swagger-ui-express";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-env";

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

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// Swagger definition
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Anthology Blog API",
    version: "1.0.0",
    description: "API for the Anthology personal blog project",
  },
  servers: [
    {
      url: "/",
      description: "Default Server",
    },
  ],
  paths: {
    "/api/login": {
      post: {
        summary: "Login as an author",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Successful login" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/register": {
      post: {
        summary: "Register a new author",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  name: { type: "string" },
                  bio: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Author created" },
          400: { description: "Author already exists" },
        },
      },
    },
    "/api/authors": {
      get: {
        summary: "Get all authors (Docs only)",
        responses: {
          200: { description: "List of authors" },
        },
      },
    },
    "/api/authors/{id}": {
      get: {
        summary: "Get author by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Author found" },
          404: { description: "Author not found" },
        },
      },
      delete: {
        summary: "Delete author (Docs only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          204: { description: "Author deleted" },
          500: { description: "Deletion failed" },
        },
      },
    },
    "/api/posts": {
      get: {
        summary: "Get all posts",
        responses: {
          200: { description: "List of posts" },
        },
      },
      post: {
        summary: "Create a new post",
        responses: {
          201: { description: "Post created" },
        },
      },
    },
  },
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, "../../dist")));

app.post("/api/register", async (req, res) => {
  const { email, password, name, bio } = req.body;
  try {
    const existingAuthor = await prisma.author.findUnique({
      where: { email },
    });

    if (existingAuthor) {
      return res.status(400).json({ error: "Author already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const author = await prisma.author.create({
      data: {
        email,
        passwordHash,
        name,
        bio,
      },
    });

    const token = jwt.sign({ id: author.id, email: author.email }, JWT_SECRET, { expiresIn: '24h' });
    const { passwordHash: _, ...authorWithoutPassword } = author;
    res.status(201).json({ author: authorWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const author = await prisma.author.findUnique({
      where: { email },
    });

    if (!author) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, author.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: author.id, email: author.email }, JWT_SECRET, { expiresIn: '24h' });
    const { passwordHash, ...authorWithoutPassword } = author;
    res.json({ author: authorWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

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

app.post("/api/posts", authenticateToken, upload.array("images"), async (req, res) => {
  const { title, content } = req.body;
  const authorId = (req as any).user.id;
  const files = req.files as Express.Multer.File[];

  try {
    const imageUrls = await Promise.all(
      (files || []).map((file) => uploadToS3(file)),
    );

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: Number(authorId),
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

app.put("/api/posts/:id", authenticateToken, upload.array("images"), async (req, res) => {
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

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
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

app.get("/api/authors", async (req, res) => {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
      },
    });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch authors" });
  }
});

app.delete("/api/authors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Delete related records first
    await prisma.comment.deleteMany({
      where: { post: { authorId: Number(id) } },
    });
    await prisma.image.deleteMany({
      where: { post: { authorId: Number(id) } },
    });
    await prisma.post.deleteMany({
      where: { authorId: Number(id) },
    });
    await prisma.author.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Delete author error:", error);
    res.status(500).json({ error: "Failed to delete author" });
  }
});

app.get("/api/authors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const author = await prisma.author.findUnique({
      where: { id: Number(id) },
    });

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch author" });
  }
});

app.put("/api/authors/:id", authenticateToken, upload.single("avatar"), async (req, res) => {
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
