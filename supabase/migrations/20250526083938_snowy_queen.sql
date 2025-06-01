/*
  # Create menu and lunch preference tables

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `allergens` (text[])
      - `available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lunch_preferences`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references auth.users)
      - `dietary` (text[])
      - `allergies` (text[])
      - `favorites` (uuid[], references menu_items)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lunch_orders`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references auth.users)
      - `menu_item_id` (uuid, references menu_items)
      - `date` (date)
      - `special_instructions` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text NOT NULL,
  allergens text[] DEFAULT '{}',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lunch_preferences table
CREATE TABLE IF NOT EXISTS lunch_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users NOT NULL,
  dietary text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  favorites uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lunch_orders table
CREATE TABLE IF NOT EXISTS lunch_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users NOT NULL,
  menu_item_id uuid REFERENCES menu_items NOT NULL,
  date date NOT NULL,
  special_instructions text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lunch_orders ENABLE ROW LEVEL SECURITY;

-- Policies for menu_items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items
  FOR SELECT
  USING (available = true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for lunch_preferences
CREATE POLICY "Users can view their own preferences"
  ON lunch_preferences
  FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can update their own preferences"
  ON lunch_preferences
  FOR UPDATE
  USING (
    auth.uid() = student_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policies for lunch_orders
CREATE POLICY "Users can view their own orders"
  ON lunch_orders
  FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can create orders"
  ON lunch_orders
  FOR INSERT
  WITH CHECK (
    auth.uid() = student_id OR
    auth.jwt() ->> 'role' = 'admin'
  );