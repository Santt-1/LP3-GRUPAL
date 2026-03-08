-- Migration: Add password_hash column to clientes table
-- Run this script on your database before restarting the backend

ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL
    COMMENT 'BCrypt hashed password for storefront login. NULL = registered manually by admin (no storefront access)';
