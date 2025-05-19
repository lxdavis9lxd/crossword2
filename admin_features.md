# Admin Features for Crossword Puzzle Application

## Overview

This document describes the admin features added to the crossword puzzle application, which include:

1. User account management with role-based access control
2. Excel import/export functionality for puzzles

## Getting Started

### Running the Migration

Before using the admin features, you need to run the database migration to add the required fields to the User model:

```bash
node run_migration.js
```

This will:
- Add the `role` field (enum: 'user', 'admin') to all users
- Add the `isActive` field (boolean) to all users
- Create an initial admin user (if one doesn't already exist)

Default admin credentials:
- Username: admin
- Password: admin123

**Important:** Change the admin password after first login for security purposes.

## Admin Features

### User Management

Admin users can perform the following user management tasks:
- View all user accounts
- Create new user accounts
- Edit existing user accounts
- Deactivate user accounts (soft delete)
- View user details and activity

### Puzzle Management

Admin users can perform the following puzzle management tasks:
- View all puzzles
- Edit puzzle metadata (title, description, difficulty)
- Delete puzzles
- Import puzzles from Excel files
- Export puzzles to Excel files

### Import/Export Functionality

The application supports importing and exporting puzzles using Excel files:

**Import:**
1. Download the template from the admin import page
2. Fill in the required fields:
   - `level` (easy, intermediate, advanced)
   - `grid` (JSON array of letters and "." for black cells)
   - `clues_across` (JSON array of objects with number and clue)
   - `clues_down` (JSON array of objects with number and clue)
3. Upload the file through the import interface

**Export:**
1. Click the Export All button on the puzzles page
2. A file will be downloaded containing all puzzles in the database

## Security Considerations

- Admin users can't demote themselves from admin role
- Admin users can't deactivate their own accounts
- All admin routes are protected by middleware that verifies admin role

## File Structure

- `/middleware/auth.js` - Contains authentication and admin middleware
- `/routes/admin.js` - Contains all admin routes
- `/views/admin/` - Contains all admin view templates
- `/public/admin-styles.css` - Contains admin styles
- `/migrations/add_role_to_users.js` - Migration script
