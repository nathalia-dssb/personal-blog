import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: "anonymous",
    secretAccessKey: "anonymous",
  },
  signer: { sign: async (request) => request },
});

export const uploadToS3 = async (file: Express.Multer.File) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: `Main/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params,
    });

    const result = await upload.done();
    return result.Location;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload image to S3");
  }
};
