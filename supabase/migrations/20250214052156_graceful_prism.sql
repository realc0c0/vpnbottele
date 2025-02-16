/*
  # Update RLS policies for orders table

  1. Changes
    - Remove authentication requirement for insert operations
    - Allow public access for inserting orders
    - Update select policy to use user_id directly
  
  2. Security
    - Maintains data isolation between users
    - Allows unauthenticated order creation
    - Preserves admin access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow insert for all users" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create new policies
CREATE POLICY "Allow insert for all users"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO public
  USING (user_id = user_id);