// helpers.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export default prisma;

// Helper to get session with user ID on the server
export async function getSessionUser(req, res) {
  const session = await getServerSession(req, res, authOptions);
  return session?.user || null;
}

export async function getSessionShopId(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    return session?.user?.shopId || null;
  } 
  catch (error) {
    console.error("Error retrieving shopNo from session:", error);
    return null;
  }
}

// Helper to get userNo by session user ID
export async function getUserIdFromSession(req, res) {
  try {
    const user = await getSessionUser(req, res);
    if (!user?.id) return null;

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { userNo: true },
    });
    return userRecord?.userNo || null;
  } 
  catch (error) {
    console.error("Error fetching userNo:", error);
    return null;
  }
}

// Helper to disconnect Prisma client safely
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export async function uploadFileToSupabase(
  file,
  filepath,
  originalFilename,
  uniqueId,
  bucketPath
) {
  // Validate required parameters
  if (!file || !filepath || !originalFilename || !uniqueId || !bucketPath) {
    console.error("Invalid file or parameters provided");
    return null;
  }

  // Extract the file extension
  const fileExt = originalFilename.split(".").pop().toLowerCase();

  // Determine the MIME type based on the file extension
  let mimeType = "text/plain"; // Default
  if (fileExt === "png") mimeType = "image/png";
  else if (fileExt === "jpg" || fileExt === "jpeg") mimeType = "image/jpeg";
  else if (fileExt === "pdf") mimeType = "application/pdf";
  else if (fileExt === "webp") mimeType = "image/webp";

  // Use webp as the default format if desired
  const finalExt = fileExt === "webp" ? "webp" : fileExt;

  // Remove the extension from the original filename for more customization options
  const bucketPathName = bucketPath.replace(/\//g, "-");

  // Generate a unique filename
  const uniqueSuffix = uuidv4(); // Generate a new UUID
  const fileName = `${uniqueId}-${bucketPathName}-${uniqueSuffix}.${finalExt}`;

  try {
    // Read the file content as a Buffer
    const fileContent = fs.readFileSync(filepath);

    // Upload the file content to Supabase
    const { data, error } = await supabase.storage
      .from(bucketPath)
      .upload(fileName, fileContent, {
        cacheControl: "3600",
        contentType: mimeType, // Explicitly set the content type
        upsert: false, // Prevents overwriting files with the same name
      });

    if (error) {
      console.error("Failed to upload file to Supabase:", error);
      return null;
    }

    console.log("File uploaded to Supabase...");

    // Construct and return the public URL for the uploaded file
    const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketPath}/${fileName}`;
    console.log("Public URL generated...");
    return publicURL;
  } catch (err) {
    console.error("Error reading or uploading file:", err);
    return null;
  }
}

export function parseFormData(req) {
  const form = formidable({
    multiples: true,
    maxFileSize: Infinity,
    maxFieldsSize: Infinity,
    allowEmptyFiles: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}
