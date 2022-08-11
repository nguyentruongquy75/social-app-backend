/*
  Warnings:

  - You are about to drop the column `userTagId` on the `Post` table. All the data in the column will be lost.
  - Made the column `seenUserId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "seenUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "userTagId";
