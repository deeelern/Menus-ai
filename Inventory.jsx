import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Package, Plus, Search, Filter, Calendar, AlertTriangle, Trash2, Edit } from 'lucide-react'

export default function Inventory({ user, token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [stats, setStats] = useState({})

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    quantity: 1,
    unit: 'piece',
    expiry_date: '',
    location: 'pantry',
    notes: ''
  })

  const categories = [
    'fruits', 'vegetables', 'dairy', 'meat', 'fish', 'bread', 'grains', 'canned', 'frozen', 'other'
  ]

  const locations = [
    'pantry', 'refrigerator', 'freezer', 'counter', 'cabinet'
  ]

  useEffect(() => {
    fetchInventory()
    fetchStats()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else {
        setError('Failed to fetch inventory')
      }
    } catch (err) {
      setError('Error loading inventory: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inventory/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchInventory()
        await fetchStats()
        setShowAddForm(false)
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add item')
      }
    } catch (err) {
      setError('Error adding item: ' + err.message)
    }
  }

  const handleUpdateItem = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchInventory()
        await fetchStats()
        setEditingItem(null)
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update item')
      }
    } catch (err) {
      setError('Error updating item: ' + err.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchInventory()
        await fetchStats()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete item')
      }
    } catch (err) {
      setError('Error deleting item: ' + err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'other',
      quantity: 1,
      unit: 'piece',
      expiry_date: '',
      location: 'pantry',
      notes: ''
    })
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      location: item.location || 'pantry',
      notes: item.notes || ''
    })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setShowAddForm(false)
    resetForm()
  }

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry) }
    if (daysUntilExpiry <= 3) return { status: 'expiring', days: daysUntilExpiry }
    return { status: 'fresh', days: daysUntilExpiry }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Loading inventory...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{stats.total_items || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiring_soon || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(stats.categories || {}).length}</p>
              </div>
              <Filter className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Kitchen Inventory
              </CardTitle>
              <CardDescription>
                Manage your kitchen inventory and track expiration dates
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="g">Gram</SelectItem>
                          <SelectItem value="l">Liter</SelectItem>
                          <SelectItem value="ml">Milliliter</SelectItem>
                          <SelectItem value="cup">Cup</SelectItem>
                          <SelectItem value="tbsp">Tablespoon</SelectItem>
                          <SelectItem value="tsp">Teaspoon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location.charAt(0).toUpperCase() + location.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Optional notes..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items found</p>
              <p className="text-sm mt-2">
                {items.length === 0 ? 'Add items to your inventory or use the scanner.' : 'Try adjusting your search or filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const expiryStatus = getExpiryStatus(item.expiry_date)
                
                return (
                  <Card key={item.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <Badge variant="secondary">
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span>{item.quantity} {item.unit}</span>
                        </div>
                        
                        {item.location && (
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span>{item.location.charAt(0).toUpperCase() + item.location.slice(1)}</span>
                          </div>
                        )}
                        
                        {expiryStatus && (
                          <div className="flex justify-between">
                            <span>Expiry:</span>
                            <Badge 
                              variant={
                                expiryStatus.status === 'expired' ? 'destructive' :
                                expiryStatus.status === 'expiring' ? 'default' : 'secondary'
                              }
                            >
                              {expiryStatus.status === 'expired' 
                                ? `Expired ${expiryStatus.days} days ago`
                                : expiryStatus.status === 'expiring'
                                ? `${expiryStatus.days} days left`
                                : `${expiryStatus.days} days left`
                              }
                            </Badge>
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

