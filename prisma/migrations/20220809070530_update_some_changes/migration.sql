/*
  Warnings:

  - You are about to drop the column `userTagId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `reactionId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userNewfeedId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userTagId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_reactionId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_seenUserId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userNewfeedId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userTagId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "userTagId";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "reactionId";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "userNewfeedId";

-- CreateTable
CREATE TABLE "_newfeeds" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_tag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageToReaction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_seen" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_newfeeds_AB_unique" ON "_newfeeds"("A", "B");

-- CreateIndex
CREATE INDEX "_newfeeds_B_index" ON "_newfeeds"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_tag_AB_unique" ON "_tag"("A", "B");

-- CreateIndex
CREATE INDEX "_tag_B_index" ON "_tag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToReaction_AB_unique" ON "_MessageToReaction"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToReaction_B_index" ON "_MessageToReaction"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_seen_AB_unique" ON "_seen"("A", "B");

-- CreateIndex
CREATE INDEX "_seen_B_index" ON "_seen"("B");

-- AddForeignKey
ALTER TABLE "_newfeeds" ADD CONSTRAINT "_newfeeds_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_newfeeds" ADD CONSTRAINT "_newfeeds_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tag" ADD CONSTRAINT "_tag_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tag" ADD CONSTRAINT "_tag_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToReaction" ADD CONSTRAINT "_MessageToReaction_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToReaction" ADD CONSTRAINT "_MessageToReaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_seen" ADD CONSTRAINT "_seen_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_seen" ADD CONSTRAINT "_seen_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
