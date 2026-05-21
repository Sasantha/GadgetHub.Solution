-- Reset Admin Passwords to "password123"
-- 
-- SOLUTION: Delete existing admins and restart the backend
-- The AdminSeeder will automatically create fresh admins with correct password hashes

-- Step 1: Delete all existing admins
DELETE FROM Admins;

-- Step 2: Restart your backend application
-- The AdminSeeder will run on startup and create:
--   - admin / password123 (super_admin)
--   - manager1 / password123 (manager)  
--   - support1 / password123 (admin)

-- Step 3: Verify admins were created
SELECT Username, Email, FirstName, LastName, Role FROM Admins;
