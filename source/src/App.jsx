import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Loader2, Camera, CameraOff, Eye, AlertCircle, Users, Brain } from 'lucide-react';
import { useObjectDetection } from './hooks/useObjectDetection';
import { useFaceRecognition } from './hooks/useFaceRecognition';
import { useWebcam } from './hooks/useWebcam';
import WebcamView from './components/WebcamView';
import FaceEnrollment from './components/FaceEnrollment';
import './App.css';

function App() {
  const {
    model,
    isLoading: modelLoading,
    predictions,
    error: detectionError,
    startDetection,
    stopDetection
  } = useObjectDetection();

  const {
    isLoading: faceModelLoading,
    isReady: faceModelReady,
    error: faceError,
    faceDetections,
    knownFaces,
    addKnownFace,
    removeKnownFace,
    startFaceDetection,
    stopFaceDetection
  } = useFaceRecognition();

  const {
    videoRef,
    isStreaming,
    error: webcamError,
    devices,
    selectedDeviceId,
    startWebcam,
    stopWebcam,
    switchCamera
  } = useWebcam();

  const [isDetecting, setIsDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState('detection');

  const handleStartCamera = async () => {
    await startWebcam();
  };

  const handleStopCamera = () => {
    stopWebcam();
    stopDetection();
    stopFaceDetection();
    setIsDetecting(false);
  };

  const handleToggleDetection = () => {
    if (isDetecting) {
      stopDetection();
      stopFaceDetection();
      setIsDetecting(false);
    } else if (videoRef.current && model && faceModelReady) {
      startDetection(videoRef.current);
      startFaceDetection(videoRef.current);
      setIsDetecting(true);
    }
  };

  // Auto-start detection when camera starts and models are loaded
  useEffect(() => {
    if (isStreaming && model && faceModelReady && !isDetecting) {
      handleToggleDetection();
    }
  }, [isStreaming, model, faceModelReady]);

  const error = detectionError || faceError || webcamError;
  const isReady = model && !modelLoading && faceModelReady && !faceModelLoading;
  const totalDetections = predictions.length + faceDetections.filter(f => f.isKnown).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Vision System
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time object detection and face recognition using TensorFlow.js
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Object Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modelLoading ? (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Ready
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Face Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {faceModelLoading ? (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Ready ({knownFaces.length} people)
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Camera Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStreaming ? (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Active
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Inactive
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Total Detections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {totalDetections}
              </div>
              <div className="text-xs text-gray-400">
                {predictions.length} objects, {faceDetections.filter(f => f.isKnown).length} people
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-900/50 border-red-700 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="detection" className="data-[state=active]:bg-blue-600">
              Live Detection
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="data-[state=active]:bg-blue-600">
              Face Enrollment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detection" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Webcam View */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Live Camera Feed</CardTitle>
                    <CardDescription className="text-gray-400">
                      Objects and faces will be detected and highlighted in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WebcamView
                      videoRef={videoRef}
                      predictions={predictions}
                      faceDetections={faceDetections}
                      isStreaming={isStreaming}
                    />
                    
                    {/* Camera Controls */}
                    <div className="flex flex-wrap gap-3 mt-6 justify-center">
                      {!isStreaming ? (
                        <Button
                          onClick={handleStartCamera}
                          disabled={!isReady}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      ) : (
                        <Button
                          onClick={handleStopCamera}
                          variant="destructive"
                        >
                          <CameraOff className="w-4 h-4 mr-2" />
                          Stop Camera
                        </Button>
                      )}

                      {devices.length > 1 && (
                        <select
                          value={selectedDeviceId || ''}
                          onChange={(e) => switchCamera(e.target.value)}
                          className="px-3 py-2 bg-slate-700 text-white rounded-md border border-slate-600"
                        >
                          {devices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                              {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detection Results */}
              <div>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Detection Results</CardTitle>
                    <CardDescription className="text-gray-400">
                      Objects and people currently visible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {totalDetections === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No detections</p>
                        <p className="text-sm">Point camera at objects or people</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Face Recognition Results */}
                        {faceDetections.filter(f => f.isKnown).map((face, index) => (
                          <div key={`face-${index}`} className="flex items-center justify-between p-3 bg-green-700/20 rounded-lg border border-green-600/30">
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {face.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                Confidence: {Math.round(face.confidence * 100)}%
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                              Person
                            </Badge>
                          </div>
                        ))}

                        {/* Unknown Faces */}
                        {faceDetections.filter(f => !f.isKnown).map((face, index) => (
                          <div key={`unknown-${index}`} className="flex items-center justify-between p-3 bg-yellow-700/20 rounded-lg border border-yellow-600/30">
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Unknown Person
                              </div>
                              <div className="text-sm text-gray-400">
                                Not in database
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                              Unknown
                            </Badge>
                          </div>
                        ))}

                        {/* Object Detection Results */}
                        {predictions.map((prediction, index) => (
                          <div key={`object-${index}`} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div>
                              <div className="font-medium text-white capitalize">
                                {prediction.class}
                              </div>
                              <div className="text-sm text-gray-400">
                                Confidence: {Math.round(prediction.score * 100)}%
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                              {Math.round(prediction.score * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="bg-slate-800/50 border-slate-700 mt-6">
                  <CardHeader>
                    <CardTitle className="text-white">How to Use</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                      <p>Click "Start Camera" to activate your webcam</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                      <p>Add known people in the "Face Enrollment" tab</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                      <p>Watch as objects and people are detected in real-time</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="enrollment" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <FaceEnrollment
                knownFaces={knownFaces}
                addKnownFace={addKnownFace}
                removeKnownFace={removeKnownFace}
                isReady={faceModelReady}
                videoRef={videoRef}
                isStreaming={isStreaming}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>Powered by TensorFlow.js, COCO-SSD, and face-api.js</p>
        </div>
      </div>
    </div>
  );
}

export default App;

