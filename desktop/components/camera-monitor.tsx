"use client"

import { useState, useEffect, useRef } from "react"
import { AlertCircle, Camera, Wifi, WifiOff } from "lucide-react"
import { API_CONFIG } from "@/lib/api-config"

interface CameraMonitorProps {
  onSuspiciousActivity: (activity: string) => void
  studentId?: string
}

interface DetectionResult {
  face_detected: boolean
  fully_visible: boolean
  cheating_detected: boolean
  face_coverage: number
  face_location?: {
    x: number
    y: number
    w: number
    h: number
  }
  reason: string
  frame_saved: boolean
}

const API_URL = API_CONFIG.FACE_DETECTION_URL

export default function CameraMonitor({ onSuspiciousActivity, studentId = "STUDENT_001" }: CameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detectionActive, setDetectionActive] = useState(false)
  const [apiConnected, setApiConnected] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastDetectionResult, setLastDetectionResult] = useState<DetectionResult | null>(null)
  const lastActivityRef = useRef<Record<string, number>>({})
  const analysisIntervalRef = useRef<number | null>(null)
  const drawIntervalRef = useRef<number | null>(null)

  // Check if Python API is running
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`)
        const data = await response.json()
        
        if (data.status === "ok") {
          console.log("✅ Python API connected:", data.service)
          setApiConnected(true)
          setLoading(false)
        } else {
          throw new Error("API unhealthy")
        }
      } catch (err) {
        console.error("❌ Python API not available:", err)
        setError("Detection API not running. Please start the Python backend (python api.py)")
        setApiConnected(false)
        setLoading(false)
      }
    }

    checkApiHealth()
    
    // Recheck every 10 seconds
    const interval = setInterval(checkApiHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log("Requesting camera access...")
        
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera not supported in this browser/environment")
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        })

        console.log("Camera access granted!")

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setDetectionActive(true)
              console.log("Video playing, detection active")
              console.log("Video dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight)
            }).catch(err => {
              console.error("Error playing video:", err)
              setError("Failed to start video playback")
            })
          }
        }
      } catch (err: any) {
        console.error("Camera error:", err)
        
        let errorMessage = "Camera access denied. "
        
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage += "Please allow camera permissions in your system settings."
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage += "No camera device found."
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMessage += "Camera is already in use by another application."
        } else {
          errorMessage += `Error: ${err.message || "Unknown error"}`
        }
        
        setError(errorMessage)
      }
    }

    if (!loading) {
      initCamera()
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        console.log("Camera stopped")
      }
    }
  }, [loading])

  // Face detection using Python API
  useEffect(() => {
    if (!detectionActive || !apiConnected || !videoRef.current || !canvasRef.current) return

    const analyzeFrame = async () => {
      // Skip if already analyzing
      if (isAnalyzing) {
        console.log("Skipping frame - analysis in progress")
        return
      }

      try {
        setIsAnalyzing(true)
        console.log("🔍 Starting frame analysis...")
        
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) {
          console.log("❌ No video or canvas ref")
          setIsAnalyzing(false)
          return
        }

        // Check if video is ready
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          console.log("⏳ Video not ready yet")
          setIsAnalyzing(false)
          return
        }

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          console.log("❌ No canvas context")
          setIsAnalyzing(false)
          return
        }

        // Clear canvas and draw video frame
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        console.log("📸 Capturing frame and converting to base64...")
        
        // Convert canvas to base64 for API
        const frameData = canvas.toDataURL('image/jpeg', 0.8)
        const base64Frame = frameData.split(',')[1] // Remove data:image/jpeg;base64, prefix

        console.log(`📤 Sending to API (frame size: ${(base64Frame.length / 1024).toFixed(2)} KB)...`)

        // Send to Python API
        const response = await fetch(`${API_URL}/analyze-frame`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frame: base64Frame,
            student_id: studentId,
          }),
        })

        if (!response.ok) {
          console.error(`❌ API Error: ${response.status} ${response.statusText}`)
          throw new Error(`API returned ${response.status}`)
        }

        const result: DetectionResult = await response.json()
        
        console.log("📊 Detection result:", result)
        setLastDetectionResult(result)

        // Handle detection results
        if (result.cheating_detected) {
          const now = Date.now()
          const reason = result.reason

          // Map API reasons to user-friendly messages
          let activityMessage = ""
          let activityKey = ""

          switch (reason) {
            case "face_not_detected":
              activityMessage = "No face detected in frame"
              activityKey = "noFace"
              break
            case "face_out_of_frame":
              activityMessage = "Face moved out of frame"
              activityKey = "outOfFrame"
              break
            case "face_partially_visible":
              activityMessage = "Face partially hidden"
              activityKey = "partialFace"
              break
            case "multiple_faces_detected":
              activityMessage = "Multiple people detected"
              activityKey = "multipleFaces"
              break
            default:
              activityMessage = `Suspicious activity: ${reason}`
              activityKey = "other"
          }

          // Trigger warning with cooldown
          if (!lastActivityRef.current[activityKey] || 
              now - lastActivityRef.current[activityKey] > 5000) {
            console.log(`🚨 SUSPICIOUS: ${activityMessage}`)
            onSuspiciousActivity(activityMessage)
            lastActivityRef.current[activityKey] = now
          }

          // Draw red warning overlay
          ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = "#ff0000"
          ctx.font = "bold 18px Arial"
          ctx.textAlign = "center"
          ctx.fillText("⚠️ " + activityMessage, canvas.width / 2, canvas.height / 2)
          ctx.fillText("Frame saved for review", canvas.width / 2, canvas.height / 2 + 30)

        } else if (result.face_detected) {
          // Draw green box around face
          if (result.face_location) {
            const { x, y, w, h } = result.face_location
            ctx.strokeStyle = "#00ff00"
            ctx.lineWidth = 3
            ctx.strokeRect(x, y, w, h)

            // Draw face coverage indicator
            ctx.fillStyle = "#00ff00"
            ctx.font = "bold 14px Arial"
            ctx.textAlign = "left"
            ctx.fillText(`Face Coverage: ${(result.face_coverage * 100).toFixed(0)}%`, x, y - 10)
          }

          // Draw green border
          ctx.strokeStyle = "#00ff00"
          ctx.lineWidth = 4
          ctx.strokeRect(0, 0, canvas.width, canvas.height)

          // Draw status
          ctx.fillStyle = "#00ff00"
          ctx.font = "bold 14px Arial"
          ctx.textAlign = "left"
          ctx.fillText("✓ Monitoring Active", 10, 25)

          // Reset cooldowns
          Object.keys(lastActivityRef.current).forEach(key => {
            lastActivityRef.current[key] = 0
          })
        } else {
          // No face detected
          ctx.fillStyle = "rgba(255, 165, 0, 0.3)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = "#ff9900"
          ctx.font = "bold 16px Arial"
          ctx.textAlign = "center"
          ctx.fillText("Please position your face in frame", canvas.width / 2, canvas.height / 2)
        }

      } catch (err) {
        console.error("Detection error:", err)
        // Draw error on canvas
        const ctx = canvasRef.current?.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#ff0000"
          ctx.font = "12px Arial"
          ctx.textAlign = "left"
          ctx.fillText("API Error - Check console", 10, 50)
        }
      } finally {
        setIsAnalyzing(false)
      }
    }

    console.log("🚀 Starting detection interval (every 3 seconds)...")
    
    // Analyze frames every 3 seconds (reduced from 1 second to prevent overheating)
    analysisIntervalRef.current = window.setInterval(analyzeFrame, 3000)
    
    // Run first analysis immediately
    setTimeout(analyzeFrame, 1000)

    return () => {
      console.log("🛑 Stopping detection interval")
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
    }
  }, [detectionActive, apiConnected, onSuspiciousActivity, studentId])

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Live Monitoring</h3>
        </div>
        <div className="flex items-center gap-2">
          {apiConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">API Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-500">API Offline</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-black overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-muted-foreground">Loading detection...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
              <p className="text-xs text-destructive text-balance">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="absolute top-0 left-0 w-full h-full object-cover" 
              style={{ width: 640, height: 480 }}
              autoPlay
              playsInline
              muted
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full object-cover" 
              width={640} 
              height={480}
              style={{ mixBlendMode: 'normal' }}
            />
          </>
        )}
      </div>

      <div className="bg-muted/50 border-t border-border px-3 py-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Analyzed by Python CV Backend • ID: {studentId}
        </span>
        {apiConnected && (
          <span className="text-green-500">
            ✓ Frames auto-saved on suspicious activity
          </span>
        )}
      </div>
    </div>
  )
}