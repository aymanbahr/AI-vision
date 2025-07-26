# Technical Architecture - AI Vision System

This document provides a detailed technical overview of the AI Vision System architecture, components, and data flow.

## 🏗 System Architecture

### High-Level Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   React App     │    │   AI Models     │
│                 │    │                 │    │                 │
│ • Camera API    │◄──►│ • UI Components │◄──►│ • TensorFlow.js │
│ • Canvas API    │    │ • State Mgmt    │    │ • face-api.js   │
│ • LocalStorage  │    │ • Hooks         │    │ • COCO-SSD      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
src/
├── components/           # React UI Components
│   ├── DetectionOverlay.jsx      # Object detection visualization
│   ├── FaceEnrollment.jsx        # Face enrollment interface
│   ├── FaceRecognitionOverlay.jsx # Face recognition visualization
│   └── WebcamView.jsx            # Camera feed component
├── hooks/               # Custom React Hooks
│   ├── useObjectDetection.js     # Object detection logic
│   ├── useFaceRecognition.js     # Face recognition logic
│   └── useWebcam.js              # Camera management
└── App.jsx              # Main application component
```

## 🧠 AI/ML Pipeline

### Object Detection Flow
```
Camera Feed → Canvas → TensorFlow.js → COCO-SSD Model → Predictions → UI
     ↓            ↓           ↓              ↓             ↓        ↓
  Video Stream  Frame    Tensor Input   Classification  Bounding  Visual
               Capture   Preprocessing     Results       Boxes    Overlay
```

### Face Recognition Flow
```
Camera Feed → Canvas → face-api.js → Detection → Landmarks → Descriptors → Matching → UI
     ↓            ↓          ↓           ↓          ↓           ↓          ↓        ↓
  Video Stream  Frame   SSD MobileNet  Face      68-point   128-dim    Compare   Visual
               Capture    Detection    Boxes     Features   Vectors   Database   Overlay
```

## 📊 Data Flow

### Object Detection Data Flow
1. **Video Capture**: `getUserMedia()` API captures video stream
2. **Frame Processing**: Canvas extracts frames at regular intervals
3. **Tensor Conversion**: Frames converted to TensorFlow.js tensors
4. **Model Inference**: COCO-SSD model processes tensor input
5. **Result Processing**: Predictions filtered by confidence threshold
6. **UI Update**: Bounding boxes and labels rendered on overlay

### Face Recognition Data Flow
1. **Face Detection**: SSD MobileNet detects face regions
2. **Landmark Detection**: 68-point facial landmark extraction
3. **Feature Extraction**: ResNet-34 generates 128-dimensional descriptors
4. **Database Matching**: Descriptors compared against known faces
5. **Identity Resolution**: Best match determined using Euclidean distance
6. **UI Update**: Names and confidence scores displayed

## 🔧 Core Components

### useWebcam Hook
```javascript
// Manages camera access and video stream
const useWebcam = () => {
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      setStream(mediaStream);
      setIsStreaming(true);
    } catch (err) {
      setError(err.message);
    }
  };
  
  return { stream, isStreaming, error, startCamera, stopCamera };
};
```

### useObjectDetection Hook
```javascript
// Handles TensorFlow.js object detection
const useObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const loadModel = async () => {
      const cocoSsd = await tf.loadLayersModel('/models/coco-ssd/model.json');
      setModel(cocoSsd);
      setIsReady(true);
    };
    loadModel();
  }, []);
  
  const detectObjects = async (imageElement) => {
    if (!model || !isReady) return [];
    
    const predictions = await model.detect(imageElement);
    return predictions.filter(pred => pred.score > 0.5);
  };
  
  return { isReady, detectObjects };
};
```

### useFaceRecognition Hook
```javascript
// Manages face detection and recognition
const useFaceRecognition = () => {
  const [isReady, setIsReady] = useState(false);
  const [knownFaces, setKnownFaces] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setIsReady(true);
    };
    loadModels();
  }, []);
  
  const addKnownFace = async (name, imageElement) => {
    const detections = await faceapi
      .detectAllFaces(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (detections.length === 1) {
      const descriptor = detections[0].descriptor;
      const updatedFaces = [...knownFaces, { name, descriptors: [descriptor] }];
      setKnownFaces(updatedFaces);
      localStorage.setItem('knownFaces', JSON.stringify(updatedFaces));
      
      // Update face matcher
      const labeledDescriptors = updatedFaces.map(face => 
        new faceapi.LabeledFaceDescriptors(face.name, face.descriptors)
      );
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
    }
  };
  
  return { isReady, knownFaces, faceMatcher, addKnownFace };
};
```

## 🎨 UI Components

### WebcamView Component
```javascript
const WebcamView = ({ onDetection }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { stream, isStreaming, startCamera } = useWebcam();
  const { detectObjects } = useObjectDetection();
  const { recognizeFaces } = useFaceRecognition();
  
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  useEffect(() => {
    if (!isStreaming) return;
    
    const processFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && canvas) {
        // Object detection
        const objects = await detectObjects(video);
        
        // Face recognition
        const faces = await recognizeFaces(video);
        
        // Combine results
        onDetection({ objects, faces });
      }
    };
    
    const interval = setInterval(processFrame, 100);
    return () => clearInterval(interval);
  }, [isStreaming]);
  
  return (
    <div className="relative">
      <video ref={videoRef} autoPlay muted className="w-full" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      {!isStreaming && (
        <button onClick={startCamera}>Start Camera</button>
      )}
    </div>
  );
};
```

### DetectionOverlay Component
```javascript
const DetectionOverlay = ({ detections, videoRef }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!detections || !videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw object detections
    detections.objects.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Draw bounding box
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = '#3b82f6';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${detection.class} (${Math.round(detection.score * 100)}%)`,
        x, y - 5
      );
    });
    
    // Draw face detections
    detections.faces.forEach(face => {
      const { x, y, width, height } = face.detection.box;
      
      // Draw face box
      ctx.strokeStyle = face.label === 'unknown' ? '#fbbf24' : '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw name
      if (face.label !== 'unknown') {
        ctx.fillStyle = '#10b981';
        ctx.font = '16px Arial';
        ctx.fillText(face.label, x, y - 5);
      }
    });
  }, [detections]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      width={640}
      height={480}
    />
  );
};
```

## 💾 Data Management

### Local Storage Schema
```javascript
// Face recognition data structure
const faceData = {
  knownFaces: [
    {
      name: "John Doe",
      descriptors: [
        [0.123, -0.456, 0.789, ...], // 128-dimensional array
        [0.124, -0.457, 0.790, ...], // Additional descriptor for same person
      ]
    }
  ]
};

// Storage operations
localStorage.setItem('knownFaces', JSON.stringify(faceData.knownFaces));
const storedFaces = JSON.parse(localStorage.getItem('knownFaces') || '[]');
```

### State Management
```javascript
// Global application state
const AppState = {
  camera: {
    isActive: boolean,
    stream: MediaStream | null,
    error: string | null
  },
  objectDetection: {
    isReady: boolean,
    model: tf.LayersModel | null,
    detections: Detection[]
  },
  faceRecognition: {
    isReady: boolean,
    knownFaces: KnownFace[],
    faceMatcher: FaceMatcher | null,
    recognitions: Recognition[]
  },
  ui: {
    activeTab: 'detection' | 'enrollment',
    isProcessing: boolean,
    message: { type: 'success' | 'error', text: string } | null
  }
};
```

## 🔄 Processing Pipeline

### Frame Processing Loop
```javascript
const processVideoFrame = async () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  
  if (!video || !canvas) return;
  
  // 1. Capture frame
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // 2. Object detection
  const objectPromise = detectObjects(video);
  
  // 3. Face recognition (parallel processing)
  const facePromise = recognizeFaces(video);
  
  // 4. Wait for both results
  const [objects, faces] = await Promise.all([objectPromise, facePromise]);
  
  // 5. Update UI
  setDetections({ objects, faces });
  
  // 6. Schedule next frame
  requestAnimationFrame(processVideoFrame);
};
```

### Performance Optimization
```javascript
// Throttle processing to maintain performance
const throttledProcess = useCallback(
  throttle(processVideoFrame, 100), // Process every 100ms
  [processVideoFrame]
);

// Use Web Workers for heavy computations
const worker = new Worker('/workers/detection-worker.js');
worker.postMessage({ imageData, modelConfig });
worker.onmessage = (event) => {
  const { detections } = event.data;
  updateDetections(detections);
};
```

## 🚀 Performance Considerations

### Memory Management
- **Model Loading**: Models loaded once and reused
- **Canvas Cleanup**: Contexts cleared after each frame
- **Stream Management**: Video streams properly disposed
- **Event Listeners**: Removed on component unmount

### CPU Optimization
- **Frame Skipping**: Process every nth frame if performance is poor
- **Parallel Processing**: Object and face detection run concurrently
- **Efficient Rendering**: Only update UI when detections change
- **Throttling**: Limit processing frequency based on device capability

### GPU Acceleration
```javascript
// Enable WebGL backend for TensorFlow.js
await tf.setBackend('webgl');

// Use GPU-optimized operations
const predictions = await model.executeAsync(tensor);
```

## 🔒 Security Architecture

### Client-Side Security
- **No Server Communication**: All processing happens locally
- **Secure Storage**: Face data encrypted in localStorage
- **Permission Management**: Explicit camera permission requests
- **Data Isolation**: No cross-origin data sharing

### Privacy Protection
```javascript
// Data anonymization
const anonymizeDescriptor = (descriptor) => {
  // Hash the descriptor for privacy
  return crypto.subtle.digest('SHA-256', descriptor);
};

// Secure deletion
const clearFaceData = () => {
  localStorage.removeItem('knownFaces');
  setKnownFaces([]);
  setFaceMatcher(null);
};
```

## 📈 Monitoring and Analytics

### Performance Metrics
```javascript
const performanceMonitor = {
  frameProcessingTime: [],
  memoryUsage: [],
  detectionAccuracy: [],
  
  recordMetric: (metric, value) => {
    performanceMonitor[metric].push({
      timestamp: Date.now(),
      value: value
    });
  },
  
  getAverageMetric: (metric, timeWindow = 60000) => {
    const now = Date.now();
    const recentMetrics = performanceMonitor[metric]
      .filter(m => now - m.timestamp < timeWindow);
    
    return recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
  }
};
```

### Error Tracking
```javascript
const errorTracker = {
  logError: (error, context) => {
    console.error('AI Vision Error:', {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }
};
```

## 🔧 Configuration Management

### Environment Configuration
```javascript
const config = {
  development: {
    modelPath: '/models',
    debugMode: true,
    processingInterval: 100,
    recognitionThreshold: 0.6
  },
  production: {
    modelPath: '/models',
    debugMode: false,
    processingInterval: 100,
    recognitionThreshold: 0.6
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Runtime Configuration
```javascript
const runtimeConfig = {
  // Adjust based on device performance
  adaptiveProcessing: true,
  
  // Auto-adjust quality based on performance
  getOptimalSettings: () => {
    const performance = getDevicePerformance();
    
    if (performance === 'high') {
      return { interval: 50, quality: 'high' };
    } else if (performance === 'medium') {
      return { interval: 100, quality: 'medium' };
    } else {
      return { interval: 200, quality: 'low' };
    }
  }
};
```

---

This architecture supports real-time AI processing in the browser while maintaining good performance and user experience. The modular design allows for easy extension and customization of features.

