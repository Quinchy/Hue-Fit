// pages/api/fashn/try-on.js

import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

const FASHN_API_KEY = process.env.FASHN_API_KEY;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formidable = await import("formidable");
    const { IncomingForm } = formidable;

    const form = new IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Log the received fields and files
    console.log("Received fields:", fields);
    console.log("Received files:", files);

    // Extract fields, handling arrays
    const pngClotheURL = Array.isArray(fields.pngClotheURL) ? fields.pngClotheURL[0] : fields.pngClotheURL;
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    const mode = Array.isArray(fields.mode) ? fields.mode[0] : fields.mode;

    // Handle files.model being an array or single object
    let modelFile = files.model;
    if (Array.isArray(modelFile)) {
      modelFile = modelFile[0];
    }

    if (!pngClotheURL || !type || !mode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!modelFile || !modelFile.originalFilename || !modelFile.filepath) {
      return res.status(400).json({ error: "Invalid or missing model file" });
    }

    // Read the model image file
    const modelBuffer = fs.readFileSync(modelFile.filepath);
    const modelBase64 = modelBuffer.toString("base64");
    const modelMimeType = "image/png"; // Force to image/png
    const modelDataUrl = `data:${modelMimeType};base64,${modelBase64}`;

    // Log the model data URL
    console.log("Model Data URL:", modelDataUrl);

    // Validate garment_image URL or convert to data URL if needed
    let garmentImage = pngClotheURL;
    if (typeof pngClotheURL === "string" && pngClotheURL.startsWith("data:image/")) {
      garmentImage = pngClotheURL;
    } else {
      // Ensure the garment_image URL is valid and accessible
      // You might want to perform additional checks here
      // For now, assume it's a valid URL
      console.log("Garment Image URL:", garmentImage);
    }

    // Map type to category
    let category = "";
    if (type === "UPPERWEAR" || type === "OUTERWEAR") {
      category = "tops";
    } else if (type === "LOWERWEAR") {
      category = "bottoms";
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    // Prepare payload for FASHN API
    const payload = {
      model_image: modelDataUrl,
      garment_image: garmentImage,
      category: category,
      mode: mode,
      nsfw_filter: true,
      garment_photo_type: "auto",
      num_samples: 1,
    };

    // Log the payload being sent to FASHN API
    console.log("Payload to FASHN API:", payload);

    // Initiate try-on prediction
    const runResponse = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FASHN_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const runData = await runResponse.json();

    // Log the response from FASHN API /run
    console.log("FASHN API /run response:", runData);

    if (!runResponse.ok) {
      console.error("FASHN API run error:", runData);
      return res.status(runResponse.status).json({ error: runData.message || "Try-On initiation failed" });
    }

    const predictionId = runData.id;

    // Poll for prediction status
    let status = "starting";
    let output = null;
    const maxRetries = 10;
    let retries = 0;

    while (status !== "completed" && status !== "failed" && retries < maxRetries) {
      await sleep(5000); // wait for 5 seconds before next poll

      const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${FASHN_API_KEY}`,
        },
      });

      const statusData = await statusResponse.json();

      // Log the response from FASHN API /status
      console.log(`FASHN API /status response (attempt ${retries + 1}):`, statusData);

      if (!statusResponse.ok) {
        console.error("FASHN API status error:", statusData);
        return res.status(statusResponse.status).json({ error: statusData.message || "Error fetching prediction status" });
      }

      status = statusData.status;

      if (status === "completed") {
        output = statusData.output && statusData.output[0];
      } else if (status === "failed") {
        return res.status(500).json({ error: statusData.error?.message || "Try-On failed" });
      }

      retries += 1;
    }

    if (status !== "completed") {
      return res.status(500).json({ error: "Try-On timed out" });
    }

    if (!output) {
      return res.status(500).json({ error: "No output image returned from FASHN API" });
    }

    // Log the final output image URL
    console.log("Final output image URL:", output);

    return res.status(200).json({ resultImage: output });
  } catch (error) {
    console.error("Try-On error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
