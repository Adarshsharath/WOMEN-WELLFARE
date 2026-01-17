"""
Create a test police user for testing zone marking
"""
from app import app, db
from models import User

def create_test_police():
    with app.app_context():
        print("Creating test police user...\n")
        
        # Check if police user already exists
        police = User.query.filter_by(email='police@test.com').first()
        
        if police:
            print(f"✅ Police user already exists: {police.name}")
            print(f"   Email: {police.email}")
            print(f"   Role: {police.role}")
            print(f"   Approved: {police.is_approved}")
        else:
            # Create new police user
            police = User(
                name='Test Police Officer',
                phone='9876543210',
                email='police@test.com',
                role='POLICE',
                is_approved=True,
                is_suspended=False
            )
            police.set_password('police123')
            
            db.session.add(police)
            db.session.commit()
            
            print("✅ Test police user created successfully!")
            print(f"   Email: police@test.com")
            print(f"   Password: police123")
            print(f"   Role: POLICE")

if __name__ == '__main__':
    create_test_police()
