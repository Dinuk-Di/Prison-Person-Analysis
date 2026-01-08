import React, { useEffect, useState, useRef } from 'react';
import { Camera as CameraIcon, Loader, AlertCircle, Play, Square, Upload, CheckCircle, Video, Send, BarChart3, User } from 'lucide-react';
import { useCamera } from '../../context/CameraContext';
import Button from '../../components/button/Button';
import Input from '../../components/input/Input';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

export default function Camera() {
  const {
    videoRef,
    streamRef,
    isLoading,
    isCameraActive,
    error,
    devices,
    selectedDeviceId,
    startCamera,
    stopCamera,
    captureScreenshot,
    handleDeviceChange,
  } = useCamera();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoUsername, setVideoUsername] = useState('');
  const [isSendingVideo, setIsSendingVideo] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  // Analysis states
  const [analysisUsername, setAnalysisUsername] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Ensure video displays when returning to this page
  useEffect(() => {
    if (videoRef.current && streamRef && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [videoRef, streamRef, isCameraActive]);

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      // Send file as array format
      formData.append('file[]', uploadedFile);

      await axiosInstance.post('http://127.0.0.1:5010/api/admin/upload_medical_record', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Medical record uploaded successfully!');
      setUploadedFile(null);
      // Reset file input
      const fileInput = document.getElementById('pdf-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const msg = error?.response?.data?.message || 'Failed to upload file. Please try again.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartRecording = async () => {
    if (!isCameraActive || !streamRef.current) {
      toast.error('Please start the camera first');
      return;
    }

    try {
      recordedChunksRef.current = [];
      
      // Try different mime types for browser compatibility
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }
      
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
        setVideoBlob(blob);
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        setShowVideoForm(true);
        setIsRecording(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please ensure your browser supports video recording.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSendVideo = async () => {
    if (!videoUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!videoBlob) {
      toast.error('No video recorded');
      return;
    }

    setIsSendingVideo(true);

    try {
      const formData = new FormData();
      formData.append('Username', videoUsername.trim());
      formData.append('video', videoBlob, 'video.webm');

      await axiosInstance.post('http://127.0.0.1:5010/api/inmate/detect_emotion', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Video sent successfully!');
      setShowVideoForm(false);
      setRecordedVideo(null);
      setVideoBlob(null);
      setVideoUsername('');
    } catch (error) {
      console.error('Error sending video:', error);
      const msg = error?.response?.data?.message || 'Failed to send video. Please try again.';
      toast.error(msg);
    } finally {
      setIsSendingVideo(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await axiosInstance.post(
        "http://127.0.0.1:5010/api/admin/analyze_inmate",
        { username: analysisUsername.trim() }
      );
      setAnalysisData(response.data);
      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Error analyzing:', error);
      const msg = error?.response?.data?.message || 'Failed to analyze inmate. Please try again.';
      toast.error(msg);
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <CameraIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Security Monitoring</h1>
          </div>
          <p className="text-slate-600">Live camera feed for prison surveillance</p>
        </div>

        {/* Main Camera Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="text-center">
                      <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
                      <p className="text-white font-medium">Initializing camera...</p>
                    </div>
                  </div>
                )}

                {error && !isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 z-10 p-4">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                      <p className="text-red-100 font-medium text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
              </div>

              {/* Video Stats */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {isCameraActive ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 space-y-6">
              {/* Device Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Camera
                </label>
                {devices.length > 0 ? (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    disabled={isCameraActive}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm disabled:bg-slate-100"
                  >
                    {devices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-slate-500 p-2">No cameras found</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    disabled={isLoading || devices.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    View Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    <Square className="w-4 h-4" />
                    Stop Camera
                  </button>
                )}

                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={!isCameraActive}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Video className="w-4 h-4" />
                    Capture Video
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all animate-pulse"
                  >
                    <Square className="w-4 h-4" />
                    Recording... (5s)
                  </button>
                )}
              </div>

              {/* Status Info */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                  Camera Status
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`font-semibold ${isCameraActive ? 'text-green-600' : 'text-red-600'}`}>
                      {isCameraActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Resolution:</span>
                    <span className="text-slate-700 font-medium">
                      {isCameraActive && videoRef.current?.videoWidth
                        ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cameras:</span>
                    <span className="text-slate-700 font-medium">{devices.length}</span>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Upload Medical Record (PDF)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors mb-3">
                  <input
                    type="file"
                    id="pdf-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                        <p className="text-xs font-medium text-slate-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-medium text-slate-700">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-slate-500">
                          Medical record file
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <Button
                  variant="primary"
                  onClick={handleFileUpload}
                  disabled={!uploadedFile || isUploading}
                  loading={isUploading}
                  className="w-full"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Note:</span> Camera feed runs in background across all pages. Use global API to access frame data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Upload Form - Prominent Section */}
        {showVideoForm && recordedVideo && (
          <div className="mt-6 bg-white rounded-lg shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Send Video for Emotion Detection</h2>
                  <p className="text-sm text-slate-600">Review your recorded video and submit for analysis</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVideoForm(false);
                  setRecordedVideo(null);
                  setVideoBlob(null);
                  setVideoUsername('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Preview */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Video Preview
                </label>
                <div className="bg-slate-900 rounded-lg overflow-hidden">
                  <video
                    src={recordedVideo}
                    controls
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Upload Form */}
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Username"
                    placeholder="Enter username for emotion detection"
                    value={videoUsername}
                    onChange={(e) => setVideoUsername(e.target.value)}
                    required
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-700 mb-2">
                      <span className="font-semibold">Note:</span> This video will be analyzed for emotional state detection.
                    </p>
                    <p className="text-xs text-blue-600">
                      Make sure the username matches the registered inmate.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVideoForm(false);
                        setRecordedVideo(null);
                        setVideoBlob(null);
                        setVideoUsername('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSendVideo}
                      disabled={!videoUsername.trim() || isSendingVideo}
                      loading={isSendingVideo}
                      className="flex-1"
                    >
                      <Send className="w-4 h-4" />
                      Send Video
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Inmate Section - Prominent */}
        <div className="mt-6 bg-white rounded-lg shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Analyze Inmate</h2>
              <p className="text-sm text-slate-600">Get comprehensive mental health analysis for an inmate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Input
                type="text"
                label="Inmate Username"
                placeholder="Enter the username of the inmate to analyze"
                value={analysisUsername}
                onChange={(e) => setAnalysisUsername(e.target.value)}
                icon={User}
                required
              />
              
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  disabled={!analysisUsername.trim() || isAnalyzing}
                  loading={isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  <BarChart3 className="w-5 h-5" />
                  {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                </Button>
              </div>
            </div>

            {/* Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 h-full border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Comprehensive Analysis</p>
                      <p className="text-xs text-slate-600">Risk assessment and recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Mental Health Insights</p>
                      <p className="text-xs text-slate-600">Suspected conditions and reasoning</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Actionable Recommendations</p>
                      <p className="text-xs text-slate-600">Tailored intervention strategies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results Card */}
        {analysisData && analysisData.analysis && (
          <div className="mt-6 bg-white rounded-lg shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
                  <p className="text-sm text-slate-600">Comprehensive mental health assessment</p>
                </div>
              </div>
              <button
                onClick={() => setAnalysisData(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Level & Conditions */}
              <div className="lg:col-span-1 space-y-4">
                {/* Risk Level Card */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Risk Assessment</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-2 rounded-lg text-base font-bold ${
                      analysisData.analysis.risk_level === 'High' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                      analysisData.analysis.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                      'bg-green-100 text-green-700 border-2 border-green-300'
                    }`}>
                      {analysisData.analysis.risk_level}
                    </span>
                    {analysisData.analysis.urgent_alert && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {analysisData.analysis.risk_level === 'High' && 'Immediate attention required'}
                    {analysisData.analysis.risk_level === 'Medium' && 'Monitor closely and provide support'}
                    {analysisData.analysis.risk_level === 'Low' && 'Continue regular monitoring'}
                  </p>
                </div>

                {/* Suspected Conditions */}
                {analysisData.analysis.suspected_conditions && analysisData.analysis.suspected_conditions.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Suspected Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.analysis.suspected_conditions.map((condition, index) => (
                        <span key={index} className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-sm font-medium border border-blue-200 shadow-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Reasoning */}
                <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Analysis Reasoning
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {analysisData.analysis.reasoning}
                  </p>
                </div>

                {/* Recommended Actions */}
                {analysisData.analysis.recommended_actions && analysisData.analysis.recommended_actions.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                    <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Recommended Actions
                    </p>
                    <ul className="space-y-3">
                      {analysisData.analysis.recommended_actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-xs border-2 border-green-300 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
