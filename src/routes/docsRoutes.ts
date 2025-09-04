import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * Serve OpenAPI specification in YAML format
 */
router.get('/openapi.yaml', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const openApiPath = path.join(__dirname, '../../openapi.yaml');
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');
    
    res.set({
      'Content-Type': 'application/x-yaml',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.status(200).send(openApiContent);
  } catch (error) {
    console.error('Failed to serve OpenAPI YAML:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load OpenAPI specification'
    });
  }
}));

/**
 * Serve OpenAPI specification in JSON format
 */
router.get('/openapi.json', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const openApiPath = path.join(__dirname, '../../openapi.yaml');
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');
    const openApiJson = yaml.load(openApiContent);
    
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.status(200).json(openApiJson);
  } catch (error) {
    console.error('Failed to serve OpenAPI JSON:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load OpenAPI specification'
    });
  }
}));

/**
 * Serve Swagger UI for API documentation
 */
router.get('/docs', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple JWT Generator API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .swagger-ui .topbar {
      background-color: #1b1b1b;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: #f0f0f0;
    }
    .loading {
      text-align: center;
      padding: 50px;
      font-size: 18px;
      color: #666;
    }
    .error {
      text-align: center;
      padding: 50px;
      color: #d32f2f;
      background: #ffebee;
      border: 1px solid #ffcdd2;
      border-radius: 4px;
      margin: 20px;
    }
  </style>
</head>
<body>
  <div id="swagger-ui">
    <div class="loading">Loading API Documentation...</div>
  </div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = function() {
      console.log('Initializing Swagger UI...');
      
      // Check if required scripts loaded
      if (typeof SwaggerUIBundle === 'undefined') {
        console.error('SwaggerUIBundle not loaded');
        document.getElementById('swagger-ui').innerHTML = 
          '<div class="error"><h2>Failed to load Swagger UI</h2><p>External scripts could not be loaded. Check your internet connection.</p></div>';
        return;
      }
      
      // Get the base URL dynamically
      const baseUrl = window.location.protocol + '//' + window.location.host;
      const openApiUrl = baseUrl + '/api/docs/openapi.json';
      
      console.log('Loading OpenAPI spec from:', openApiUrl);
      
      try {
        const ui = SwaggerUIBundle({
          url: openApiUrl,
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
          requestInterceptor: function(request) {
            console.log('API Request:', request.method, request.url);
            return request;
          },
          responseInterceptor: function(response) {
            console.log('API Response:', response.status, response.url);
            return response;
          },
          onComplete: function() {
            console.log('✅ Swagger UI loaded successfully');
          },
          onFailure: function(error) {
            console.error('❌ Failed to load Swagger UI:', error);
            document.getElementById('swagger-ui').innerHTML = 
              '<div class="error">' +
              '<h2>Failed to load API documentation</h2>' +
              '<p><strong>Error:</strong> ' + (error.message || error.toString()) + '</p>' +
              '<p><strong>OpenAPI URL:</strong> <a href="' + openApiUrl + '" target="_blank">' + openApiUrl + '</a></p>' +
              '<p>Please check:</p>' +
              '<ul style="text-align: left; display: inline-block;">' +
              '<li>Network connectivity</li>' +
              '<li>Server is running</li>' +
              '<li>OpenAPI endpoint is accessible</li>' +
              '</ul>' +
              '</div>';
          }
        });
        
        console.log('Swagger UI initialized:', ui);
        
      } catch (error) {
        console.error('Exception during Swagger UI initialization:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<div class="error">' +
          '<h2>Swagger UI Initialization Error</h2>' +
          '<p>' + error.message + '</p>' +
          '</div>';
      }
      
      // Add a timeout to check if Swagger UI loaded properly
      setTimeout(function() {
        const swaggerContainer = document.getElementById('swagger-ui');
        const content = swaggerContainer.innerHTML;
        
        if (content.includes('Loading API Documentation...')) {
          console.warn('⚠️ Swagger UI may not have loaded - still showing loading message');
          swaggerContainer.innerHTML = 
            '<div class="error">' +
            '<h2>Swagger UI Loading Timeout</h2>' +
            '<p>The API documentation is taking too long to load.</p>' +
            '<p><a href="' + openApiUrl + '" target="_blank">View Raw OpenAPI Specification</a></p>' +
            '</div>';
        } else if (!content.includes('swagger-ui')) {
          console.log('✅ Swagger UI content appears to have loaded');
        }
      }, 10000);
    };
    
    // Add error handling for script loading
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.error('Script error:', {msg, url, lineNo, columnNo, error});
      return false;
    };
  </script>
</body>
</html>
  `;
  
  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache'
  });
  res.status(200).send(swaggerHtml);
}));

/**
 * Serve Swagger UI with inline OpenAPI spec (alternative approach)
 */
router.get('/docs-inline', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Load the OpenAPI spec directly
    const openApiPath = path.join(__dirname, '../../openapi.yaml');
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');
    const openApiJson = yaml.load(openApiContent);
    
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple JWT Generator API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .swagger-ui .topbar {
      background-color: #1b1b1b;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: #f0f0f0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = function() {
      console.log('Loading Swagger UI with inline spec...');
      
      const spec = ${JSON.stringify(openApiJson, null, 2)};
      
      try {
        const ui = SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          tryItOutEnabled: true,
          onComplete: function() {
            console.log('✅ Swagger UI loaded successfully with inline spec');
          },
          onFailure: function(error) {
            console.error('❌ Failed to load Swagger UI:', error);
            document.getElementById('swagger-ui').innerHTML = 
              '<div style="padding: 20px; text-align: center; color: #d32f2f;">' +
              '<h2>Failed to load API documentation</h2>' +
              '<p>Error: ' + (error.message || error.toString()) + '</p>' +
              '</div>';
          }
        });
        
        console.log('Swagger UI initialized with inline spec');
        
      } catch (error) {
        console.error('Exception during Swagger UI initialization:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<div style="padding: 20px; text-align: center; color: #d32f2f;">' +
          '<h2>Swagger UI Initialization Error</h2>' +
          '<p>' + error.message + '</p>' +
          '</div>';
      }
    };
  </script>
</body>
</html>
    `;
    
    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    });
    res.status(200).send(swaggerHtml);
    
  } catch (error) {
    console.error('Failed to serve inline Swagger UI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load API documentation'
    });
  }
}));

/**
 * API documentation landing page with links
 */
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.status(200).json({
    success: true,
    message: 'Simple JWT Generator API Documentation',
    version: '1.0.0',
    documentation: {
      swagger_ui: `${baseUrl}/api/docs/docs`,
      openapi_json: `${baseUrl}/api/docs/openapi.json`,
      openapi_yaml: `${baseUrl}/api/docs/openapi.yaml`
    },
    aws_api_gateway: {
      compatible: true,
      features: [
        'Request validation',
        'Response mapping',
        'Caching for JWKS endpoints',
        'Stage variables support',
        'Custom error responses'
      ]
    },
    quick_start: {
      demo_token: `curl -X POST ${baseUrl}/api/token/generate -H "Content-Type: application/json" -d '{"username":"demo","email":"demo@example.com"}'`,
      validate_token: `curl -X POST ${baseUrl}/api/token/validate -H "Content-Type: application/json" -d '{"token":"YOUR_JWT_TOKEN"}'`,
      get_jwks: `curl ${baseUrl}/api/jwks`,
      health_check: `curl ${baseUrl}/health`
    }
  });
}));

/**
 * Debug route for testing Swagger UI components
 */
router.get('/debug', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const debugHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Swagger UI Debug</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .test { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
    .success { background: #d4edda; border-color: #c3e6cb; }
    .error { background: #f8d7da; border-color: #f5c6cb; }
    .info { background: #d1ecf1; border-color: #bee5eb; }
  </style>
</head>
<body>
  <h1>Swagger UI Debug Page</h1>
  
  <div class="test info">
    <h3>1. Testing OpenAPI JSON Endpoint</h3>
    <p>URL: <a href="/api/docs/openapi.json" target="_blank">/api/docs/openapi.json</a></p>
    <button onclick="testOpenApiJson()">Test OpenAPI JSON</button>
    <div id="openapi-result"></div>
  </div>
  
  <div class="test info">
    <h3>2. Testing External CDN Resources</h3>
    <button onclick="testCdnResources()">Test CDN Loading</button>
    <div id="cdn-result"></div>
  </div>
  
  <div class="test info">
    <h3>3. Minimal Swagger UI Test</h3>
    <button onclick="loadSwaggerUI()">Load Swagger UI</button>
    <div id="swagger-ui-test" style="border: 1px solid #ccc; min-height: 200px; margin-top: 10px;"></div>
  </div>
  
  <script>
    function testOpenApiJson() {
      const resultDiv = document.getElementById('openapi-result');
      resultDiv.innerHTML = '<p>Testing...</p>';
      
      fetch('/api/docs/openapi.json')
        .then(response => {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(data => {
          resultDiv.innerHTML = '<p class="success">✅ OpenAPI JSON loaded successfully</p>' +
                               '<p>Title: ' + data.info.title + '</p>' +
                               '<p>Paths: ' + Object.keys(data.paths).length + '</p>';
        })
        .catch(error => {
          resultDiv.innerHTML = '<p class="error">❌ Failed to load OpenAPI JSON: ' + error.message + '</p>';
        });
    }
    
    function testCdnResources() {
      const resultDiv = document.getElementById('cdn-result');
      resultDiv.innerHTML = '<p>Testing CDN resources...</p>';
      
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css';
      cssLink.onload = () => {
        resultDiv.innerHTML += '<p class="success">✅ CSS loaded successfully</p>';
        
        const script1 = document.createElement('script');
        script1.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
        script1.onload = () => {
          resultDiv.innerHTML += '<p class="success">✅ Swagger UI Bundle loaded</p>';
          
          const script2 = document.createElement('script');
          script2.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js';
          script2.onload = () => {
            resultDiv.innerHTML += '<p class="success">✅ All CDN resources loaded successfully</p>';
          };
          script2.onerror = () => {
            resultDiv.innerHTML += '<p class="error">❌ Failed to load Standalone Preset</p>';
          };
          document.head.appendChild(script2);
        };
        script1.onerror = () => {
          resultDiv.innerHTML += '<p class="error">❌ Failed to load Swagger UI Bundle</p>';
        };
        document.head.appendChild(script1);
      };
      cssLink.onerror = () => {
        resultDiv.innerHTML = '<p class="error">❌ Failed to load CSS</p>';
      };
      document.head.appendChild(cssLink);
    }
    
    function loadSwaggerUI() {
      if (typeof SwaggerUIBundle === 'undefined') {
        document.getElementById('swagger-ui-test').innerHTML = 
          '<p class="error">❌ SwaggerUIBundle not available. Load CDN resources first.</p>';
        return;
      }
      
      try {
        const ui = SwaggerUIBundle({
          url: '/api/docs/openapi.json',
          dom_id: '#swagger-ui-test',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "StandaloneLayout",
          onComplete: function() {
            console.log('✅ Swagger UI loaded in test area');
          },
          onFailure: function(error) {
            console.error('❌ Swagger UI failed in test area:', error);
            document.getElementById('swagger-ui-test').innerHTML = 
              '<p class="error">❌ Swagger UI failed: ' + error.message + '</p>';
          }
        });
      } catch (error) {
        document.getElementById('swagger-ui-test').innerHTML = 
          '<p class="error">❌ Exception: ' + error.message + '</p>';
      }
    }
  </script>
</body>
</html>
  `;
  
  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache'
  });
  res.status(200).send(debugHtml);
}));

export default router;
