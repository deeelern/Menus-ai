from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class UserPreferences(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    dietary_restrictions = db.Column(db.Text, nullable=True)  # JSON array: vegetarian, vegan, gluten-free, etc.
    allergies = db.Column(db.Text, nullable=True)  # JSON array: nuts, dairy, shellfish, etc.
    disliked_ingredients = db.Column(db.Text, nullable=True)  # JSON array of ingredients user dislikes
    preferred_cuisines = db.Column(db.Text, nullable=True)  # JSON array: Italian, Chinese, Mexican, etc.
    cooking_skill_level = db.Column(db.String(20), nullable=False, default='beginner')  # beginner, intermediate, advanced
    max_prep_time = db.Column(db.Integer, nullable=True)  # maximum prep time in minutes
    max_cook_time = db.Column(db.Integer, nullable=True)  # maximum cook time in minutes
    preferred_meal_types = db.Column(db.Text, nullable=True)  # JSON array: breakfast, lunch, dinner, snack
    household_size = db.Column(db.Integer, nullable=False, default=1)
    budget_preference = db.Column(db.String(20), nullable=False, default='medium')  # low, medium, high
    health_goals = db.Column(db.Text, nullable=True)  # JSON array: weight_loss, muscle_gain, heart_healthy, etc.
    notification_preferences = db.Column(db.Text, nullable=True)  # JSON object with notification settings
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('preferences', uselist=False))

    def __repr__(self):
        return f'<UserPreferences user_id={self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'dietary_restrictions': self.dietary_restrictions,
            'allergies': self.allergies,
            'disliked_ingredients': self.disliked_ingredients,
            'preferred_cuisines': self.preferred_cuisines,
            'cooking_skill_level': self.cooking_skill_level,
            'max_prep_time': self.max_prep_time,
            'max_cook_time': self.max_cook_time,
            'preferred_meal_types': self.preferred_meal_types,
            'household_size': self.household_size,
            'budget_preference': self.budget_preference,
            'health_goals': self.health_goals,
            'notification_preferences': self.notification_preferences,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class MealPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('meal_plans', lazy=True))

    def __repr__(self):
        return f'<MealPlan {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class MealPlanItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meal_plan_id = db.Column(db.Integer, db.ForeignKey('meal_plan.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    meal_date = db.Column(db.Date, nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)  # breakfast, lunch, dinner, snack
    servings = db.Column(db.Integer, nullable=False, default=1)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    notes = db.Column(db.Text, nullable=True)

    # Relationships
    meal_plan = db.relationship('MealPlan', backref=db.backref('meal_items', lazy=True, cascade='all, delete-orphan'))
    recipe = db.relationship('Recipe', backref=db.backref('meal_plan_items', lazy=True))

    def __repr__(self):
        return f'<MealPlanItem {self.meal_type} on {self.meal_date}>'

    def to_dict(self):
        return {
            'id': self.id,
            'meal_plan_id': self.meal_plan_id,
            'recipe_id': self.recipe_id,
            'meal_date': self.meal_date.isoformat() if self.meal_date else None,
            'meal_type': self.meal_type,
            'servings': self.servings,
            'is_completed': self.is_completed,
            'notes': self.notes
        }


class ShoppingList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('shopping_lists', lazy=True))

    def __repr__(self):
        return f'<ShoppingList {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ShoppingListItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shopping_list_id = db.Column(db.Integer, db.ForeignKey('shopping_list.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    unit = db.Column(db.String(20), nullable=False, default='piece')
    category = db.Column(db.String(50), nullable=True)
    is_purchased = db.Column(db.Boolean, nullable=False, default=False)
    estimated_price = db.Column(db.Float, nullable=True)
    actual_price = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    # Relationship
    shopping_list = db.relationship('ShoppingList', backref=db.backref('items', lazy=True, cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<ShoppingListItem {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'shopping_list_id': self.shopping_list_id,
            'name': self.name,
            'quantity': self.quantity,
            'unit': self.unit,
            'category': self.category,
            'is_purchased': self.is_purchased,
            'estimated_price': self.estimated_price,
            'actual_price': self.actual_price,
            'notes': self.notes
        }

