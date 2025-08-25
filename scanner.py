from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import base64
import io
from PIL import Image
import json
from datetime import datetime, timedelta
from src.models.user import db
from src.models.inventory import InventoryItem

scanner_bp = Blueprint('scanner', __name__)

# Mock computer vision function (replace with actual API integration)
def analyze_food_image(image_data, mode='single'):
    """
    Mock function to analyze food images
    In production, this would integrate with Google Vision API, Clarifai, or similar
    """
    
    # Mock results for demonstration
    if mode == 'single':
        # Single item analysis
        mock_items = [
            {
                'name': 'Apple',
                'category': 'fruits',
                'confidence': 0.95,
                'freshness_score': 8,
                'estimated_expiry': (datetime.now() + timedelta(days=7)).isoformat(),
                'quantity': 1,
                'unit': 'piece'
            },
            {
                'name': 'Banana',
                'category': 'fruits',
                'confidence': 0.92,
                'freshness_score': 6,
                'estimated_expiry': (datetime.now() + timedelta(days=3)).isoformat(),
                'quantity': 1,
                'unit': 'piece'
            },
            {
                'name': 'Tomato',
                'category': 'vegetables',
                'confidence': 0.88,
                'freshness_score': 7,
                'estimated_expiry': (datetime.now() + timedelta(days=5)).isoformat(),
                'quantity': 1,
                'unit': 'piece'
            }
        ]
        
        # Return the first mock item (in real implementation, this would be based on actual image analysis)
        return {
            'item': mock_items[0],
            'confidence': mock_items[0]['confidence']
        }
    
    else:  # multi mode
        # Multi-item analysis for recipe generation
        mock_ingredients = [
            {'name': 'Chicken Breast', 'category': 'meat', 'confidence': 0.93},
            {'name': 'Bell Pepper', 'category': 'vegetables', 'confidence': 0.89},
            {'name': 'Onion', 'category': 'vegetables', 'confidence': 0.91},
            {'name': 'Garlic', 'category': 'vegetables', 'confidence': 0.87}
        ]
        
        mock_recipes = [
            {
                'name': 'Chicken Stir Fry',
                'description': 'Quick and healthy stir fry with chicken and vegetables',
                'prep_time': 15,
                'cook_time': 20,
                'difficulty': 'easy'
            },
            {
                'name': 'Chicken Fajitas',
                'description': 'Delicious chicken fajitas with peppers and onions',
                'prep_time': 10,
                'cook_time': 15,
                'difficulty': 'easy'
            }
        ]
        
        return {
            'items': mock_ingredients,
            'recipes': mock_recipes
        }

@scanner_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_image():
    """Scan an image to identify food items"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        mode = request.form.get('mode', 'single')  # 'single' or 'multi'
        
        if image_file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Read and process the image
        try:
            image_data = image_file.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Here you would integrate with actual computer vision API
            # For now, we'll use mock data
            analysis_result = analyze_food_image(image_data, mode)
            
            return jsonify(analysis_result), 200
            
        except Exception as e:
            return jsonify({'error': f'Error processing image: {str(e)}'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scanner_bp.route('/scan/history', methods=['GET'])
@jwt_required()
def get_scan_history():
    """Get user's scan history"""
    try:
        current_user_id = get_jwt_identity()
        
        # In a real implementation, you'd store scan history in the database
        # For now, return empty history
        return jsonify({
            'scans': [],
            'total': 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper function to estimate expiry date based on food type and freshness
def estimate_expiry_date(food_name, category, freshness_score):
    """Estimate expiry date based on food type and freshness score"""
    
    # Base shelf life in days for different categories
    shelf_life_map = {
        'fruits': 7,
        'vegetables': 5,
        'dairy': 7,
        'meat': 3,
        'fish': 2,
        'bread': 3,
        'grains': 365,
        'canned': 730
    }
    
    base_days = shelf_life_map.get(category.lower(), 7)
    
    # Adjust based on freshness score (1-10 scale)
    freshness_multiplier = freshness_score / 10.0
    adjusted_days = int(base_days * freshness_multiplier)
    
    return (datetime.now() + timedelta(days=adjusted_days)).isoformat()

# Helper function to generate recipe suggestions based on ingredients
def generate_recipe_suggestions(ingredients):
    """Generate recipe suggestions based on available ingredients"""
    
    # This is a mock implementation
    # In production, this would use a recipe API or ML model
    
    ingredient_names = [item['name'].lower() for item in ingredients]
    
    # Mock recipe database
    recipes = [
        {
            'name': 'Vegetable Stir Fry',
            'ingredients': ['bell pepper', 'onion', 'garlic', 'carrot'],
            'description': 'Quick and healthy vegetable stir fry',
            'prep_time': 10,
            'cook_time': 15,
            'difficulty': 'easy'
        },
        {
            'name': 'Chicken Pasta',
            'ingredients': ['chicken', 'pasta', 'tomato', 'garlic'],
            'description': 'Creamy chicken pasta with herbs',
            'prep_time': 15,
            'cook_time': 25,
            'difficulty': 'medium'
        },
        {
            'name': 'Fresh Salad',
            'ingredients': ['lettuce', 'tomato', 'cucumber', 'onion'],
            'description': 'Fresh garden salad with vinaigrette',
            'prep_time': 10,
            'cook_time': 0,
            'difficulty': 'easy'
        }
    ]
    
    # Find recipes that match available ingredients
    matching_recipes = []
    for recipe in recipes:
        match_count = sum(1 for ingredient in recipe['ingredients'] 
                         if any(ing in ingredient_names for ing in [ingredient]))
        if match_count > 0:
            recipe['match_score'] = match_count / len(recipe['ingredients'])
            matching_recipes.append(recipe)
    
    # Sort by match score
    matching_recipes.sort(key=lambda x: x['match_score'], reverse=True)
    
    return matching_recipes[:5]  # Return top 5 matches

