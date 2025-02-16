// pages/api/products/upload-3d-obj.js

import { getSessionShopId, uploadFileToSupabase, parseFormData } from "@/utils/helpers";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: false, // We disable Next.js's default body parsing to use formidable.
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify user authorization (example using session shop ID)
  const shopId = await getSessionShopId(req, res);
  if (!shopId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Parse the incoming form-data (which should include the OBJ file)
  let fields, files;
  try {
    ({ fields, files } = await parseFormData(req));
  } catch (err) {
    console.error("Error parsing form data:", err);
    return res.status(500).json({ error: "Error parsing form data" });
  }

  // Ensure a file was uploaded (using the field name "file")
  const fileArray = files.file;
  if (!fileArray || fileArray.length === 0) {
    return res.status(400).json({ error: "No OBJ file uploaded" });
  }
  const objFile = fileArray[0];

  // Prepare paths for the Unity build process.
  // We'll generate a unique asset bundle filename and store it temporarily.
  const outputFileName = `assetbundle-${Date.now()}.bundle`;
  const outputDir = path.join(os.tmpdir(), "unity-assetbundles");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputFilePath = path.join(outputDir, outputFileName);

  // Ensure required Unity environment variables are set.
  // UNITY_PATH: Full path to your Unity executable.
  // UNITY_PROJECT_PATH: Full path to the Unity project containing your build script.
  const unityExecutable = process.env.UNITY_PATH;
  const unityProjectPath = process.env.UNITY_PROJECT_PATH;
  if (!unityExecutable || !unityProjectPath) {
    return res.status(500).json({ error: "Unity environment variables not set" });
  }

  // Construct the command to run Unity in batch mode.
  // Your Unity project should have a build script with a static method:
  // e.g., MyNamespace.AssetBundleBuilder.BuildFromOBJ
  // that reads command line args -objPath and -outputPath.
  const cmd = `"${unityExecutable}" -batchmode -nographics -quit -executeMethod MyNamespace.AssetBundleBuilder.BuildFromOBJ -projectPath "${unityProjectPath}" -objPath "${objFile.filepath}" -outputPath "${outputFilePath}"`;
  console.log("Executing Unity command:", cmd);

  // Execute the Unity build process.
  try {
    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error("Unity build process error:", error);
          console.error("Stderr:", stderr);
          return reject(error);
        }
        console.log("Unity build process output:", stdout);
        resolve();
      });
    });
  } catch (err) {
    return res.status(500).json({ error: "Error during Unity build process" });
  }

  // Confirm that the AssetBundle was generated.
  if (!fs.existsSync(outputFilePath)) {
    return res.status(500).json({ error: "AssetBundle not generated" });
  }

  // Use a unique identifier (e.g., from a form field or session) for naming.
  const uniqueId = fields.variantId?.[0] || shopId || "default";

  // Upload the generated AssetBundle to Supabase storage.
  let publicURL;
  try {
    publicURL = await uploadFileToSupabase(
      null, // Not needed here since we use the filepath directly.
      outputFilePath,
      outputFileName,
      uniqueId,
      "products/product-3d-virtual-fitting"
    );
  } catch (err) {
    console.error("Error uploading AssetBundle to Supabase:", err);
    return res.status(500).json({ error: "Error uploading AssetBundle to Supabase" });
  }

  return res.status(200).json({
    message: "AssetBundle built and uploaded successfully",
    publicURL,
  });
}
