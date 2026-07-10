const fs = require('fs');
const path = require('path');

// To parse GLB without external libraries, we can search for strings or write a simple script.
// But wait, we can just run a quick node script that prints the GLB hierarchy if we load it in three.js,
// or we can use a simpler approach: read the GLB file and search for strings of mesh names!
// All GLTF/GLB files contain mesh names as ASCII strings in the JSON chunk of the GLB.
// The JSON chunk starts near the beginning of the file.
// Let's write a simple script that reads the first 100KB of the GLB and extracts all text that looks like mesh names,
// or parses the JSON chunk!

const glbPath = path.resolve(__dirname, '../public/models/kitchen_perfect.glb');
if (!fs.existsSync(glbPath)) {
  console.error("GLB file not found at " + glbPath);
  process.exit(1);
}

const buffer = fs.readFileSync(glbPath);

// GLB header is 12 bytes: magic (4 bytes), version (4 bytes), length (4 bytes)
// Chunk 0 header is 8 bytes: chunkLength (4 bytes), chunkType (4 bytes) - should be JSON (0x4E4F534A)
const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const totalLength = buffer.readUInt32LE(8);

console.log(`GLB Magic: ${magic}, Version: ${version}, Total Length: ${totalLength}`);

const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.toString('utf8', 16, 20);

console.log(`Chunk 0 Length: ${chunkLength}, Type: ${chunkType}`);

if (chunkType === 'JSON') {
  const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
  try {
    const gltf = JSON.parse(jsonStr);
    console.log("\nNodes in GLB:");
    if (gltf.nodes) {
      gltf.nodes.forEach((node, idx) => {
        if (node.name) {
          console.log(`- Node ${idx}: "${node.name}" (mesh: ${node.mesh !== undefined ? node.mesh : 'none'})`);
        }
      });
    }
  } catch (e) {
    console.error("Failed to parse GLTF JSON:", e);
  }
}
