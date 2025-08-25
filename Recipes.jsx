import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ChefHat, Search, Filter, Clock, Users, Star, Heart, Lightbulb, TrendingUp } from 'lucide-react'

export default function Recipes({ user, token }) {
  const [recipes, setRecipes] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    cuisine: 'all',
    difficulty: 'all',
    maxTime: '',
    dietary: 'all'
  })
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [activeTab, setActiveTab] = useState('browse')

  const cuisines = ['all', 'american', 'italian', 'asian', 'mediterranean', 'mexican', 'indian']
  const difficulties = ['all', 'easy', 'medium', 'hard']
  const dietaryOptions = ['all', 'vegetarian', 'vegan', 'gluten-free', 'healthy', 'high-protein']

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchRecipes()
    } else if (activeTab === 'suggestions') {
      fetchSuggestions()
    } else if (activeTab === 'favorites') {
      fetchFavorites()
    }
  }, [activeTab, filters, searchTerm])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filters.cuisine !== 'all') params.append('cuisine', filters.cuisine)
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
      if (filters.maxTime) params.append('max_time', filters.maxTime)
      if (filters.dietary !== 'all') params.append('dietary_tags', filters.dietary)

      const response = await fetch(`/api/recipes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      } else {
        setError('Failed to fetch recipes')
        // Use mock data for demonstration
        setRecipes(getMockRecipes())
      }
    } catch (err) {
      setError('Error loading recipes: ' + err.message)
      // Use mock data for demonstration
      setRecipes(getMockRecipes())
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        setError('Failed to generate suggestions')
        // Use mock data for demonstration
        setSuggestions(getMockSuggestions())
      }
    } catch (err) {
      setError('Error generating suggestions: ' + err.message)
      // Use mock data for demonstration
      setSuggestions(getMockSuggestions())
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/recipes/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      } else {
        setError('Failed to fetch favorites')
        // Use mock data for demonstration
        setFavorites(getMockRecipes().slice(0, 2))
      }
    } catch (err) {
      setError('Error loading favorites: ' + err.message)
      // Use mock data for demonstration
      setFavorites(getMockRecipes().slice(0, 2))
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (recipeId) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Refresh favorites if on favorites tab
        if (activeTab === 'favorites') {
          fetchFavorites()
        }
      } else {
        setError('Failed to update favorite status')
      }
    } catch (err) {
      setError('Error updating favorite: ' + err.message)
    }
  }

  const getMockRecipes = () => [
    {
      id: 1,
      name: 'Chicken Stir Fry',
      description: 'Quick and healthy stir fry with chicken and vegetables',
      ingredients: ['chicken breast', 'bell pepper', 'onion', 'garlic', 'soy sauce', 'oil'],
      instructions: [
        'Cut chicken into strips',
        'Heat oil in wok or large pan',
        'Cook chicken until golden',
        'Add vegetables and stir fry',
        'Add soy sauce and seasonings',
        'Serve hot with rice'
      ],
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'asian',
      dietary_tags: ['high-protein', 'gluten-free-option'],
      nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18 }
    },
    {
      id: 2,
      name: 'Vegetable Pasta',
      description: 'Creamy pasta with seasonal vegetables',
      ingredients: ['pasta', 'zucchini', 'tomato', 'garlic', 'cream', 'parmesan', 'basil'],
      instructions: [
        'Cook pasta according to package directions',
        'Sauté vegetables in olive oil',
        'Add cream and simmer',
        'Toss with cooked pasta',
        'Add parmesan and basil',
        'Season and serve'
      ],
      prep_time: 10,
      cook_time: 25,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'italian',
      dietary_tags: ['vegetarian'],
      nutrition: { calories: 420, protein: 15, carbs: 52, fat: 16 }
    },
    {
      id: 3,
      name: 'Apple Cinnamon Oatmeal',
      description: 'Warm and comforting breakfast with fresh apples',
      ingredients: ['oats', 'apple', 'cinnamon', 'milk', 'honey', 'nuts'],
      instructions: [
        'Dice apple into small pieces',
        'Cook oats with milk',
        'Add apple and cinnamon',
        'Simmer until tender',
        'Sweeten with honey',
        'Top with nuts'
      ],
      prep_time: 5,
      cook_time: 15,
      servings: 2,
      difficulty: 'easy',
      cuisine: 'american',
      dietary_tags: ['vegetarian', 'healthy', 'breakfast'],
      nutrition: { calories: 280, protein: 8, carbs: 45, fat: 8 }
    },
    {
      id: 4,
      name: 'Salmon with Vegetables',
      description: 'Baked salmon with roasted seasonal vegetables',
      ingredients: ['salmon', 'broccoli', 'carrot', 'lemon', 'olive oil', 'herbs'],
      instructions: [
        'Preheat oven to 400°F',
        'Season salmon with herbs',
        'Cut vegetables into pieces',
        'Toss vegetables with oil',
        'Bake salmon and vegetables',
        'Serve with lemon'
      ],
      prep_time: 15,
      cook_time: 25,
      servings: 2,
      difficulty: 'medium',
      cuisine: 'mediterranean',
      dietary_tags: ['high-protein', 'healthy', 'gluten-free'],
      nutrition: { calories: 380, protein: 32, carbs: 15, fat: 22 }
    },
    {
      id: 5,
      name: 'Banana Smoothie',
      description: 'Creamy and nutritious breakfast smoothie',
      ingredients: ['banana', 'milk', 'yogurt', 'honey', 'oats', 'berries'],
      instructions: [
        'Peel and slice banana',
        'Add all ingredients to blender',
        'Blend until smooth',
        'Add ice if desired',
        'Pour into glass',
        'Garnish with berries'
      ],
      prep_time: 5,
      cook_time: 0,
      servings: 1,
      difficulty: 'easy',
      cuisine: 'american',
      dietary_tags: ['vegetarian', 'healthy', 'breakfast', 'quick'],
      nutrition: { calories: 320, protein: 12, carbs: 58, fat: 6 }
    }
  ]

  const getMockSuggestions = () => [
    {
      id: 1,
      name: 'Chicken Stir Fry',
      description: 'Quick and healthy stir fry with chicken and vegetables',
      match_percentage: 85,
      available_ingredients: ['chicken breast', 'bell pepper', 'onion'],
      missing_ingredients: ['garlic', 'soy sauce', 'oil'],
      prep_time: 15,
      cook_time: 20,
      difficulty: 'easy'
    },
    {
      id: 3,
      name: 'Apple Cinnamon Oatmeal',
      description: 'Warm and comforting breakfast with fresh apples',
      match_percentage: 70,
      available_ingredients: ['apple', 'milk'],
      missing_ingredients: ['oats', 'cinnamon', 'honey', 'nuts'],
      prep_time: 5,
      cook_time: 15,
      difficulty: 'easy'
    }
  ]

  const RecipeCard = ({ recipe, showMatch = false }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedRecipe(recipe)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{recipe.name}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(recipe.id)
            }}
            className="h-8 w-8 p-0"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
        
        {showMatch && recipe.match_percentage && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Ingredient Match</span>
              <Badge variant="secondary">{recipe.match_percentage}%</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${recipe.match_percentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {(recipe.prep_time || 0) + (recipe.cook_time || 0)}min
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {recipe.servings || 1}
          </div>
          <Badge variant="outline" className="text-xs">
            {recipe.difficulty || 'easy'}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {recipe.dietary_tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.dietary_tags?.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{recipe.dietary_tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const RecipeDetail = ({ recipe, onClose }) => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{recipe.name}</CardTitle>
            <CardDescription className="mt-2">{recipe.description}</CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Total Time</div>
              <div className="text-sm text-gray-600">
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)} minutes
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Servings</div>
              <div className="text-sm text-gray-600">{recipe.servings || 1}</div>
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Difficulty</div>
              <div className="text-sm text-gray-600 capitalize">{recipe.difficulty || 'easy'}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients?.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-sm capitalize">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Instructions</h3>
            <ol className="space-y-2">
              {recipe.instructions?.map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {recipe.nutrition && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Nutrition (per serving)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{recipe.nutrition.calories}</div>
                <div className="text-xs text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{recipe.nutrition.protein}g</div>
                <div className="text-xs text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{recipe.nutrition.carbs}g</div>
                <div className="text-xs text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{recipe.nutrition.fat}g</div>
                <div className="text-xs text-gray-600">Fat</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-6">
          <Button onClick={() => toggleFavorite(recipe.id)} className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            Add to Favorites
          </Button>
          <Button variant="outline">
            Add to Meal Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (selectedRecipe) {
    return <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChefHat className="h-5 w-5 mr-2" />
            Recipe Center
          </CardTitle>
          <CardDescription>
            Discover recipes, get personalized suggestions, and manage your favorites
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search recipes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchRecipes}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Cuisine</Label>
                    <Select value={filters.cuisine} onValueChange={(value) => setFilters({...filters, cuisine: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cuisines.map(cuisine => (
                          <SelectItem key={cuisine} value={cuisine}>
                            {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={filters.difficulty} onValueChange={(value) => setFilters({...filters, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(difficulty => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Max Time (min)</Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={filters.maxTime}
                      onChange={(e) => setFilters({...filters, maxTime: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Dietary</Label>
                    <Select value={filters.dietary} onValueChange={(value) => setFilters({...filters, dietary: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dietaryOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Grid */}
          {loading ? (
            <div className="text-center py-8">
              <ChefHat className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recipes found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">AI Recipe Suggestions</h3>
                  <p className="text-sm text-gray-600">Based on your current inventory</p>
                </div>
                <Button onClick={fetchSuggestions}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-8">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Generating suggestions...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No suggestions available</p>
              <p className="text-sm mt-2">Add items to your inventory to get personalized suggestions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} showMatch={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Star className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Loading favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No favorite recipes yet</p>
              <p className="text-sm mt-2">Browse recipes and add them to your favorites</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

