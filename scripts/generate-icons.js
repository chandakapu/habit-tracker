const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for the habit tracker
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3B82F6"/>
  <circle cx="256" cy="256" r="120" fill="white"/>
  <path d="M200 256L240 296L320 216" stroke="#3B82F6" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="150" cy="150" r="20" fill="white" opacity="0.8"/>
  <circle cx="362" cy="150" r="15" fill="white" opacity="0.6"/>
  <circle cx="362" cy="362" r="25" fill="white" opacity="0.7"/>
</svg>
`;

// Function to create a simple PNG-like file (this is a placeholder)
function createPlaceholderIcon(size, filename) {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // For now, we'll create a simple text file as a placeholder
  // In a real scenario, you'd use a library like sharp or canvas to generate actual PNG files
  const placeholder = `# Placeholder for ${size}x${size} icon
# Replace this with an actual PNG file
# You can use online tools or image editing software to create proper icons`;
  
  fs.writeFileSync(path.join(publicDir, filename), placeholder);
  console.log(`Created placeholder for ${filename}`);
}

// Create placeholder files for the required icons
createPlaceholderIcon(192, 'icon-192x192.png');
createPlaceholderIcon(512, 'icon-512x512.png');

console.log('\nPWA icon placeholders created!');
console.log('Please replace the placeholder files in the public directory with actual PNG icons.');
console.log('You can use online tools like:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.favicon-generator.org/');
console.log('- Or create them manually in an image editor'); 