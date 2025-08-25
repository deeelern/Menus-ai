from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cuisine_type = db.Column(db.String(50), nullable=True)  # Italian, Chinese, Mexican, etc.
    difficulty_level = db.Column(db.String(20), nullable=False, default='medium')  # easy, medium, hard
    prep_time = db.Column(db.Integer, nullable=True)  # in minutes
    cook_time = db.Column(db.Integer, nullable=True)  # in minutes
    total_time = db.Column(db.Integer, nullable=True)  # in minutes
    servings = db.Column(db.Integer, nullable=False, default=4)
    calories_per_serving = db.Column(db.Integer, nullable=True)
    instructions = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(200), nullable=True)
    source = db.Column(db.String(100), nullable=True)  # generated, api, user_created
    external_id = db.Column(db.String(100), nullable=True)  # ID from external API
    tags = db.Column(db.Text, nullable=True)  # JSON array of tags
    nutritional_info = db.Column(db.Text, nullable=True)  # JSON object with nutrition data
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Recipe {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'cuisine_type': self.cuisine_type,
            'difficulty_level': self.difficulty_level,
            'prep_time': self.prep_time,
            'cook_time': self.cook_time,
            'total_time': self.total_time,
            'servings': self.servings,
            'calories_per_serving': self.calories_per_serving,
            'instructions': self.instructions,
            'image_url': self.image_url,
            'source': self.source,
            'external_id': self.external_id,
            'tags': self.tags,
            'nutritional_info': self.nutritional_info,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class RecipeIngredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.String(200), nullable=True)  # optional, chopped, etc.
    is_optional = db.Column(db.Boolean, nullable=False, default=False)

    # Relationship
    recipe = db.relationship('Recipe', backref=db.backref('ingredients', lazy=True, cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<RecipeIngredient {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'name': self.name,
            'quantity': self.quantity,
            'unit': self.unit,
            'notes': self.notes,
            'is_optional': self.is_optional
        }


class UserRecipe(db.Model):
    """Junction table for user's saved/favorite recipes"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    is_favorite = db.Column(db.Boolean, nullable=False, default=False)
    rating = db.Column(db.Integer, nullable=True)  # 1-5 stars
    notes = db.Column(db.Text, nullable=True)
    times_cooked = db.Column(db.Integer, nullable=False, default=0)
    last_cooked = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('user_recipes', lazy=True))
    recipe = db.relationship('Recipe', backref=db.backref('user_recipes', lazy=True))

    # Unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe'),)

    def __repr__(self):
        return f'<UserRecipe user_id={self.user_id} recipe_id={self.recipe_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'recipe_id': self.recipe_id,
            'is_favorite': self.is_favorite,
            'rating': self.rating,
            'notes': self.notes,
            'times_cooked': self.times_cooked,
            'last_cooked': self.last_cooked.isoformat() if self.last_cooked else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

