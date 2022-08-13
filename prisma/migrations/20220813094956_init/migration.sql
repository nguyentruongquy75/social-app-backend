/*
  Warnings:

  - You are about to drop the column `lastMessageRoomId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `forCommentId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `forReactionId` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lastMessageId]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_lastMessageRoomId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_forCommentId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_forReactionId_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "lastMessageId" INTEGER;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "lastMessageRoomId";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "forCommentId",
DROP COLUMN "forReactionId",
ADD COLUMN     "commentId" INTEGER,
ADD COLUMN     "reactionId" INTEGER,
ALTER COLUMN "isRead" DROP NOT NULL,
ALTER COLUMN "isRead" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_lastMessageId_key" ON "ChatRoom"("lastMessageId");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
