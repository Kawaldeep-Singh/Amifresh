-- ====================================================================
-- AmiFresh Sakhi Portal - Complete MySQL Database Schema
-- Database: u789152685_sakhi_amifresh
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NULL,
  `loginId` VARCHAR(100) NULL,
  `mustChangePassword` TINYINT(1) DEFAULT 0,
  `role` ENUM('ROOT_ADMIN', 'TEAM', 'SAKHI') DEFAULT 'SAKHI',
  `referralCode` VARCHAR(50) NOT NULL,
  `referredBy` VARCHAR(36) NULL,
  `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'REJECTED') DEFAULT 'PENDING',
  `statusRemark` TEXT NULL,
  `commissionRate` DECIMAL(5,2) DEFAULT 35.00,
  `totalSales` DECIMAL(12,2) DEFAULT 0.00,
  `totalCommission` DECIMAL(12,2) DEFAULT 0.00,
  `dob` VARCHAR(50) NULL,
  `gender` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `pinCode` VARCHAR(20) NULL,
  `fatherSpouseName` VARCHAR(255) NULL,
  `photo` LONGTEXT NULL,
  `panCard` LONGTEXT NULL,
  `aadhaarCard` LONGTEXT NULL,
  `aadhaarCardFront` LONGTEXT NULL,
  `aadhaarCardBack` LONGTEXT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_referralCode` (`referralCode`),
  UNIQUE KEY `uk_users_loginId` (`loginId`),
  KEY `idx_users_role_status` (`role`, `status`),
  KEY `idx_users_referredBy` (`referredBy`),
  KEY `idx_users_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `images` JSON NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `commissionRate` DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  `status` ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK') DEFAULT 'ACTIVE',
  `createdBy` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_products_slug` (`slug`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) NOT NULL,
  `orderNumber` VARCHAR(100) NOT NULL,
  `customer` VARCHAR(36) NOT NULL,
  `product` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `totalAmount` DECIMAL(10,2) NOT NULL,
  `referredBy` VARCHAR(36) NULL,
  `commissionRate` DECIMAL(5,2) NOT NULL DEFAULT 35.00,
  `commissionAmount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  `orderStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED') DEFAULT 'PENDING',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orders_orderNumber` (`orderNumber`),
  KEY `idx_orders_customer` (`customer`),
  KEY `idx_orders_product` (`product`),
  KEY `idx_orders_referredBy` (`referredBy`),
  KEY `idx_orders_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Commissions Table
CREATE TABLE IF NOT EXISTS `commissions` (
  `id` VARCHAR(36) NOT NULL,
  `user` VARCHAR(36) NOT NULL,
  `order` VARCHAR(36) NOT NULL,
  `saleAmount` DECIMAL(10,2) NOT NULL,
  `commissionRate` DECIMAL(5,2) NOT NULL,
  `commissionAmount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'REVERSED') DEFAULT 'PENDING',
  `approvedBy` VARCHAR(36) NULL,
  `paidBy` VARCHAR(36) NULL,
  `approvedAt` DATETIME NULL,
  `paidAt` DATETIME NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_commissions_user` (`user`),
  KEY `idx_commissions_order` (`order`),
  KEY `idx_commissions_status` (`status`),
  KEY `idx_commissions_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `performedBy` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entityType` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(36) NULL,
  `description` TEXT NOT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_performedBy` (`performedBy`),
  KEY `idx_audit_logs_entityType` (`entityType`),
  KEY `idx_audit_logs_entityId` (`entityId`),
  KEY `idx_audit_logs_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Referral Histories Table
CREATE TABLE IF NOT EXISTS `referral_histories` (
  `id` VARCHAR(36) NOT NULL,
  `referrer` VARCHAR(36) NOT NULL,
  `referredUser` VARCHAR(36) NOT NULL,
  `referralCode` VARCHAR(50) NOT NULL,
  `registrationDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `approvalDate` DATETIME NULL,
  `status` VARCHAR(50) DEFAULT 'PENDING',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_referral_histories_referrer` (`referrer`),
  KEY `idx_referral_histories_referredUser` (`referredUser`),
  KEY `idx_referral_histories_referralCode` (`referralCode`),
  KEY `idx_referral_histories_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(36) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` JSON NOT NULL,
  `description` TEXT NULL,
  `updatedBy` VARCHAR(36) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Seed Default Root Admin User (password is admin123)
-- bcrypt hash for 'admin123' is '$2b$10$wL4PvhR5i96x8b6Xm7E.h.vI6dJcO9gZp/nO7v6J10eN8eC2p8A.2' or similar
INSERT IGNORE INTO `users` (
  `id`, `name`, `email`, `phone`, `password`, `loginId`, 
  `mustChangePassword`, `role`, `referralCode`, `status`, 
  `commissionRate`, `totalSales`, `totalCommission`
) VALUES (
  'admin-root-0001',
  'Master Admin',
  'admin@amifresh.com',
  '9999999999',
  '$2a$10$1Y87tq1uBmz.wWv16q.4te0qXW8wS97oDmgj7k0.WJ40c5nJ4889K', -- bcrypt for 'admin123'
  'ADMIN001',
  0,
  'ROOT_ADMIN',
  'AMIFRESH',
  'ACTIVE',
  35.00,
  0.00,
  0.00
);

-- Seed Default Commission Setting
INSERT IGNORE INTO `settings` (`id`, `key`, `value`, `description`, `updatedBy`)
VALUES (
  'setting-0001',
  'DEFAULT_COMMISSION_RATE',
  '35',
  'Default commission rate for products in percentage',
  'admin-root-0001'
);

SET FOREIGN_KEY_CHECKS = 1;
