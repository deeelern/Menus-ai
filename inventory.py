from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # vegetables, fruits, dairy, meat, etc.
    quantity = db.Column(db.Float, nullable=False, default=1.0)
    unit = db.Column(db.String(20), nullable=False, default='piece')  # piece, kg, g, ml, l, etc.
    purchase_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=True)
    freshness_score = db.Column(db.Integer, nullable=True)  # 1-10 scale
    location = db.Column(db.String(50), nullable=True)  # fridge, pantry, freezer
    barcode = db.Column(db.String(50), nullable=True)
    image_url = db.Column(db.String(200), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('inventory_items', lazy=True))

    def __repr__(self):
        return f'<InventoryItem {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'category': self.category,
            'quantity': self.quantity,
            'unit': self.unit,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'freshness_score': self.freshness_score,
            'location': self.location,
            'barcode': self.barcode,
            'image_url': self.image_url,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def is_expiring_soon(self, days=3):
        """Check if item is expiring within specified days"""
        if not self.expiry_date:
            return False
        return (self.expiry_date - datetime.utcnow()).days <= days

    def is_expired(self):
        """Check if item is expired"""
        if not self.expiry_date:
            return False
        return self.expiry_date < datetime.utcnow()

