from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import db
from src.models.inventory import InventoryItem
from src.models.recipe import Recipe
from src.models.preferences import UserPreferences
import json

recipes_bp = Blueprint('recipes', __name__)

# Mock recipe database - in production, this would be a real database or API
MOCK_RECIPES = [
    {
        'id': 1,
        'name': 'Chicken Stir Fry',
        'description': 'Quick and healthy stir fry with chicken and vegetables',
        'ingredients': ['chicken breast', 'bell pepper', 'onion', 'garlic', 'soy sauce', 'oil'],
        'instructions': [
            'Cut chicken into strips',
            'Heat oil in wok or large pan',
            'Cook chicken until golden',
            'Add vegetables and stir fry',
            'Add soy sauce and seasonings',
            'Serve hot with rice'
        ],
        'prep_time': 15,
        'cook_time': 20,
        'servings': 4,
        'difficulty': 'easy',
        'cuisine': 'asian',
        'dietary_tags': ['high-protein', 'gluten-free-option'],
        'nutrition': {
            'calories': 320,
            'protein': 28,
            'carbs': 12,
            'fat': 18
        }
    },
    {
        'id': 2,
        'name': 'Vegetable Pasta',
        'description': 'Creamy pasta with seasonal vegetables',
        'ingredients': ['pasta', 'zucchini', 'tomato', 'garlic', 'cream', 'parmesan', 'basil'],
        'instructions': [
            'Cook pasta according to package directions',
            'Sauté vegetables in olive oil',
            'Add cream and simmer',
            'Toss with cooked pasta',
            'Add parmesan and basil',
            'Season and serve'
        ],
        'prep_time': 10,
        'cook_time': 25,
        'servings': 4,
        'difficulty': 'easy',
        'cuisine': 'italian',
        'dietary_tags': ['vegetarian'],
        'nutrition': {
            'calories': 420,
            'protein': 15,
            'carbs': 52,
            'fat': 16
        }
    },
    {
        'id': 3,
        'name': 'Apple Cinnamon Oatmeal',
        'description': 'Warm and comforting breakfast with fresh apples',
        'ingredients': ['oats', 'apple', 'cinnamon', 'milk', 'honey', 'nuts'],
        'instructions': [
            'Dice apple into small pieces',
            'Cook oats with milk',
            'Add apple and cinnamon',
            'Simmer until tender',
            'Sweeten with honey',
            'Top with nuts'
        ],
        'prep_time': 5,
        'cook_time': 15,
        'servings': 2,
        'difficulty': 'easy',
        'cuisine': 'american',
        'dietary_tags': ['vegetarian', 'healthy', 'breakfast'],
        'nutrition': {
            'calories': 280,
            'protein': 8,
            'carbs': 45,
            'fat': 8
        }
    },
    {
        'id': 4,
        'name': 'Salmon with Vegetables',
        'description': 'Baked salmon with roasted seasonal vegetables',
        'ingredients': ['salmon', 'broccoli', 'carrot', 'lemon', 'olive oil', 'herbs'],
        'instructions': [
            'Preheat oven to 400°F',
            'Season salmon with herbs',
            'Cut vegetables into pieces',
            'Toss vegetables with oil',
            'Bake salmon and vegetables',
            'Serve with lemon'
        ],
        'prep_time': 15,
        'cook_time': 25,
        'servings': 2,
        'difficulty': 'medium',
        'cuisine': 'mediterranean',
        'dietary_tags': ['high-protein', 'healthy', 'gluten-free'],
        'nutrition': {
            'calories': 380,
            'protein': 32,
            'carbs': 15,
            'fat': 22
        }
    },
    {
        'id': 5,
        'name': 'Banana Smoothie',
        'description': 'Creamy and nutritious breakfast smoothie',
        'ingredients': ['banana', 'milk', 'yogurt', 'honey', 'oats', 'berries'],
        'instructions': [
            'Peel and slice banana',
            'Add all ingredients to blender',
            'Blend until smooth',
            'Add ice if desired',
            'Pour into glass',
            'Garnish with berries'
        ],
        'prep_time': 5,
        'cook_time': 0,
        'servings': 1,
        'difficulty': 'easy',
        'cuisine': 'american',
        'dietary_tags': ['vegetarian', 'healthy', 'breakfast', 'quick'],
        'nutrition': {
            'calories': 320,
            'protein': 12,
            'carbs': 58,
            'fat': 6
        }
    }
]

@recipes_bp.route('/recipes', methods=['GET'])
@jwt_required()
def get_recipes():
    """Get recipes with optional filtering"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        cuisine = request.args.get('cuisine')
        difficulty = request.args.get('difficulty')
        dietary_tags = request.args.get('dietary_tags')
        max_time = request.args.get('max_time', type=int)
        search = request.args.get('search', '').lower()
        
        # Filter recipes
        filtered_recipes = MOCK_RECIPES.copy()
        
        if cuisine:
            filtered_recipes = [r for r in filtered_recipes if r['cuisine'] == cuisine]
        
        if difficulty:
            filtered_recipes = [r for r in filtered_recipes if r['difficulty'] == difficulty]
        
        if dietary_tags:
            tags = dietary_tags.split(',')
            filtered_recipes = [r for r in filtered_recipes 
                              if any(tag in r['dietary_tags'] for tag in tags)]
        
        if max_time:
            filtered_recipes = [r for r in filtered_recipes 
                              if (r['prep_time'] + r['cook_time']) <= max_time]
        
        if search:
            filtered_recipes = [r for r in filtered_recipes 
                              if search in r['name'].lower() or 
                                 search in r['description'].lower() or
                                 any(search in ing.lower() for ing in r['ingredients'])]
        
        return jsonify({
            'recipes': filtered_recipes,
            'total': len(filtered_recipes)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recipes_bp.route('/recipes/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_recipe(recipe_id):
    """Get a specific recipe by ID"""
    try:
        recipe = next((r for r in MOCK_RECIPES if r['id'] == recipe_id), None)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        return jsonify({'recipe': recipe}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recipes_bp.route('/recipes/generate', methods=['POST'])
@jwt_required()
def generate_recipes():
    """Generate recipe suggestions based on available ingredients"""
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        # Get ingredients from request or user's inventory
        if 'ingredients' in data:
            available_ingredients = [ing.lower() for ing in data['ingredients']]
        else:
            # Get from user's inventory
            inventory_items = InventoryItem.query.filter_by(user_id=current_user_id).all()
            available_ingredients = [item.name.lower() for item in inventory_items]
        
        # Get user preferences
        preferences = UserPreferences.query.filter_by(user_id=current_user_id).first()
        
        # Generate recipe suggestions
        suggestions = generate_recipe_suggestions(available_ingredients, preferences)
        
        return jsonify({
            'suggestions': suggestions,
            'available_ingredients': available_ingredients,
            'total': len(suggestions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recipes_bp.route('/recipes/substitute', methods=['POST'])
@jwt_required()
def get_substitutions():
    """Get ingredient substitutions"""
    try:
        data = request.json
        ingredient = data.get('ingredient', '').lower()
        
        if not ingredient:
            return jsonify({'error': 'Ingredient is required'}), 400
        
        substitutions = get_ingredient_substitutions(ingredient)
        
        return jsonify({
            'ingredient': ingredient,
            'substitutions': substitutions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recipes_bp.route('/recipes/favorites', methods=['GET'])
@jwt_required()
def get_favorite_recipes():
    """Get user's favorite recipes"""
    try:
        current_user_id = get_jwt_identity()
        
        # In a real implementation, this would query the database
        # For now, return a subset of recipes
        favorites = MOCK_RECIPES[:3]  # Mock favorites
        
        return jsonify({
            'favorites': favorites,
            'total': len(favorites)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@recipes_bp.route('/recipes/<int:recipe_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(recipe_id):
    """Toggle recipe as favorite"""
    try:
        current_user_id = get_jwt_identity()
        
        # In a real implementation, this would update the database
        # For now, just return success
        
        return jsonify({
            'message': 'Recipe favorite status updated',
            'recipe_id': recipe_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_recipe_suggestions(available_ingredients, preferences=None):
    """Generate recipe suggestions based on available ingredients and preferences"""
    
    suggestions = []
    
    for recipe in MOCK_RECIPES:
        # Calculate match score
        recipe_ingredients = [ing.lower() for ing in recipe['ingredients']]
        matches = sum(1 for ing in recipe_ingredients if ing in available_ingredients)
        match_percentage = (matches / len(recipe_ingredients)) * 100
        
        # Only include recipes with at least 30% ingredient match
        if match_percentage >= 30:
            suggestion = recipe.copy()
            suggestion['match_percentage'] = round(match_percentage, 1)
            suggestion['missing_ingredients'] = [
                ing for ing in recipe_ingredients 
                if ing not in available_ingredients
            ]
            suggestion['available_ingredients'] = [
                ing for ing in recipe_ingredients 
                if ing in available_ingredients
            ]
            
            # Apply preference filters if available
            if preferences:
                # Check dietary restrictions
                if preferences.dietary_restrictions:
                    restrictions = json.loads(preferences.dietary_restrictions)
                    if any(restriction in recipe['dietary_tags'] for restriction in restrictions):
                        continue
                
                # Boost score for preferred cuisines
                if preferences.preferred_cuisines:
                    preferred = json.loads(preferences.preferred_cuisines)
                    if recipe['cuisine'] in preferred:
                        suggestion['match_percentage'] += 10
            
            suggestions.append(suggestion)
    
    # Sort by match percentage
    suggestions.sort(key=lambda x: x['match_percentage'], reverse=True)
    
    return suggestions[:10]  # Return top 10 suggestions

def get_ingredient_substitutions(ingredient):
    """Get substitution suggestions for an ingredient"""
    
    # Mock substitution database
    substitutions_db = {
        'chicken': ['turkey', 'tofu', 'tempeh', 'seitan'],
        'beef': ['turkey', 'mushrooms', 'lentils', 'beans'],
        'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk'],
        'butter': ['olive oil', 'coconut oil', 'margarine', 'applesauce'],
        'eggs': ['flax eggs', 'chia eggs', 'applesauce', 'banana'],
        'flour': ['almond flour', 'coconut flour', 'oat flour', 'rice flour'],
        'sugar': ['honey', 'maple syrup', 'stevia', 'dates'],
        'cream': ['coconut cream', 'cashew cream', 'greek yogurt'],
        'cheese': ['nutritional yeast', 'cashew cheese', 'tofu'],
        'onion': ['shallots', 'leeks', 'garlic', 'onion powder'],
        'garlic': ['garlic powder', 'shallots', 'ginger'],
        'lemon': ['lime', 'vinegar', 'citric acid'],
        'tomato': ['tomato paste', 'tomato sauce', 'red pepper'],
        'bell pepper': ['poblano pepper', 'zucchini', 'eggplant'],
        'pasta': ['zucchini noodles', 'spaghetti squash', 'rice noodles'],
        'rice': ['quinoa', 'cauliflower rice', 'barley', 'bulgur']
    }
    
    # Find substitutions
    substitutions = substitutions_db.get(ingredient, [])
    
    # Add context-aware suggestions
    result = []
    for sub in substitutions:
        result.append({
            'ingredient': sub,
            'ratio': '1:1',  # Default ratio
            'notes': f'Good substitute for {ingredient}',
            'category': 'direct'
        })
    
    return result

@recipes_bp.route('/recipes/nutrition/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_recipe_nutrition(recipe_id):
    """Get detailed nutrition information for a recipe"""
    try:
        recipe = next((r for r in MOCK_RECIPES if r['id'] == recipe_id), None)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Return nutrition info with additional details
        nutrition = recipe.get('nutrition', {})
        
        # Add percentage daily values (based on 2000 calorie diet)
        daily_values = {
            'calories': round((nutrition.get('calories', 0) / 2000) * 100, 1),
            'protein': round((nutrition.get('protein', 0) / 50) * 100, 1),
            'carbs': round((nutrition.get('carbs', 0) / 300) * 100, 1),
            'fat': round((nutrition.get('fat', 0) / 65) * 100, 1)
        }
        
        return jsonify({
            'recipe_id': recipe_id,
            'nutrition': nutrition,
            'daily_values': daily_values,
            'servings': recipe.get('servings', 1)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

