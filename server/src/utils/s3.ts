import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  return { bucket, region, accessKeyId, secretAccessKey };
}

let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (!s3Client) {
    const config = getS3Config();
    s3Client = new S3Client({
      region: config.region,
      credentials:
        config.accessKeyId && config.secretAccessKey
          ? { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
          : undefined, // Falls back to IAM role or env vars
    });
  }
  return s3Client;
}

/** Check whether S3 is configured (bucket + region are required). */
export function isS3Configured(): boolean {
  const { bucket } = getS3Config();
  return !!bucket;
}

/**
 * Upload a buffer to S3.
 * @returns the S3 object key (e.g. `resumes/{userId}/{fileId}.{ext}`)
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const { bucket } = getS3Config();
  if (!bucket) {
    throw new Error(
      "S3_BUCKET is not configured. Set S3_BUCKET (and optionally S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY) in your environment."
    );
  }

  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return key;
}

/**
 * Generate a signed URL for downloading an S3 object.
 * URL expires after the specified number of seconds (default 1 hour).
 */
export async function getS3SignedUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { bucket } = getS3Config();
  if (!bucket) return "";

  const client = getClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

/**
 * Build the S3 object key for a resume file.
 * Format: `resumes/{userId}/{fileId}-{sanitizedFileName}`
 */
export function buildResumeKey(userId: string, fileId: string, fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `resumes/${userId}/${fileId}-${sanitized}`;
}
