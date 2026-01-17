"""
Create a test infrastructure user for testing issue management
"""
from app import app, db
from models import User

def create_test_infrastructure():
    with app.app_context():
        print("Creating test infrastructure user...\n")
        
        # Check if infrastructure user already exists
        infra = User.query.filter_by(email='infra@test.com').first()
        
        if infra:
            print(f"✅ Infrastructure user already exists: {infra.name}")
            print(f"   Email: {infra.email}")
            print(f"   Role: {infra.role}")
            print(f"   Approved: {infra.is_approved}")
        else:
            # Create new infrastructure user
            infra = User(
                name='Test Infrastructure Worker',
                phone='7654321098',
                email='infra@test.com',
                role='INFRASTRUCTURE',
                is_approved=True,
                is_suspended=False
            )
            infra.set_password('infra123')
            
            db.session.add(infra)
            db.session.commit()
            
            print("✅ Test infrastructure user created successfully!")
            print(f"   Email: infra@test.com")
            print(f"   Password: infra123")
            print(f"   Role: INFRASTRUCTURE")

if __name__ == '__main__':
    create_test_infrastructure()
