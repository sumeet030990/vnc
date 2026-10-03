/*
  Warnings:

  - Made the column `seller_commision_amount` on table `bill_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_amount` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `buyer_commision_amount` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `freight` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `advance_freight` on table `bills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lorry_brokerage` on table `bills` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `bill_items` MODIFY `seller_commision_amount` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `bills` MODIFY `total_amount` DOUBLE NOT NULL,
    MODIFY `buyer_commision_amount` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `freight` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `advance_freight` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `lorry_brokerage` DOUBLE NOT NULL DEFAULT 0;
