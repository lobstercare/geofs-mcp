// GeoFS MCP Bookmarklet
// This script can be converted to a bookmarklet to easily load the direct-control.js script in GeoFS
// To use: Create a bookmark with this entire script as the URL (prefixed with javascript:)

(function() {
  // Create a script element
  var script = document.createElement('script');
  
  // Set the source to our local server
  script.src = 'http://localhost:3002/direct-control.js';
  
  // Add error handling
  script.onerror = function() {
    alert('Error loading MCP script. Make sure the MCP server is running on port 3002.');
  };
  
  // Add success message
  script.onload = function() {
    console.log('MCP script loaded successfully!');
  };
  
  // Append to document head
  document.head.appendChild(script);
  
  // Provide feedback
  console.log('Attempting to load MCP script from localhost:3002...');
})();
