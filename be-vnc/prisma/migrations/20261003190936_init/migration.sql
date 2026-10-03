-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `items_name_key`(`name`),
    UNIQUE INDEX `items_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    UNIQUE INDEX `roles_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `primary_mobile_no` VARCHAR(191) NULL,
    `secondary_mobile_no` VARCHAR(191) NULL,
    `primary_email` VARCHAR(191) NULL,
    `secondary_email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `pin_code` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `gst_number` VARCHAR(191) NULL,
    `seller_commision_percentage` DOUBLE NULL,
    `buyer_commision_percentage` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `company_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `primary_mobile_no` VARCHAR(191) NULL,
    `secondary_mobile_no` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `pin_code` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `allow_login` BOOLEAN NOT NULL DEFAULT false,
    `user_name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `gst_number` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_user_name_key`(`user_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buyerId` INTEGER NOT NULL,
    `transporter_id` INTEGER NOT NULL,
    `bill_date` DATE NOT NULL DEFAULT (curdate()),
    `total_amount` DOUBLE NULL,
    `buyer_commision_amount` DOUBLE NULL,
    `lorry_number` VARCHAR(191) NULL,
    `lorry_driver_contact` VARCHAR(191) NULL,
    `freight` DOUBLE NULL,
    `advance_freight` DOUBLE NULL,
    `lorry_brokerage` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bill_id` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `seller_bill_no` VARCHAR(191) NULL,
    `quantity_bags` INTEGER NOT NULL,
    `packaging` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `souda_rate` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `seller_commision_amount` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_transporter_id_fkey` FOREIGN KEY (`transporter_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_items` ADD CONSTRAINT `bill_items_bill_id_fkey` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_items` ADD CONSTRAINT `bill_items_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_items` ADD CONSTRAINT `bill_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
