import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { User } from 'lucide-react'

export default function Profile({ user, token, onUserUpdate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          User Profile
        </CardTitle>
        <CardDescription>
          Manage your account and dietary preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Account Information</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              {user.first_name && <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>}
              <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="text-center py-4 text-gray-500">
            <p>Profile management and dietary preferences coming soon!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

