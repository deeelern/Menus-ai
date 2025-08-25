import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Camera, Upload, Scan, ChefHat, Package, Loader2, X } from 'lucide-react'
import Webcam from 'react-webcam'

export default function Scanner({ user, token }) {
  const [scanMode, setScanMode] = useState('single') // 'single' or 'multi'
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Use back camera on mobile
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    setCapturedImage(imageSrc)
    setShowCamera(false)
  }, [webcamRef])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const scanImage = async (imageData) => {
    setIsScanning(true)
    setError('')
    setScanResult(null)

    try {
      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      
      // Create FormData
      const formData = new FormData()
      formData.append('image', blob, 'scan.jpg')
      formData.append('mode', scanMode)

      // Send to backend
      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await scanResponse.json()

      if (scanResponse.ok) {
        setScanResult(data)
      } else {
        setError(data.error || 'Scan failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Scan error:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleScan = () => {
    if (capturedImage) {
      scanImage(capturedImage)
    }
  }

  const resetScanner = () => {
    setCapturedImage(null)
    setScanResult(null)
    setError('')
    setShowCamera(false)
  }

  const addToInventory = async (item) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          unit: item.unit || 'piece',
          freshness_score: item.freshness_score,
          expiry_date: item.estimated_expiry
        })
      })

      if (response.ok) {
        // Show success message or update UI
        alert('Item added to inventory!')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add item to inventory')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanner Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scan className="h-5 w-5 mr-2" />
            AI Food Scanner
          </CardTitle>
          <CardDescription>
            Scan ingredients to identify them and get recipe suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={scanMode} onValueChange={setScanMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Single Item
              </TabsTrigger>
              <TabsTrigger value="multi" className="flex items-center">
                <ChefHat className="h-4 w-4 mr-2" />
                Cook Now
              </TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="mt-4">
              <p className="text-sm text-gray-600">
                Scan a single ingredient to identify it, estimate freshness, and add to your inventory.
              </p>
            </TabsContent>
            <TabsContent value="multi" className="mt-4">
              <p className="text-sm text-gray-600">
                Scan multiple ingredients to get instant recipe recommendations based on what you have.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Camera/Upload Interface */}
      <Card>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!capturedImage && !showCamera && (
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setShowCamera(true)} className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button onClick={capture} className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={() => setShowCamera(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && !scanResult && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full rounded-lg max-h-96 object-contain"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleScan} 
                  disabled={isScanning}
                  className="flex items-center"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Scan Image
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetScanner}>
                  <X className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src={capturedImage} 
                    alt="Scanned" 
                    className="w-full rounded-lg max-h-64 object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Scan Results</h3>
                  
                  {scanMode === 'single' && scanResult.item && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{scanResult.item.name}</h4>
                        <Badge variant="secondary">{scanResult.item.category}</Badge>
                      </div>
                      
                      {scanResult.item.freshness_score && (
                        <div>
                          <span className="text-sm text-gray-600">Freshness: </span>
                          <Badge variant={scanResult.item.freshness_score > 7 ? 'default' : 'destructive'}>
                            {scanResult.item.freshness_score}/10
                          </Badge>
                        </div>
                      )}
                      
                      {scanResult.item.estimated_expiry && (
                        <div>
                          <span className="text-sm text-gray-600">Estimated expiry: </span>
                          <span className="text-sm">{scanResult.item.estimated_expiry}</span>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => addToInventory(scanResult.item)}
                        className="w-full"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Add to Inventory
                      </Button>
                    </div>
                  )}

                  {scanMode === 'multi' && scanResult.items && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detected Ingredients:</h4>
                      <div className="space-y-2">
                        {scanResult.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item.name}</span>
                            <Badge variant="secondary">{item.category}</Badge>
                          </div>
                        ))}
                      </div>
                      
                      {scanResult.recipes && scanResult.recipes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Recipe Suggestions:</h4>
                          {scanResult.recipes.slice(0, 3).map((recipe, index) => (
                            <div key={index} className="p-2 border rounded">
                              <div className="font-medium text-sm">{recipe.name}</div>
                              <div className="text-xs text-gray-600">{recipe.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" onClick={resetScanner}>
                  Scan Another Item
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

