# AI Vision System - Object Detection & Face Recognition

A web application that combines real-time object detection with personalized face recognition using TensorFlow.js and face-api.js.

## 🌟 Features

### Object Detection
- **Real-time Detection**: Identifies 80 different object types using COCO-SSD model
- **Live Video Processing**: Processes webcam feed at interactive frame rates
- **Visual Feedback**: Highlights detected objects with bounding boxes and labels
- **Confidence Scores**: Shows detection confidence percentages

### Face Recognition
- **Face Detection**: Automatically detects faces in real-time video
- **Person Identification**: Recognizes specific people you've enrolled
- **Face Enrollment System**: Easy-to-use interface for adding known people
- **Multiple Enrollment Methods**: Upload photos or capture from live camera
- **High Accuracy**: 99.38% accuracy using ResNet-34 face recognition model

### User Interface
- **Modern Design**: Professional, responsive interface
- **Tabbed Navigation**: Separate tabs for detection and enrollment
- **Status Dashboard**: Real-time status of AI systems and camera
- **Mobile Friendly**: Works on both desktop and mobile devices
- **Dark Theme**: Easy on the eyes with purple gradient design

## 🚀 Live Demo

**Deployed Application**: https://xxxx

## 📦 Package Contents

This package contains:

- **`source/`** - Complete source code with all React components
- **`dist/`** - Production-ready built files for deployment
- **`models/`** - Pre-trained AI model files
- **Documentation** - Setup instructions and technical details

## 🛠 Technical Stack

### Frontend Framework
- **React 18** with Vite build system
- **Tailwind CSS** for styling
- **Shadcn/UI** components
- **Lucide React** icons

### AI/ML Libraries
- **TensorFlow.js** - Object detection engine
- **COCO-SSD Model** - Pre-trained object detection (80 classes)
- **face-api.js** - Face detection and recognition
- **SSD MobileNet V1** - Fast face detection model
- **ResNet-34** - High-accuracy face recognition model

### Browser APIs
- **MediaDevices API** - Webcam access
- **Canvas API** - Image processing
- **LocalStorage API** - Face data persistence

## 🏃‍♂️ Quick Start

### Option 1: Use Pre-built Files (Recommended)
1. Copy the `dist/` folder to your web server
2. Serve the files via HTTP/HTTPS (required for camera access)
3. Open in a modern web browser
4. Grant camera permissions when prompted

### Option 2: Development Setup
1. Navigate to the `source/` directory
2. Install dependencies: `npm install` or `pnpm install`
3. Start development server: `npm run dev` or `pnpm run dev`
4. Open http://localhost:5173 in your browser

## 📋 System Requirements

### Browser Support
- **Chrome 91+** (Recommended)
- **Firefox 90+**
- **Safari 14+**
- **Edge 91+**

### Hardware Requirements
- **Camera**: Webcam or built-in camera
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: Modern multi-core processor
- **Network**: Internet connection for initial model loading

### Server Requirements (for deployment)
- **HTTPS**: Required for camera access in production
- **Static File Server**: Apache, Nginx, or any static hosting service
- **CORS**: Must allow cross-origin requests for model files

## 🎯 How to Use

### 1. Object Detection
1. Click "Start Camera" to activate your webcam
2. Point camera at objects you want to detect
3. Watch as objects are identified with bounding boxes and labels
4. View detection results in the right panel

### 2. Face Recognition Setup
1. Go to the "Face Enrollment" tab
2. Enter the person's name
3. Choose one of two enrollment methods:
   - **Upload Photo**: Select a clear photo with one face
   - **Camera Capture**: Use live camera to capture face
4. Repeat for each person you want to recognize

### 3. Live Face Recognition
1. Return to "Live Detection" tab
2. Known people will be highlighted in green with their names
3. Unknown faces will be highlighted in yellow
4. View recognition results in the detection panel

## 🔧 Configuration

### Model Files
The application requires these face-api.js model files (included):
- `ssd_mobilenetv1_model-*` - Face detection
- `face_landmark_68_model-*` - Facial landmarks
- `face_recognition_model-*` - Face recognition descriptors

### Performance Tuning
Edit `src/hooks/useFaceRecognition.js` to adjust:
- **Recognition Threshold**: Default 0.6 (lower = more lenient)
- **Detection Confidence**: Minimum confidence for face detection
- **Processing Interval**: Frame processing frequency

### Styling Customization
- Modify `src/App.jsx` for layout changes
- Edit Tailwind classes for color scheme
- Update `index.html` for meta tags and title

## 🚨 Troubleshooting

### Camera Issues
- **Permission Denied**: Grant camera access in browser settings
- **Camera Not Found**: Check if camera is connected and not in use
- **HTTPS Required**: Camera access requires HTTPS in production

### Performance Issues
- **Slow Detection**: Reduce video resolution or processing frequency
- **High CPU Usage**: Close other applications or use a more powerful device
- **Memory Leaks**: Refresh page if performance degrades over time

### Face Recognition Issues
- **No Face Detected**: Use clear, well-lit photos with visible faces
- **Poor Recognition**: Add multiple photos of the same person
- **False Positives**: Increase recognition threshold in configuration

## 📁 File Structure

```
ai-vision-system-package/
├── source/                 # Source code
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── ...
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies
│   └── ...
├── dist/                   # Production build
│   ├── assets/             # Compiled CSS/JS
│   ├── models/             # AI model files
│   └── index.html          # Entry point
├── models/                 # AI model files (reference)
└── README.md              # This file
```

## 🔒 Privacy & Security

### Data Storage
- **Face Data**: Stored locally in browser localStorage
- **No Server Upload**: All processing happens in the browser
- **User Control**: Users can clear data anytime

### Privacy Features
- **Local Processing**: No data sent to external servers
- **Temporary Storage**: Face descriptors only, not actual images
- **User Consent**: Camera access requires explicit permission

## 🤝 Contributing

This is a complete, standalone application. To modify:

1. Edit source files in the `source/` directory
2. Test changes locally with `npm run dev`
3. Build production version with `npm run build`
4. Deploy the `dist/` folder to your server

## 📄 License

This project uses open-source libraries:
- TensorFlow.js (Apache 2.0)
- face-api.js (MIT)
- React (MIT)
- Tailwind CSS (MIT)

## 🆘 Support

For technical issues:
1. Check browser console for error messages
2. Verify camera permissions are granted
3. Ensure HTTPS is used for production deployment
4. Test with different browsers if issues persist

## 🔄 Version History

- **v1.0** - Initial object detection functionality
- **v1.1** - Added face recognition capabilities
- **v1.2** - Improved user interface and error handling
- **v1.3** - Enhanced face enrollment system with better feedback

---

**Built with ❤️ using React, TensorFlow.js, and face-api.js**

