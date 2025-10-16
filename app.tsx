import { useEffect, useRef, useState } from "react";
import { Video, Shield, AlertTriangle, VideoOff } from "lucide-react";
import BoundingBox from "./components/BoundingBox";
import AnimatedIcon from "./components/AnimatedIcon";
import RadialGauge from "./components/RadialGauge";
import ScanHistory from "./components/ScanHistory";

interface ScanRecord {
  id: number;
  timestamp: string;
  hasMask: boolean;
  confidence: number;
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [hasMask, setHasMask] = useState(true);
  const [confidence, setConfidence] = useState(98.5);
  const [pulse, setPulse] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [scanId, setScanId] = useState(0);

  // Initialize camera
  useEffect(() => {
    if (!isCameraOn) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
          setCameraError(null);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(
          "Unable to access camera. Please grant camera permissions."
        );
        setIsCameraOn(false);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraReady(false);
    };
  }, [isCameraOn]);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  // Simulate AI detection
  useEffect(() => {
    if (!isCameraOn || !cameraReady) return;

    const interval = setInterval(() => {
      const maskDetected = Math.random() > 0.5;
      setHasMask(maskDetected);

      if (maskDetected) {
        setConfidence(95 + Math.random() * 4);
      } else {
        setConfidence(1 + Math.random() * 4);
      }

      setPulse(true);
      setTimeout(() => setPulse(false), 500);

      const now = new Date();
      const timestamp = now.toLocaleTimeString("en-US", { hour12: false });
      setScanHistory((prev) => [
        {
          id: scanId,
          timestamp,
          hasMask: maskDetected,
          confidence: maskDetected
            ? 95 + Math.random() * 4
            : 1 + Math.random() * 4,
        },
        ...prev.slice(0, 9),
      ]);
      setScanId((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isCameraOn, cameraReady]);

  const statusColor = hasMask ? "text-green-400" : "text-red-500";
  const borderColor = hasMask ? "border-green-400" : "border-red-500";
  const glowColor = hasMask ? "shadow-green-400/50" : "shadow-red-500/50";
  const borderPulseClass = pulse
    ? hasMask
      ? "border-pulse-green"
      : "border-pulse-red"
    : "";
  const activeScanClass = cameraReady
    ? hasMask
      ? "active-scan-green"
      : "active-scan-red"
    : "";
  const maskConfidence = hasMask ? confidence : 100 - confidence;
  const noMaskConfidence = hasMask ? 100 - confidence : confidence;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        {/* Main Container */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white tracking-wide">
                AI Mask Detection System
              </h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* Camera Feed Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <Video className="w-4 h-4" />
                  <span>LIVE CAMERA FEED</span>
                </div>
                <button
                  onClick={toggleCamera}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                    isCameraOn
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isCameraOn ? (
                    <>
                      <VideoOff className="w-4 h-4" />
                      Turn Off
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Turn On
                    </>
                  )}
                </button>
              </div>

              <div
                className={`relative rounded-xl overflow-hidden border-4 ${
                  cameraReady ? borderColor : "border-gray-700"
                } ${
                  cameraReady ? glowColor : ""
                } shadow-2xl transition-all duration-300 ${
                  pulse ? "scale-[1.01]" : "scale-100"
                } ${borderPulseClass} ${activeScanClass}`}
              >
                {!isCameraOn ? (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <VideoOff className="w-16 h-16 text-gray-600 mx-auto" />
                      <p className="text-gray-300 text-lg">Camera is off</p>
                      <p className="text-gray-500 text-sm">
                        Click "Turn On" to start detection
                      </p>
                    </div>
                  </div>
                ) : cameraError ? (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
                      <p className="text-gray-300 text-lg">{cameraError}</p>
                      <p className="text-gray-500 text-sm">
                        Check your browser settings and reload the page
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video bg-black object-cover"
                    />
                    {!cameraReady && (
                      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-400">
                            Initializing camera...
                          </p>
                        </div>
                      </div>
                    )}
                    <BoundingBox isDetecting={cameraReady} hasMask={hasMask} />
                  </>
                )}

                {/* Status Overlay */}
                {cameraReady && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-semibold">
                        LIVE
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detection Dashboard */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>DETECTION DASHBOARD</span>
              </div>

              {/* Main Status Display */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-xl">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-medium tracking-wider digital-font">
                      CURRENT STATUS
                    </p>
                    <h2
                      className={`text-5xl lg:text-6xl font-black tracking-tight ${statusColor} ${
                        pulse ? "animate-pulse" : ""
                      } transition-all duration-300 digital-font`}
                    >
                      {hasMask ? "MASK ON" : "MASK OFF"}
                    </h2>
                  </div>

                  {/* Icon Display */}
                  <div className="flex justify-center">
                    <AnimatedIcon hasMask={hasMask} pulse={pulse} />
                  </div>
                </div>
              </div>

              {/* Confidence Gauges */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <RadialGauge
                    value={maskConfidence}
                    label="MASK CONFIDENCE"
                    color="green"
                  />
                  <RadialGauge
                    value={noMaskConfidence}
                    label="NO MASK CONFIDENCE"
                    color="red"
                  />
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 digital-font">
                      MODEL STATUS
                    </p>
                    <p
                      className={`font-semibold digital-font ${
                        isCameraOn && cameraReady
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {isCameraOn && cameraReady ? "ACTIVE" : "STANDBY"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 digital-font">
                      DETECTION INTERVAL
                    </p>
                    <p className="text-cyan-400 font-semibold digital-font">
                      3.0s
                    </p>
                  </div>
                </div>
              </div>

              {/* Scan History */}
              <ScanHistory history={scanHistory} />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 px-6 py-3">
            <p className="text-center text-gray-500 text-sm">
              AI Mask Detection System | Real-Time Computer Vision
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
