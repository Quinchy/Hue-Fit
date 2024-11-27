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

// Helper to get session with user ID on the server
export async function getSessionUser(req, res) {
  const session = await getServerSession(req, res, authOptions);
  return session?.user || null;
}

export async function getSessionShopNo(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    return session?.user?.shopNo || null;
  } catch (error) {
    console.error("Error retrieving shopNo from session:", error);
    return null;
  }
}

// Helper to get userNo by session user ID
export async function getUserNoFromSession(req, res) {
  try {
    const user = await getSessionUser(req, res);
    if (!user?.id) return null;

    const userRecord = await prisma.users.findUnique({
      where: { id: user.id },
      select: { userNo: true },
    });
    return userRecord?.userNo || null;
  } catch (error) {
    console.error("Error fetching userNo:", error);
    return null;
  }
}

// Helper to fetch permissions based on roleId
export async function fetchPermissions(roleId) {
  try {
    return await prisma.permissions.findMany({
      where: { roleId },
      select: { pageId: true, can_view: true, can_edit: true, can_add: true, can_delete: true },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }
}

// Helper to disconnect Prisma client safely
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Helper to upload a file to Supabase Storage
export async function uploadFileToSupabase(file, filepath, originalFilename, uniqueId, bucketPath) {
  // Validate required parameters
  if (!file || !filepath || !originalFilename || !uniqueId || !bucketPath) {
    console.error("Invalid file or parameters provided");
    return null;
  }

  // Extract the file extension
  const fileExt = originalFilename.split('.').pop().toLowerCase();

  // Determine the MIME type based on the file extension
  let mimeType = 'text/plain'; // Default
  if (fileExt === 'png') mimeType = 'image/png';
  else if (fileExt === 'jpg' || fileExt === 'jpeg') mimeType = 'image/jpeg';
  else if (fileExt === 'pdf') mimeType = 'application/pdf';

  // Remove the extension from the original filename for more customization options
  const bucketPathName = bucketPath.replace(/\//g, '-');

  // Generate a unique filename
  const uniqueSuffix = uuidv4(); // Generate a new UUID
  const fileName = `${uniqueId}-${bucketPathName}-${uniqueSuffix}.${fileExt}`;

  try {
    // Read the file content as a Buffer
    const fileContent = fs.readFileSync(filepath);

    // Upload the file content to Supabase
    const { data, error } = await supabase.storage
      .from(bucketPath)
      .upload(fileName, fileContent, {
        cacheControl: '3600',
        contentType: mimeType, // Explicitly set the content type
        upsert: false, // Prevents overwriting files with the same name
      });

    if (error) {
      console.error('Failed to upload file to Supabase:', error);
      return null;
    }

    console.log('File uploaded to Supabase...');

    // Construct and return the public URL for the uploaded file
    const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketPath}/${fileName}`;
    console.log('Public URL generated...');
    return publicURL;

  } catch (err) {
    console.error('Error reading or uploading file:', err);
    return null;
  }
}

export function parseFormData(req) {
  const form = formidable({ multiples: true }); // Initialize formidable with support for multiple files

  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50 MB
      maxFieldsSize: 50 * 1024 * 1024, // 50 MB
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default prisma; // Export PrismaClient for direct use when needed