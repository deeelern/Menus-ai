import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Camera, ChefHat, Package, Calendar, Settings, User, LogOut } from 'lucide-react'
import './App.css'

// Import components (we'll create these)
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Scanner from './components/Scanner'
import Inventory from './components/Inventory'
import Recipes from './components/Recipes'
import MealPlanner from './components/MealPlanner'
import Profile from './components/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState('scanner')
  const [showLogin, setShowLogin] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (token) {
      // Verify token and get user profile
      fetchProfile()
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid
        handleLogout()
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      handleLogout()
    }
  }

  const handleLogin = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('token', accessToken)
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  // If not logged in and not in demo mode, show login/register forms
  if (!user && !demoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ChefHat className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">AI Kitchen Assistant</CardTitle>
            <CardDescription>
              Smart inventory management and recipe recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={showLogin ? 'login' : 'register'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" onClick={() => setShowLogin(true)}>Login</TabsTrigger>
                <TabsTrigger value="register" onClick={() => setShowLogin(false)}>Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onLogin={handleLogin} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onRegister={handleLogin} />
              </TabsContent>
            </Tabs>
            
            {/* Demo Mode Button */}
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setDemoMode(true)
                  setUser({ username: 'demo', first_name: 'Demo', email: 'demo@example.com' })
                  setToken('demo-token')
                }}
              >
                Try Demo Mode
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Explore the app without creating an account
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main application interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">AI Kitchen Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.first_name || user.username}!</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scanner" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center">
              <ChefHat className="h-4 w-4 mr-2" />
              Recipes
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Meal Planner
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="scanner">
              <Scanner user={user} token={token} />
            </TabsContent>
            <TabsContent value="inventory">
              <Inventory user={user} token={token} />
            </TabsContent>
            <TabsContent value="recipes">
              <Recipes user={user} token={token} />
            </TabsContent>
            <TabsContent value="planner">
              <MealPlanner user={user} token={token} />
            </TabsContent>
            <TabsContent value="profile">
              <Profile user={user} token={token} onUserUpdate={setUser} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

export default App
