/*
  Warnings:

  - Added the required column `status` to the `NotificationLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('EXPIRING_SOON', 'EXPIRED');

-- AlterTable
ALTER TABLE "NotificationLog" ADD COLUMN     "status" "NotificationStatus" NOT NULL;
