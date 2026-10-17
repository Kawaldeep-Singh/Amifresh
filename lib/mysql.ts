import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const rawHost = process.env.DB_HOST || '127.0.0.1';
const DB_HOST = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER !== undefined ? process.env.DB_USER : 'u789152685_amifresh_sakhi';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Amifresh@1234';
const DB_NAME = process.env.DB_NAME || 'u789152685_sakhi_amifresh';

const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL || 'admin@amifresh.com';
const ROOT_ADMIN_LOGIN_ID = process.env.ROOT_ADMIN_LOGIN_ID || 'ADMIN001';
const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD || 'admin123';
const ROOT_ADMIN_PHONE = process.env.ROOT_ADMIN_PHONE || '9999999999';

let pool: Pool;

declare global {
  var _mysqlPool: Pool | undefined;
  var _dbInitialized: boolean | undefined;
}

export function getPool(): Pool {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: 'utf8mb4',
      maxAllowedPacket: 67108864, // 64 MB
    } as any);
  }
  return global._mysqlPool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  await ensureInitialized();
  const [rows] = await p.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const p = getPool();
  await ensureInitialized();
  const [result] = await p.execute(sql, params);
  return result as ResultSetHeader;
}

export async function transaction<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const p = getPool();
  await ensureInitialized();
  const conn = await p.getConnection();
  await conn.beginTransaction();
  try {
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Ensures all required tables and default root admin exist.
 * Runs once upon first database call.
 */
export async function ensureInitialized() {
  if (global._dbInitialized) return;

  try {
    const p = getPool();

    try {
      await p.query('SET GLOBAL max_allowed_packet = 67108864');
    } catch {}

    // 1. users table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`password\` VARCHAR(255) NULL,
        \`loginId\` VARCHAR(100) NULL,
        \`mustChangePassword\` TINYINT(1) DEFAULT 0,
        \`role\` ENUM('ROOT_ADMIN', 'TEAM', 'SAKHI') DEFAULT 'SAKHI',
        \`referralCode\` VARCHAR(50) NOT NULL,
        \`referredBy\` VARCHAR(36) NULL,
        \`status\` ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'REJECTED') DEFAULT 'PENDING',
        \`statusRemark\` TEXT NULL,
        \`commissionRate\` DECIMAL(5,2) DEFAULT 35.00,
        \`totalSales\` DECIMAL(12,2) DEFAULT 0.00,
        \`totalCommission\` DECIMAL(12,2) DEFAULT 0.00,
        \`dob\` VARCHAR(50) NULL,
        \`gender\` VARCHAR(50) NULL,
        \`address\` TEXT NULL,
        \`city\` VARCHAR(100) NULL,
        \`state\` VARCHAR(100) NULL,
        \`pinCode\` VARCHAR(20) NULL,
        \`fatherSpouseName\` VARCHAR(255) NULL,
        \`photo\` LONGTEXT NULL,
        \`panCard\` LONGTEXT NULL,
        \`aadhaarCard\` LONGTEXT NULL,
        \`aadhaarCardFront\` LONGTEXT NULL,
        \`aadhaarCardBack\` LONGTEXT NULL,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_users_email\` (\`email\`),
        UNIQUE KEY \`uk_users_referralCode\` (\`referralCode\`),
        UNIQUE KEY \`uk_users_loginId\` (\`loginId\`),
        KEY \`idx_users_role_status\` (\`role\`, \`status\`),
        KEY \`idx_users_referredBy\` (\`referredBy\`),
        KEY \`idx_users_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. products table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`images\` JSON NULL,
        \`stock\` INT NOT NULL DEFAULT 0,
        \`commissionRate\` DECIMAL(5,2) NOT NULL DEFAULT 35.00,
        \`status\` ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') DEFAULT 'ACTIVE',
        \`createdBy\` VARCHAR(36) NOT NULL,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_products_slug\` (\`slug\`),
        KEY \`idx_products_status\` (\`status\`),
        KEY \`idx_products_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. orders table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`orderNumber\` VARCHAR(100) NOT NULL,
        \`customer\` VARCHAR(36) NOT NULL,
        \`product\` VARCHAR(36) NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`price\` DECIMAL(10,2) NOT NULL,
        \`totalAmount\` DECIMAL(10,2) NOT NULL,
        \`referredBy\` VARCHAR(36) NULL,
        \`commissionRate\` DECIMAL(5,2) NOT NULL DEFAULT 35.00,
        \`commissionAmount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        \`paymentStatus\` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
        \`orderStatus\` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED') DEFAULT 'PENDING',
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_orders_orderNumber\` (\`orderNumber\`),
        KEY \`idx_orders_customer\` (\`customer\`),
        KEY \`idx_orders_product\` (\`product\`),
        KEY \`idx_orders_referredBy\` (\`referredBy\`),
        KEY \`idx_orders_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. commissions table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`commissions\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user\` VARCHAR(36) NOT NULL,
        \`order\` VARCHAR(36) NOT NULL,
        \`saleAmount\` DECIMAL(10,2) NOT NULL,
        \`commissionRate\` DECIMAL(5,2) NOT NULL,
        \`commissionAmount\` DECIMAL(10,2) NOT NULL,
        \`status\` ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'REVERSED') DEFAULT 'PENDING',
        \`approvedBy\` VARCHAR(36) NULL,
        \`paidBy\` VARCHAR(36) NULL,
        \`approvedAt\` DATETIME NULL,
        \`paidAt\` DATETIME NULL,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_commissions_user\` (\`user\`),
        KEY \`idx_commissions_order\` (\`order\`),
        KEY \`idx_commissions_status\` (\`status\`),
        KEY \`idx_commissions_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. audit_logs table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`performedBy\` VARCHAR(36) NOT NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`entityType\` VARCHAR(100) NOT NULL,
        \`entityId\` VARCHAR(36) NULL,
        \`description\` TEXT NOT NULL,
        \`metadata\` JSON NULL,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_audit_logs_performedBy\` (\`performedBy\`),
        KEY \`idx_audit_logs_entityType\` (\`entityType\`),
        KEY \`idx_audit_logs_entityId\` (\`entityId\`),
        KEY \`idx_audit_logs_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. referral_histories table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`referral_histories\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`referrer\` VARCHAR(36) NOT NULL,
        \`referredUser\` VARCHAR(36) NOT NULL,
        \`referralCode\` VARCHAR(50) NOT NULL,
        \`registrationDate\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`approvalDate\` DATETIME NULL,
        \`status\` VARCHAR(50) DEFAULT 'PENDING',
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_referral_histories_referrer\` (\`referrer\`),
        KEY \`idx_referral_histories_referredUser\` (\`referredUser\`),
        KEY \`idx_referral_histories_referralCode\` (\`referralCode\`),
        KEY \`idx_referral_histories_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. settings table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`settings\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`key\` VARCHAR(100) NOT NULL,
        \`value\` JSON NOT NULL,
        \`description\` TEXT NULL,
        \`updatedBy\` VARCHAR(36) NOT NULL,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_settings_key\` (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure Default Root Admin exists or sync with ENV
    const [adminRows]: any = await p.query(
      'SELECT id, password FROM users WHERE role = ? OR email = ? OR loginId = ? LIMIT 1',
      ['ROOT_ADMIN', ROOT_ADMIN_EMAIL, ROOT_ADMIN_LOGIN_ID]
    );

    if (!adminRows || adminRows.length === 0) {
      const hashedPassword = await bcrypt.hash(ROOT_ADMIN_PASSWORD, 10);
      await p.query(`
        INSERT INTO users (
          id, name, email, phone, password, loginId,
          mustChangePassword, role, referralCode, status,
          commissionRate, totalSales, totalCommission
        ) VALUES (
          'admin-root-0001', 'Master Admin', ?, ?,
          ?, ?, 0, 'ROOT_ADMIN', 'AMIFRESH', 'ACTIVE', 35.00, 0.00, 0.00
        )
      `, [ROOT_ADMIN_EMAIL, ROOT_ADMIN_PHONE, hashedPassword, ROOT_ADMIN_LOGIN_ID]);
    } else if (process.env.ROOT_ADMIN_SYNC === 'true') {
      // Allows forcing admin password/loginId update directly via ENV on server restart
      const hashedPassword = await bcrypt.hash(ROOT_ADMIN_PASSWORD, 10);
      await p.query(
        'UPDATE users SET loginId = ?, email = ?, password = ? WHERE id = ?',
        [ROOT_ADMIN_LOGIN_ID, ROOT_ADMIN_EMAIL, hashedPassword, adminRows[0].id]
      );
    }

    global._dbInitialized = true;
  } catch (err: any) {
    // If table already exists or initialization fails, log but don't hard crash
    console.error('MySQL ensureInitialized error:', err?.message || err);
  }
}

export default getPool;
