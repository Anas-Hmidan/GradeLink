"use client"

import { useState, useEffect, useRef } from "react"
import * as faceapi from "face-api.js"
import { AlertCircle, Camera } from "lucide-react"

interface CameraMonitorProps {
  onSuspiciousActivity: (activity: string) => void
}

export default function CameraMonitor({ onSuspiciousActivity }: CameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detectionActive, setDetectionActive] = useState(false)
  const lastActivityRef = useRef<Record<string, number>>({})

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
        
        console.log("Loading face detection models...")
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])

        console.log("Models loaded successfully!")
        setLoading(false)
      } catch (err) {
        console.error("Error loading face-api models:", err)
        setError("Failed to load face detection models. Check your internet connection.")
        setLoading(false)
      }
    }

    loadModels()
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

  // Face detection loop
  useEffect(() => {
    if (!detectionActive || !videoRef.current || !canvasRef.current) return

    let animationId: number

    const detectFaces = async () => {
      try {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) return

        // Check if video is ready
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          animationId = requestAnimationFrame(detectFaces)
          return
        }

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw video frame first (before detection)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Detect faces
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ 
            inputSize: 416,
            scoreThreshold: 0.5 
          }))
          .withFaceLandmarks()
          .withFaceExpressions()

        console.log("Detections:", detections.length, "faces found")

        if (detections.length === 0) {
          // No face detected
          const now = Date.now()
          if (!lastActivityRef.current["noFace"]) {
            lastActivityRef.current["noFace"] = now
          } else if (now - lastActivityRef.current["noFace"] > 2000) {
            console.log("🚨 SUSPICIOUS: Face left frame")
            onSuspiciousActivity("Face left frame")
            lastActivityRef.current["noFace"] = now + 10000 // Cooldown
          }

          // Draw warning
          ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = "#ff0000"
          ctx.font = "bold 16px Arial"
          ctx.textAlign = "center"
          ctx.fillText("No face detected!", canvas.width / 2, canvas.height / 2)
        } else {
          const detection = detections[0]
          const now = Date.now()

          // Draw face box - make it more visible
          const box = detection.detection.box
          ctx.strokeStyle = "#00ff00"
          ctx.lineWidth = 3
          ctx.strokeRect(box.x, box.y, box.width, box.height)

          // Draw landmarks (eyes, nose, etc.)
          const faceLandmarks = detection.landmarks
          ctx.fillStyle = "#00ff00"
          faceLandmarks.positions.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
            ctx.fill()
          })

          // Draw face label
          ctx.fillStyle = "#00ff00"
          ctx.font = "bold 14px Arial"
          ctx.fillText("Face Detected ✓", box.x, box.y - 10)

          // Check multiple faces
          if (detections.length > 1) {
            if (!lastActivityRef.current["multipleFaces"]) {
              lastActivityRef.current["multipleFaces"] = now
            } else if (now - lastActivityRef.current["multipleFaces"] > 1500) {
              console.log("🚨 SUSPICIOUS: Multiple faces detected")
              onSuspiciousActivity("Multiple faces detected")
              lastActivityRef.current["multipleFaces"] = now + 10000
            }

            ctx.fillStyle = "rgba(255, 165, 0, 0.2)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          // Check head pose (gaze direction)
          const landmarkPositions = detection.landmarks.positions
          if (landmarkPositions.length > 20) {
            const leftEye = landmarkPositions[36]
            const rightEye = landmarkPositions[45]
            const nose = landmarkPositions[30]

            const eyesCenterX = (leftEye.x + rightEye.x) / 2
            const horizontalGaze = Math.abs(eyesCenterX - nose.x)

            if (horizontalGaze > 20) {
              if (!lastActivityRef.current["lookingAway"]) {
                lastActivityRef.current["lookingAway"] = now
              } else if (now - lastActivityRef.current["lookingAway"] > 3000) {
                console.log("🚨 SUSPICIOUS: Looking away from screen")
                onSuspiciousActivity("Looking away from screen")
                lastActivityRef.current["lookingAway"] = now + 10000
              }
            } else {
              lastActivityRef.current["lookingAway"] = 0
            }
          }

          // Check expressions
          const expressions = detection.expressions
          console.log("Expressions:", {
            happy: expressions.happy.toFixed(2),
            sad: expressions.sad.toFixed(2),
            surprised: expressions.surprised.toFixed(2),
            neutral: expressions.neutral.toFixed(2)
          })
          
          if (expressions.surprised > 0.5 || expressions.neutral < 0.3) {
            if (!lastActivityRef.current["suspiciousExpression"]) {
              lastActivityRef.current["suspiciousExpression"] = now
            } else if (now - lastActivityRef.current["suspiciousExpression"] > 4000) {
              console.log("🚨 SUSPICIOUS: Suspicious facial expression detected")
              onSuspiciousActivity("Suspicious facial expression detected")
              lastActivityRef.current["suspiciousExpression"] = now + 15000
            }
          }

          // Clear status
          lastActivityRef.current["noFace"] = 0

          // Draw green border when face is detected properly
          ctx.strokeStyle = "#00ff00"
          ctx.lineWidth = 3
          ctx.strokeRect(0, 0, canvas.width, canvas.height)

          // Draw status text
          ctx.fillStyle = "#00ff00"
          ctx.font = "bold 12px Arial"
          ctx.textAlign = "left"
          ctx.fillText("Monitoring...", 8, 20)
        }
      } catch (err) {
        console.error("Detection error:", err)
      }

      animationId = requestAnimationFrame(detectFaces)
    }

    detectFaces()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [detectionActive, onSuspiciousActivity])

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center gap-2">
        <Camera className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Live Monitoring</h3>
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

      <div className="bg-muted/50 border-t border-border px-3 py-2 text-xs text-muted-foreground text-center">
        Your video feed is private and monitored locally
      </div>
    </div>
  )
}
