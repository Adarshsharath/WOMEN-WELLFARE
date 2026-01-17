"""
Migration script to add new fields to FlaggedZone model
Run this script to update existing database schema
"""
from app import app, db
from models import FlaggedZone
from sqlalchemy import text

def migrate():
    with app.app_context():
        print("Starting migration for FlaggedZone table...")
        
        try:
            # Check if columns exist by querying the table structure
            result = db.session.execute(text("PRAGMA table_info(flagged_zones)"))
            columns = [row[1] for row in result]
            print(f"Existing columns: {columns}")
            
            # Add reason column if it doesn't exist
            if 'reason' not in columns:
                print("Adding 'reason' column...")
                db.session.execute(text(
                    "ALTER TABLE flagged_zones ADD COLUMN reason TEXT"
                ))
                db.session.commit()
                print("✅ Added 'reason' column")
            else:
                print("✅ 'reason' column already exists")
            
            # Add is_active column if it doesn't exist
            if 'is_active' not in columns:
                print("Adding 'is_active' column...")
                db.session.execute(text(
                    "ALTER TABLE flagged_zones ADD COLUMN is_active BOOLEAN DEFAULT 1"
                ))
                db.session.commit()
                print("✅ Added 'is_active' column")
            else:
                print("✅ 'is_active' column already exists")
            
            # Add unmarked_at column if it doesn't exist
            if 'unmarked_at' not in columns:
                print("Adding 'unmarked_at' column...")
                db.session.execute(text(
                    "ALTER TABLE flagged_zones ADD COLUMN unmarked_at TIMESTAMP"
                ))
                db.session.commit()
                print("✅ Added 'unmarked_at' column")
            else:
                print("✅ 'unmarked_at' column already exists")
            
            # Update existing records with a default reason
            print("Updating existing records...")
            db.session.execute(text(
                "UPDATE flagged_zones SET reason = description WHERE reason IS NULL AND description IS NOT NULL AND description != ''"
            ))
            
            db.session.execute(text(
                "UPDATE flagged_zones SET reason = 'High risk area' WHERE reason IS NULL OR reason = ''"
            ))
            
            # Update existing records to be active
            db.session.execute(text(
                "UPDATE flagged_zones SET is_active = 1 WHERE is_active IS NULL"
            ))
            
            db.session.commit()
            print("✅ Migration completed successfully!")
            print("✅ All columns added and data updated")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == '__main__':
    migrate()
