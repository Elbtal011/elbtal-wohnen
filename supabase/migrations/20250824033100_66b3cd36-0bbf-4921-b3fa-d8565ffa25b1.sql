-- Enable leaked password protection for better security
UPDATE auth.config SET value = 'true' WHERE parameter = 'password_check_enabled';