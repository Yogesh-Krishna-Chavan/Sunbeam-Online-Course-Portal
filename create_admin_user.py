"""Script to create an admin user for testing"""
from backend.db import Database
from backend.utils.password import hash_password_sha256
import mysql.connector

def create_admin_user():
    """Create an admin user"""
    email = "admin@example.com"
    password = "admin123"
    role = "admin"
    
    hash_password = hash_password_sha256(password)
    
    connection = Database.get_connection()
    try:
        cursor = connection.cursor()
        
        # Check if user exists
        check_sql = "SELECT * FROM users WHERE email = %s"
        cursor.execute(check_sql, (email,))
        existing = cursor.fetchone()
        
        if existing:
            print(f"User {email} already exists. Updating to admin role...")
            update_sql = "UPDATE users SET password = %s, role = %s WHERE email = %s"
            cursor.execute(update_sql, (hash_password, role, email))
        else:
            print(f"Creating admin user {email}...")
            insert_sql = "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)"
            cursor.execute(insert_sql, (email, hash_password, role))
        
        connection.commit()
        cursor.close()
        print(f"✅ Admin user created/updated successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Role: {role}")
        
    except mysql.connector.Error as e:
        connection.rollback()
        print(f"❌ Error: {str(e)}")
    finally:
        connection.close()

if __name__ == "__main__":
    create_admin_user()

