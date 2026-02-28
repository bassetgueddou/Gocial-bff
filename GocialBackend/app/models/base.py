"""
Base model classes

CRUDMixin gives you .create(), .save(), .update(), .delete()
so you don't have to repeat db.session.add/commit everywhere.

PkModel is the same but with an auto-incrementing id column.
Basically saves you from writing the same boilerplate on every model.
"""

from app import db


class CRUDMixin:
    """
    Mixin with convenience methods for creating, reading, updating, deleting.
    
    Instead of:
        user = User(...)
        db.session.add(user)
        db.session.commit()
        
    You can just do:
        user = User.create(...)
    """
    
    @classmethod
    def create(cls, commit=True, **kwargs):
        """Create a new record and save it."""
        instance = cls(**kwargs)
        return instance.save(commit=commit)
    
    def update(self, commit=True, **kwargs):
        """Update fields on this instance."""
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        if commit:
            return self.save()
        return self
    
    def save(self, commit=True):
        """Save to database."""
        db.session.add(self)
        if commit:
            db.session.commit()
        return self
    
    def delete(self, commit=True):
        """Remove from database."""
        db.session.delete(self)
        if commit:
            db.session.commit()
        return None


class PkModel(CRUDMixin, db.Model):
    """
    Base model with primary key and CRUD methods.
    
    Inherit from this instead of db.Model and you get:
    - id column (auto-increment)
    - create(), save(), update(), delete() methods
    - get_by_id() class method
    """
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    
    @classmethod
    def get_by_id(cls, record_id):
        """Get record by primary key."""
        if record_id is None:
            return None
        return cls.query.get(int(record_id))


# Alias for convenience - use Column instead of db.Column if you want
Column = db.Column
relationship = db.relationship


def reference_col(tablename, nullable=False, pk_name='id', **kwargs):
    """
    Create a foreign key column referencing another table.
    
    Saves you from typing:
        some_id = db.Column(db.Integer, db.ForeignKey('table.id'), nullable=False)
        
    Instead:
        some_id = reference_col('table')
    """
    return db.Column(
        db.Integer,
        db.ForeignKey(f'{tablename}.{pk_name}'),
        nullable=nullable,
        **kwargs
    )
