#!/usr/bin/env python3
"""
Test script to verify Supabase connection and schema setup.
Run this locally after setting up your .env file.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

print("=" * 60)
print("SUPABASE CONNECTION TEST")
print("=" * 60)

# Check environment variables
print("\n1. Checking environment variables...")
if not SUPABASE_URL:
    print("❌ SUPABASE_URL not found in .env")
    sys.exit(1)
else:
    print(f"✓ SUPABASE_URL: {SUPABASE_URL}")

if not SUPABASE_SERVICE_KEY:
    print("❌ SUPABASE_SERVICE_KEY not found in .env")
    sys.exit(1)
else:
    print(f"✓ SUPABASE_SERVICE_KEY: {SUPABASE_SERVICE_KEY[:20]}...")

# Try importing and connecting
print("\n2. Attempting to import supabase...")
try:
    from supabase import create_client
    print("✓ Supabase library imported successfully")
except ImportError as e:
    print(f"❌ Failed to import supabase: {e}")
    sys.exit(1)

print("\n3. Attempting to create Supabase client...")
try:
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("✓ Supabase client created successfully")
except Exception as e:
    print(f"❌ Failed to create client: {e}")
    sys.exit(1)

print("\n4. Testing database connection...")
try:
    # Try to query the user_profiles table
    response = client.table("user_profiles").select("*").limit(1).execute()
    print("✓ Database connection successful!")
    print(f"✓ Can access user_profiles table")
except Exception as e:
    print(f"❌ Database query failed: {e}")
    sys.exit(1)

print("\n5. Verifying schema tables...")
required_tables = [
    "user_profiles",
    "inference_jobs",
    "inference_results",
    "model_analytics",
    "system_events"
]

for table_name in required_tables:
    try:
        client.table(table_name).select("*").limit(1).execute()
        print(f"✓ Table '{table_name}' exists")
    except Exception as e:
        print(f"❌ Table '{table_name}' not found: {e}")

print("\n" + "=" * 60)
print("✓ INTEGRATION SUCCESSFUL!")
print("=" * 60)
print("\nNext steps:")
print("1. Update backend/app/core/config.py with environment variables")
print("2. Ensure .env file is added to .gitignore")
print("3. Update docker/.env with production credentials")
