import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Upload, UserPlus, Trash2, AlertCircle, CheckCircle, Camera } from 'lucide-react';

const FaceEnrollment = ({ 
  knownFaces, 
  addKnownFace, 
  removeKnownFace, 
  isReady,
  videoRef,
  isStreaming 
}) => {
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [captureMode, setCaptureMode] = useState(false);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a person\'s name first' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          await addKnownFace(name.trim(), img);
          setMessage({ type: 'success', text: `Successfully added ${name.trim()} to known faces!` });
          setName('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to load image' });
        setIsProcessing(false);
      };
      img.src = URL.createObjectURL(file);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error processing image' });
      setIsProcessing(false);
    }
  };

  const captureFromCamera = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a person\'s name first' });
      return;
    }

    if (!isStreaming) {
      setMessage({ type: 'error', text: 'Please start the camera first in the Live Detection tab' });
      return;
    }

    if (!videoRef.current) {
      setMessage({ type: 'error', text: 'Camera not available' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // Create canvas and capture current video frame
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert canvas to image
      const imageData = canvas.toDataURL('image/jpeg');
      const img = new Image();
      
      img.onload = async () => {
        try {
          await addKnownFace(name.trim(), img);
          setMessage({ type: 'success', text: `Successfully captured and added ${name.trim()} to known faces!` });
          setName('');
          setCaptureMode(false);
        } catch (err) {
          setMessage({ type: 'error', text: err.message });
        } finally {
          setIsProcessing(false);
        }
      };
      
      img.src = imageData;
    } catch (err) {
      setMessage({ type: 'error', text: 'Error capturing from camera' });
      setIsProcessing(false);
    }
  };

  const handleRemoveFace = (faceName) => {
    removeKnownFace(faceName);
    setMessage({ type: 'success', text: `Removed ${faceName} from known faces` });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Face Enrollment
        </CardTitle>
        <CardDescription className="text-gray-400">
          Add people to the recognition system by uploading photos or capturing from camera
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Message */}
        {message && (
          <Alert className={`${
            message.type === 'success' 
              ? 'bg-green-900/50 border-green-700 text-green-200' 
              : 'bg-red-900/50 border-red-700 text-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="personName" className="text-white">Person's Name</Label>
          <Input
            id="personName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter person's name"
            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            disabled={isProcessing}
          />
        </div>

        {/* Upload Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-white">Upload Photo</Label>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={!isReady || isProcessing || !name.trim()}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isReady || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <p className="text-xs text-gray-400">
                {!name.trim() ? 'Enter a name first, then upload a photo' : 'Upload a clear photo with one face visible'}
              </p>
            </div>
          </div>

          {/* Camera Capture */}
          <div className="space-y-3">
            <Label className="text-white">Capture from Camera</Label>
            <div className="flex flex-col gap-2">
              <Button
                onClick={captureFromCamera}
                disabled={!isReady || isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Now
              </Button>
              <p className="text-xs text-gray-400">
                {!name.trim() 
                  ? 'Enter a name first' 
                  : !isStreaming 
                    ? 'Start camera in Live Detection tab first' 
                    : 'Position face in camera and capture'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Hidden canvas for camera capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Known Faces List */}
        <div className="space-y-3">
          <Label className="text-white">Known People ({knownFaces.length})</Label>
          {knownFaces.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No people enrolled yet</p>
              <p className="text-sm">Add someone to start face recognition</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {knownFaces.map((face, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {face.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{face.name}</div>
                      <div className="text-xs text-gray-400">
                        {face.descriptors.length} photo{face.descriptors.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveFace(face.name)}
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Tips for best results:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use clear, well-lit photos</li>
            <li>• Ensure only one face is visible in each photo</li>
            <li>• Add multiple photos of the same person for better accuracy</li>
            <li>• Face should be looking towards the camera</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceEnrollment;

