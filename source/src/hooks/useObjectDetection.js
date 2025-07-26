import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export const useObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const detectionIntervalRef = useRef(null);

  // Load the COCO-SSD model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Set TensorFlow.js backend to webgl for better performance
        await tf.setBackend('webgl');
        
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load object detection model');
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Detect objects in a video element
  const detectObjects = async (videoElement) => {
    if (!model || !videoElement) return;

    try {
      const predictions = await model.detect(videoElement);
      setPredictions(predictions);
    } catch (err) {
      console.error('Error during detection:', err);
      setError('Error during object detection');
    }
  };

  // Start continuous detection
  const startDetection = (videoElement, interval = 100) => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(() => {
      detectObjects(videoElement);
    }, interval);
  };

  // Stop continuous detection
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setPredictions([]);
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
    model,
    isLoading,
    predictions,
    error,
    detectObjects,
    startDetection,
    stopDetection
  };
};

