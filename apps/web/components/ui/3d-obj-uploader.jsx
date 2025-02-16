import { useState } from "react";

export default function Upload3DObj() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }
    setUploadStatus("Uploading...");
    
    // Create a new FormData instance
    const formData = new FormData();
    formData.append("file", file);
    // Add any additional fields your API might require
    // For example: formData.append("variantId", "12345");

    try {
      const res = await fetch("/api/products/upload-3d-obj", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadStatus("Upload successful!");
        console.log("AssetBundle URL:", data.publicURL);
      } else {
        const errorData = await res.json();
        setUploadStatus(`Upload failed: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("An error occurred during upload.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "1rem auto" }}>
      <h2>Upload 3D OBJ File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".obj" onChange={handleFileChange} />
        <br />
        <button type="submit" style={{ marginTop: "1rem" }}>
          Upload and Convert
        </button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}
