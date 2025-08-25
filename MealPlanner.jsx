import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Calendar, ShoppingCart, Plus, Trash2, Edit, Clock, Users, ChefHat, CheckCircle, Circle } from 'lucide-react'

export default function MealPlanner({ user, token }) {
  const [mealPlan, setMealPlan] = useState({})
  const [shoppingList, setShoppingList] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedMealType, setSelectedMealType] = useState('')
  const [activeTab, setActiveTab] = useState('planner')
  const [nutritionSummary, setNutritionSummary] = useState({})

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

  // Mock recipes for meal planning
  const mockRecipes = [
    {
      id: 1,
      name: 'Chicken Stir Fry',
      prep_time: 15,
      cook_time: 20,
      servings: 4,
      ingredients: ['chicken breast', 'bell pepper', 'onion', 'garlic', 'soy sauce', 'oil'],
      nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18 }
    },
    {
      id: 2,
      name: 'Vegetable Pasta',
      prep_time: 10,
      cook_time: 25,
      servings: 4,
      ingredients: ['pasta', 'zucchini', 'tomato', 'garlic', 'cream', 'parmesan', 'basil'],
      nutrition: { calories: 420, protein: 15, carbs: 52, fat: 16 }
    },
    {
      id: 3,
      name: 'Apple Cinnamon Oatmeal',
      prep_time: 5,
      cook_time: 15,
      servings: 2,
      ingredients: ['oats', 'apple', 'cinnamon', 'milk', 'honey', 'nuts'],
      nutrition: { calories: 280, protein: 8, carbs: 45, fat: 8 }
    },
    {
      id: 4,
      name: 'Salmon with Vegetables',
      prep_time: 15,
      cook_time: 25,
      servings: 2,
      ingredients: ['salmon', 'broccoli', 'carrot', 'lemon', 'olive oil', 'herbs'],
      nutrition: { calories: 380, protein: 32, carbs: 15, fat: 22 }
    },
    {
      id: 5,
      name: 'Banana Smoothie',
      prep_time: 5,
      cook_time: 0,
      servings: 1,
      ingredients: ['banana', 'milk', 'yogurt', 'honey', 'oats', 'berries'],
      nutrition: { calories: 320, protein: 12, carbs: 58, fat: 6 }
    }
  ]

  useEffect(() => {
    loadMealPlan()
    generateShoppingList()
    calculateNutritionSummary()
  }, [selectedWeek])

  function getCurrentWeek() {
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    return monday.toISOString().split('T')[0]
  }

  const loadMealPlan = async () => {
    try {
      setLoading(true)
      setError('')

      // Mock meal plan data
      const mockMealPlan = {
        'Monday': {
          breakfast: { recipe: mockRecipes[2], servings: 2 },
          lunch: { recipe: mockRecipes[1], servings: 2 },
          dinner: { recipe: mockRecipes[0], servings: 4 }
        },
        'Tuesday': {
          breakfast: { recipe: mockRecipes[4], servings: 1 },
          dinner: { recipe: mockRecipes[3], servings: 2 }
        },
        'Wednesday': {
          lunch: { recipe: mockRecipes[1], servings: 3 },
          dinner: { recipe: mockRecipes[0], servings: 4 }
        }
      }

      setMealPlan(mockMealPlan)
    } catch (err) {
      setError('Error loading meal plan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateShoppingList = () => {
    const ingredients = {}
    
    // Collect all ingredients from meal plan
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (meal.recipe && meal.recipe.ingredients) {
          meal.recipe.ingredients.forEach(ingredient => {
            const scaledAmount = (meal.servings || 1) / (meal.recipe.servings || 1)
            if (ingredients[ingredient]) {
              ingredients[ingredient].amount += scaledAmount
            } else {
              ingredients[ingredient] = {
                name: ingredient,
                amount: scaledAmount,
                unit: 'portion',
                category: getIngredientCategory(ingredient),
                checked: false
              }
            }
          })
        }
      })
    })

    setShoppingList(Object.values(ingredients))
  }

  const calculateNutritionSummary = () => {
    const summary = {
      daily: {},
      weekly: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    daysOfWeek.forEach(day => {
      const dayMeals = mealPlan[day] || {}
      const dayNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }

      Object.values(dayMeals).forEach(meal => {
        if (meal.recipe && meal.recipe.nutrition) {
          const scale = (meal.servings || 1) / (meal.recipe.servings || 1)
          dayNutrition.calories += meal.recipe.nutrition.calories * scale
          dayNutrition.protein += meal.recipe.nutrition.protein * scale
          dayNutrition.carbs += meal.recipe.nutrition.carbs * scale
          dayNutrition.fat += meal.recipe.nutrition.fat * scale
        }
      })

      summary.daily[day] = dayNutrition
      summary.weekly.calories += dayNutrition.calories
      summary.weekly.protein += dayNutrition.protein
      summary.weekly.carbs += dayNutrition.carbs
      summary.weekly.fat += dayNutrition.fat
    })

    setNutritionSummary(summary)
  }

  const getIngredientCategory = (ingredient) => {
    const categories = {
      'chicken breast': 'meat',
      'salmon': 'fish',
      'pasta': 'grains',
      'oats': 'grains',
      'milk': 'dairy',
      'cream': 'dairy',
      'parmesan': 'dairy',
      'yogurt': 'dairy',
      'bell pepper': 'vegetables',
      'onion': 'vegetables',
      'zucchini': 'vegetables',
      'tomato': 'vegetables',
      'broccoli': 'vegetables',
      'carrot': 'vegetables',
      'apple': 'fruits',
      'banana': 'fruits',
      'berries': 'fruits',
      'garlic': 'seasonings',
      'basil': 'seasonings',
      'herbs': 'seasonings',
      'cinnamon': 'seasonings'
    }
    return categories[ingredient.toLowerCase()] || 'other'
  }

  const addMealToPlan = (day, mealType, recipe, servings = null) => {
    const newMealPlan = { ...mealPlan }
    if (!newMealPlan[day]) {
      newMealPlan[day] = {}
    }
    
    newMealPlan[day][mealType] = {
      recipe: recipe,
      servings: servings || recipe.servings
    }
    
    setMealPlan(newMealPlan)
    setShowAddMeal(false)
    setSelectedDay('')
    setSelectedMealType('')
  }

  const removeMealFromPlan = (day, mealType) => {
    const newMealPlan = { ...mealPlan }
    if (newMealPlan[day] && newMealPlan[day][mealType]) {
      delete newMealPlan[day][mealType]
      if (Object.keys(newMealPlan[day]).length === 0) {
        delete newMealPlan[day]
      }
    }
    setMealPlan(newMealPlan)
  }

  const toggleShoppingItem = (index) => {
    const newShoppingList = [...shoppingList]
    newShoppingList[index].checked = !newShoppingList[index].checked
    setShoppingList(newShoppingList)
  }

  const MealCard = ({ meal, day, mealType }) => (
    <Card className="h-full">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm">{meal.recipe.name}</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeMealFromPlan(day, mealType)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {(meal.recipe.prep_time || 0) + (meal.recipe.cook_time || 0)}min
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {meal.servings} servings
          </div>
          {meal.recipe.nutrition && (
            <div className="text-xs">
              {Math.round(meal.recipe.nutrition.calories * (meal.servings / meal.recipe.servings))} cal
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const AddMealDialog = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Meal</CardTitle>
        <CardDescription>
          Add a meal to {selectedDay} {selectedMealType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecipes.map(recipe => (
            <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{recipe.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</span>
                      <span>{recipe.servings} servings</span>
                      {recipe.nutrition && <span>{recipe.nutrition.calories} cal</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addMealToPlan(selectedDay, selectedMealType, recipe)}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddMeal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (showAddMeal) {
    return <AddMealDialog />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Meal Planner
          </CardTitle>
          <CardDescription>
            Plan your meals and generate shopping lists automatically
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planner" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Meal Plan
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center">
            <ChefHat className="h-4 w-4 mr-2" />
            Nutrition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-4">
          {/* Week Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Week Starting</Label>
                  <Input
                    type="date"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={() => {
                  generateShoppingList()
                  calculateNutritionSummary()
                }}>
                  Refresh Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meal Plan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {daysOfWeek.map(day => (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mealTypes.map(mealType => (
                    <div key={mealType} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium capitalize text-gray-600">
                          {mealType}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedDay(day)
                            setSelectedMealType(mealType)
                            setShowAddMeal(true)
                          }}
                          className="h-5 w-5 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {mealPlan[day] && mealPlan[day][mealType] ? (
                        <MealCard 
                          meal={mealPlan[day][mealType]} 
                          day={day} 
                          mealType={mealType} 
                        />
                      ) : (
                        <div className="h-16 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                          No meal planned
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shopping List</CardTitle>
                  <CardDescription>
                    Auto-generated from your meal plan
                  </CardDescription>
                </div>
                <Button onClick={generateShoppingList}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shoppingList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No items in shopping list</p>
                  <p className="text-sm mt-2">Add meals to your plan to generate a shopping list</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Group by category */}
                  {['meat', 'fish', 'dairy', 'vegetables', 'fruits', 'grains', 'seasonings', 'other'].map(category => {
                    const categoryItems = shoppingList.filter(item => item.category === category)
                    if (categoryItems.length === 0) return null

                    return (
                      <div key={category}>
                        <h3 className="font-semibold mb-2 capitalize">{category}</h3>
                        <div className="space-y-2">
                          {categoryItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleShoppingItem(shoppingList.indexOf(item))}
                                className="h-6 w-6 p-0"
                              >
                                {item.checked ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </Button>
                              <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                                {item.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {Math.round(item.amount * 10) / 10} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Summary</CardTitle>
              <CardDescription>
                Weekly nutrition breakdown from your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Weekly Summary */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Weekly Totals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(nutritionSummary.weekly?.calories || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(nutritionSummary.weekly?.protein || 0)}g
                    </div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(nutritionSummary.weekly?.carbs || 0)}g
                    </div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(nutritionSummary.weekly?.fat || 0)}g
                    </div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Daily Breakdown</h3>
                <div className="space-y-3">
                  {daysOfWeek.map(day => {
                    const dayNutrition = nutritionSummary.daily?.[day]
                    if (!dayNutrition || dayNutrition.calories === 0) return null

                    return (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{day}</span>
                        <div className="flex gap-4 text-sm">
                          <span>{Math.round(dayNutrition.calories)} cal</span>
                          <span>{Math.round(dayNutrition.protein)}g protein</span>
                          <span>{Math.round(dayNutrition.carbs)}g carbs</span>
                          <span>{Math.round(dayNutrition.fat)}g fat</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
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

