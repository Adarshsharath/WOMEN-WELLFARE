"""
Migration script to add latitude/longitude to Issue model
"""
from app import app, db
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Starting migration for Issue table...\n")
        
        try:
            # Check existing columns
            result = db.session.execute(text("PRAGMA table_info(issues)"))
            columns = [row[1] for row in result]
            print(f"Existing columns: {columns}")
            
            # Add latitude column if it doesn't exist
            if 'latitude' not in columns:
                print("Adding 'latitude' column...")
                db.session.execute(text(
                    "ALTER TABLE issues ADD COLUMN latitude FLOAT"
                ))
                db.session.commit()
                print("✅ Added 'latitude' column")
            else:
                print("✅ 'latitude' column already exists")
            
            # Add longitude column if it doesn't exist
            if 'longitude' not in columns:
                print("Adding 'longitude' column...")
                db.session.execute(text(
                    "ALTER TABLE issues ADD COLUMN longitude FLOAT"
                ))
                db.session.commit()
                print("✅ Added 'longitude' column")
            else:
                print("✅ 'longitude' column already exists")
            
            print("\n✅ Migration completed successfully!")
            print("✅ Issues table now has latitude and longitude columns")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == '__main__':
    migrate()
