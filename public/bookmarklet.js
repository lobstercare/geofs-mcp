// GeoFS MCP Bookmarklet
// This bookmarklet injects the direct-control.js script into GeoFS
// without CORS issues by creating the script element directly in the page

(function() {
  // Create the control panel script content directly in the page
  const script = document.createElement('script');
  
  // Fetch the script content from our server
  fetch('http://localhost:3002/direct-control.js')
    .then(response => response.text())
    .then(scriptContent => {
      // Create a blob URL for the script content
      const blob = new Blob([scriptContent], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      
      // Set the script source to the blob URL
      script.src = url;
      
      // Append the script to the document
      document.head.appendChild(script);
      
      console.log('GeoFS MCP Control Panel loaded successfully!');
    })
    .catch(error => {
      console.error('Failed to load GeoFS MCP Control Panel:', error);
      alert('Failed to load GeoFS MCP Control Panel. Check the console for details.');
    });
})();
