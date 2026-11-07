import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const STORAGE_BUCKET = process.env.NEON_STORAGE_BUCKET ?? "assets";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required storage environment variable: ${name}`);
  }
  return value;
}

let cachedClient: S3Client | null = null;

export function getStorageClient(): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: process.env.AWS_REGION ?? "ap-southeast-1",
      endpoint: requireEnv("AWS_ENDPOINT_URL_S3"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }
  return cachedClient;
}

export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await getStorageClient().send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getStorageClient().send(
    new DeleteObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
    })
  );
}

export async function getObjectUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    getStorageClient(),
    new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
    }),
    { expiresIn }
  );
}
