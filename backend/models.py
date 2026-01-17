from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model for all roles in the system"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # WOMAN, POLICE, INFRASTRUCTURE, CYBERSECURITY, EMERGENCY, ADMIN
    is_approved = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    emergency_contacts = db.relationship('EmergencyContact', backref='woman', lazy=True, cascade='all, delete-orphan')
    sos_events = db.relationship('SOSEvent', backref='woman', lazy=True, cascade='all, delete-orphan')
    flagged_zones = db.relationship('FlaggedZone', backref='police_officer', lazy=True)
    reported_issues = db.relationship('Issue', foreign_keys='Issue.reported_by_police_id', backref='reporter', lazy=True)
    abuse_monitoring = db.relationship('AbuseMonitoring', backref='woman', uselist=False, cascade='all, delete-orphan')
    sent_messages = db.relationship('ChatMessage', backref='sender', lazy=True)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary (exclude sensitive data)"""
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'role': self.role,
            'is_approved': self.is_approved,
            'is_suspended': self.is_suspended,
            'created_at': self.created_at.isoformat()
        }


class EmergencyContact(db.Model):
    """Emergency contacts for women users"""
    __tablename__ = 'emergency_contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    woman_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    contact_name = db.Column(db.String(100), nullable=False)
    contact_phone = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'woman_id': self.woman_id,
            'contact_name': self.contact_name,
            'contact_phone': self.contact_phone,
            'created_at': self.created_at.isoformat()
        }


class SOSEvent(db.Model):
    """SOS emergency events"""
    __tablename__ = 'sos_events'
    
    id = db.Column(db.Integer, primary_key=True)
    woman_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    battery_percentage = db.Column(db.Integer)
    status = db.Column(db.String(20), default='ACTIVE')  # ACTIVE, RESOLVED, FALSE_ALARM
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    # Relationship for location updates
    location_updates = db.relationship('LocationUpdate', backref='sos_event', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'woman_id': self.woman_id,
            'woman_name': self.woman.name,
            'woman_phone': self.woman.phone,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'battery_percentage': self.battery_percentage,
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class LocationUpdate(db.Model):
    """Live location updates for active SOS events"""
    __tablename__ = 'location_updates'
    
    id = db.Column(db.Integer, primary_key=True)
    sos_event_id = db.Column(db.Integer, db.ForeignKey('sos_events.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    battery_percentage = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sos_event_id': self.sos_event_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'battery_percentage': self.battery_percentage,
            'timestamp': self.timestamp.isoformat()
        }


class FlaggedZone(db.Model):
    """High-risk zones flagged by police"""
    __tablename__ = 'flagged_zones'
    
    id = db.Column(db.Integer, primary_key=True)
    police_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    reason = db.Column(db.Text, nullable=False)  # Reason for marking the zone
    description = db.Column(db.Text)  # Additional details
    is_active = db.Column(db.Boolean, default=True)  # Whether zone is currently marked
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    unmarked_at = db.Column(db.DateTime)  # When the zone was unmarked
    
    def to_dict(self):
        return {
            'id': self.id,
            'police_id': self.police_id,
            'police_name': self.police_officer.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'risk_level': self.risk_level,
            'reason': self.reason,
            'description': self.description,
            'is_active': self.is_active,
            'timestamp': self.timestamp.isoformat(),
            'unmarked_at': self.unmarked_at.isoformat() if self.unmarked_at else None
        }


class Issue(db.Model):
    """Issues reported by police to infrastructure"""
    __tablename__ = 'issues'
    
    id = db.Column(db.Integer, primary_key=True)
    reported_by_police_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to_infra_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255))
    latitude = db.Column(db.Float)  # Latitude coordinate of the issue
    longitude = db.Column(db.Float)  # Longitude coordinate of the issue
    status = db.Column(db.String(20), default='PENDING')  # PENDING, ACCEPTED, COMPLETED
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_infra_id], backref='assigned_issues')
    
    def to_dict(self):
        return {
            'id': self.id,
            'reported_by_police_id': self.reported_by_police_id,
            'reporter_name': self.reporter.name,
            'assigned_to_infra_id': self.assigned_to_infra_id,
            'assigned_to_name': self.assigned_to.name if self.assigned_to else None,
            'description': self.description,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class AbuseMonitoring(db.Model):
    """Track potential abuse of SOS and fake call features"""
    __tablename__ = 'abuse_monitoring'
    
    id = db.Column(db.Integer, primary_key=True)
    woman_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    sos_count = db.Column(db.Integer, default=0)
    fake_call_count = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_flagged = db.Column(db.Boolean, default=False)
    flagged_reason = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'woman_id': self.woman_id,
            'woman_name': self.woman.name,
            'woman_phone': self.woman.phone,
            'sos_count': self.sos_count,
            'fake_call_count': self.fake_call_count,
            'last_updated': self.last_updated.isoformat(),
            'is_flagged': self.is_flagged,
            'flagged_reason': self.flagged_reason
        }


class ChatMessage(db.Model):
    """Chat messages for police and emergency broadcast"""
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message_text = db.Column(db.Text, nullable=False)
    chat_type = db.Column(db.String(20), nullable=False)  # POLICE, EMERGENCY_BROADCAST
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.name,
            'sender_role': self.sender.role,
            'message_text': self.message_text,
            'chat_type': self.chat_type,
            'timestamp': self.timestamp.isoformat()
        }


class FlaggedUser(db.Model):
    """Users flagged by cybersecurity for admin review"""
    __tablename__ = 'flagged_users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flagged_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='PENDING')  # PENDING, REVIEWED, SUSPENDED
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='flags_received')
    flagged_by = db.relationship('User', foreign_keys=[flagged_by_id], backref='flags_created')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name,
            'user_phone': self.user.phone,
            'flagged_by_id': self.flagged_by_id,
            'flagged_by_name': self.flagged_by.name,
            'reason': self.reason,
            'status': self.status,
            'timestamp': self.timestamp.isoformat()
        }
