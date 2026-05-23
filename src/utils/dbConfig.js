/** Koofr database configuration */
export const KOOFR_DB_LINK = 'https://app.koofr.net/links/a8a8f005-9837-4d93-b1d5-4bfc2b1a94f0';

/**
 * When the new database SQL file is uploaded to the Koofr link above:
 * 1. Download the .sql file from KOOFR_DB_LINK
 * 2. Import into MySQL: mysql -u shrutseva_test -p shrutseva_test < file.sql
 * 3. Update DB_DATABASE in server .env if schema name changes
 * 4. No frontend code changes needed — API routes remain the same
 */
export const DB_STATUS = 'active'; // change to 'active' once imported
