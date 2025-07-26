# Setup Instructions - AI Vision System

This guide provides detailed instructions for setting up and deploying the AI Vision System.

## 🚀 Quick Deployment (Recommended)

### Using Pre-built Files
The fastest way to get started is using the pre-built production files:

1. **Copy Files**
   ```bash
   # Copy the dist/ folder to your web server
   cp -r dist/ /var/www/html/ai-vision-system/
   ```

2. **Configure Web Server**
   - Ensure HTTPS is enabled (required for camera access)
   - Set proper MIME types for .js and .json files
   - Enable CORS if serving from different domain

3. **Access Application**
   - Open https://yourdomain.com/ai-vision-system/
   - Grant camera permissions when prompted
   - Start using the application immediately

### Example Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /ai-vision-system/ {
        alias /var/www/html/ai-vision-system/;
        
        # Enable CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept";
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Don't cache HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
}
```

## 🛠 Development Setup

### Prerequisites
- **Node.js 18+** (Download from https://nodejs.org/)
- **pnpm** (Recommended) or npm
- **Modern Browser** with camera support
- **HTTPS** for production deployment

### Installation Steps

1. **Navigate to Source Directory**
   ```bash
   cd source/
   ```

2. **Install Dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Start Development Server**
   ```bash
   # Using pnpm
   pnpm run dev
   
   # Or using npm
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to http://localhost:5173
   - Grant camera permissions
   - Start developing!

### Development Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint

# Type check (if using TypeScript)
pnpm run type-check
```

## 🔧 Configuration Options

### Environment Variables
Create a `.env` file in the source directory:

```env
# Development settings
VITE_APP_TITLE="AI Vision System"
VITE_API_BASE_URL="https://api.example.com"

# Face recognition settings
VITE_FACE_RECOGNITION_THRESHOLD=0.6
VITE_DETECTION_INTERVAL=100

# Debug settings
VITE_DEBUG_MODE=false
```

### Model Configuration
Edit `src/hooks/useFaceRecognition.js`:

```javascript
// Adjust recognition threshold (0.0 - 1.0)
// Lower values = more lenient matching
const RECOGNITION_THRESHOLD = 0.6;

// Detection confidence threshold
const DETECTION_CONFIDENCE = 0.5;

// Processing interval (milliseconds)
const PROCESSING_INTERVAL = 100;
```

### UI Customization
Modify `tailwind.config.js` for theme changes:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## 📦 Building for Production

### Build Process
```bash
cd source/
pnpm run build
```

This creates optimized files in the `dist/` directory:
- Minified JavaScript and CSS
- Optimized images and assets
- Service worker for caching (if enabled)

### Build Optimization
The build process includes:
- **Code Splitting**: Reduces initial bundle size
- **Tree Shaking**: Removes unused code
- **Asset Optimization**: Compresses images and fonts
- **Minification**: Reduces file sizes

### Bundle Analysis
To analyze bundle size:
```bash
pnpm run build --analyze
```

## 🌐 Deployment Options

### Static Hosting Services

#### Netlify
1. Connect your repository
2. Set build command: `cd source && pnpm run build`
3. Set publish directory: `source/dist`
4. Deploy automatically on push

#### Vercel
1. Import project from Git
2. Framework preset: Vite
3. Root directory: `source`
4. Deploy with zero configuration

#### GitHub Pages
1. Build locally: `pnpm run build`
2. Copy `dist/` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Traditional Web Servers

#### Apache
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/html/ai-vision-system
    
    # Enable HTTPS
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
    </Location>
    
    # Cache static assets
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

#### Docker
Create `Dockerfile`:
```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Testing

### Manual Testing Checklist
- [ ] Camera permissions granted
- [ ] Object detection working
- [ ] Face enrollment (upload)
- [ ] Face enrollment (camera)
- [ ] Face recognition accuracy
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Automated Testing
```bash
# Run unit tests
pnpm run test

# Run integration tests
pnpm run test:integration

# Run end-to-end tests
pnpm run test:e2e
```

### Performance Testing
- Use Chrome DevTools Performance tab
- Monitor memory usage during long sessions
- Test with different camera resolutions
- Verify frame rate consistency

## 🐛 Debugging

### Common Issues

#### Camera Not Working
```javascript
// Check camera permissions
navigator.permissions.query({name: 'camera'}).then(result => {
  console.log('Camera permission:', result.state);
});

// Test camera access
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => console.log('Camera working'))
  .catch(err => console.error('Camera error:', err));
```

#### Models Not Loading
```javascript
// Check model file accessibility
fetch('/models/ssd_mobilenetv1_model-weights_manifest.json')
  .then(response => console.log('Model accessible:', response.ok))
  .catch(err => console.error('Model loading error:', err));
```

#### Performance Issues
```javascript
// Monitor performance
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Performance:', entry.name, entry.duration);
  });
});
observer.observe({entryTypes: ['measure']});
```

### Debug Mode
Enable debug logging by setting:
```javascript
// In src/config.js
export const DEBUG_MODE = true;
```

## 🔒 Security Considerations

### HTTPS Requirements
- Camera access requires HTTPS in production
- Use valid SSL certificates
- Avoid self-signed certificates for public deployment

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: blob:; 
               media-src 'self' blob:;">
```

### Privacy Protection
- All processing happens client-side
- No data sent to external servers
- Face data stored locally only
- Clear data option available

## 📊 Monitoring

### Performance Metrics
- Frame processing rate (target: 10+ FPS)
- Memory usage (should remain stable)
- CPU usage (varies by device)
- Model loading time (initial load)

### Error Tracking
Implement error tracking:
```javascript
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service
});
```

## 🆙 Updates and Maintenance

### Updating Dependencies
```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update @tensorflow/tfjs
```

### Model Updates
- Download newer model versions
- Test compatibility
- Update model paths in code
- Rebuild and redeploy

### Browser Compatibility
- Test with latest browser versions
- Update polyfills if needed
- Monitor browser API changes
- Update documentation

---

**Need help?** Check the troubleshooting section in README.md or open an issue in the project repository.

