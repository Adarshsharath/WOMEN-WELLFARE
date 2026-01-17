"""
Create a test woman user for testing danger zone visibility
"""
from app import app, db
from models import User

def create_test_woman():
    with app.app_context():
        print("Creating test woman user...\n")
        
        # Check if woman user already exists
        woman = User.query.filter_by(email='woman@test.com').first()
        
        if woman:
            print(f"✅ Woman user already exists: {woman.name}")
            print(f"   Email: {woman.email}")
            print(f"   Role: {woman.role}")
            print(f"   Approved: {woman.is_approved}")
        else:
            # Create new woman user
            woman = User(
                name='Test Woman User',
                phone='8765432109',
                email='woman@test.com',
                role='WOMAN',
                is_approved=True,
                is_suspended=False
            )
            woman.set_password('woman123')
            
            db.session.add(woman)
            db.session.commit()
            
            print("✅ Test woman user created successfully!")
            print(f"   Email: woman@test.com")
            print(f"   Password: woman123")
            print(f"   Role: WOMAN")

if __name__ == '__main__':
    create_test_woman()
