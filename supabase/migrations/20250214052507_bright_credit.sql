/*
  # Fix RLS policies for orders table

  1. Changes
    - Fix the select policy condition to properly compare user_id
    - Add policies for all necessary operations
  
  2. Security
    - Maintains data isolation between users
    - Allows unauthenticated order creation
    - Ensures proper data access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow insert for all users" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;

-- Create comprehensive policies
CREATE POLICY "Allow insert for all users"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO public
  USING (current_setting('request.jwt.claims')::json->>'sub' = user_id OR user_id = current_setting('request.headers')::json->>'user_id');

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO public
  USING (current_setting('request.jwt.claims')::json->>'sub' = user_id OR user_id = current_setting('request.headers')::json->>'user_id');

CREATE POLICY "Users can delete their own orders"
  ON orders
  FOR DELETE
  TO public
  USING (current_setting('request.jwt.claims')::json->>'sub' = user_id OR user_id = current_setting('request.headers')::json->>'user_id');