import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceRecognition = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [faceDetections, setFaceDetections] = useState([]);
  const [knownFaces, setKnownFaces] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const detectionIntervalRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load required models
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        setIsReady(true);
        setIsLoading(false);
        console.log('Face recognition models loaded successfully');
      } catch (err) {
        console.error('Error loading face recognition models:', err);
        setError('Failed to load face recognition models');
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Load known faces from localStorage
  useEffect(() => {
    const loadKnownFaces = () => {
      try {
        const stored = localStorage.getItem('knownFaces');
        if (stored) {
          const faces = JSON.parse(stored);
          setKnownFaces(faces);
          
          // Create face matcher if we have known faces
          if (faces.length > 0) {
            const labeledDescriptors = faces.map(face => 
              new faceapi.LabeledFaceDescriptors(
                face.name,
                face.descriptors.map(desc => new Float32Array(desc))
              )
            );
            const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
            setFaceMatcher(matcher);
          }
        }
      } catch (err) {
        console.error('Error loading known faces:', err);
      }
    };

    if (isReady) {
      loadKnownFaces();
    }
  }, [isReady]);

  // Add a new known face
  const addKnownFace = async (name, imageElement) => {
    if (!isReady) {
      throw new Error('Face recognition models are not ready yet. Please wait for models to load.');
    }

    try {
      console.log('Starting face detection for:', name);
      const detections = await faceapi
        .detectAllFaces(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptors();

      console.log('Face detections found:', detections.length);

      if (detections.length === 0) {
        throw new Error('No face detected in the image. Please use a clear photo with a visible face.');
      }

      if (detections.length > 1) {
        throw new Error('Multiple faces detected. Please use an image with only one face.');
      }

      const descriptor = Array.from(detections[0].descriptor);
      console.log('Face descriptor extracted, length:', descriptor.length);
      
      // Check if person already exists
      const existingFaceIndex = knownFaces.findIndex(face => face.name === name);
      let updatedFaces;

      if (existingFaceIndex >= 0) {
        // Add descriptor to existing person
        updatedFaces = [...knownFaces];
        updatedFaces[existingFaceIndex].descriptors.push(descriptor);
        console.log('Added descriptor to existing person:', name);
      } else {
        // Add new person
        updatedFaces = [...knownFaces, { name, descriptors: [descriptor] }];
        console.log('Added new person:', name);
      }

      // Save to localStorage
      localStorage.setItem('knownFaces', JSON.stringify(updatedFaces));
      setKnownFaces(updatedFaces);
      console.log('Saved to localStorage, total known faces:', updatedFaces.length);

      // Update face matcher
      const labeledDescriptors = updatedFaces.map(face => 
        new faceapi.LabeledFaceDescriptors(
          face.name,
          face.descriptors.map(desc => new Float32Array(desc))
        )
      );
      const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      setFaceMatcher(matcher);
      console.log('Face matcher updated');

      return true;
    } catch (err) {
      console.error('Error adding known face:', err);
      throw err;
    }
  };

  // Remove a known face
  const removeKnownFace = (name) => {
    const updatedFaces = knownFaces.filter(face => face.name !== name);
    localStorage.setItem('knownFaces', JSON.stringify(updatedFaces));
    setKnownFaces(updatedFaces);

    // Update face matcher
    if (updatedFaces.length > 0) {
      const labeledDescriptors = updatedFaces.map(face => 
        new faceapi.LabeledFaceDescriptors(
          face.name,
          face.descriptors.map(desc => new Float32Array(desc))
        )
      );
      const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      setFaceMatcher(matcher);
    } else {
      setFaceMatcher(null);
    }
  };

  // Detect and recognize faces in video
  const detectFaces = async (videoElement) => {
    if (!isReady || !videoElement) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const recognizedFaces = detections.map(detection => {
        let match = { label: 'Unknown', distance: 1 };
        
        if (faceMatcher) {
          match = faceMatcher.findBestMatch(detection.descriptor);
        }

        return {
          detection: detection.detection,
          landmarks: detection.landmarks,
          descriptor: detection.descriptor,
          name: match.label,
          confidence: 1 - match.distance,
          isKnown: match.label !== 'Unknown'
        };
      });

      setFaceDetections(recognizedFaces);
    } catch (err) {
      console.error('Error during face detection:', err);
    }
  };

  // Start continuous face detection
  const startFaceDetection = (videoElement, interval = 100) => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(() => {
      detectFaces(videoElement);
    }, interval);
  };

  // Stop face detection
  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setFaceDetections([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isReady,
    error,
    faceDetections,
    knownFaces,
    addKnownFace,
    removeKnownFace,
    detectFaces,
    startFaceDetection,
    stopFaceDetection
  };
};

