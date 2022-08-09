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
ALTER TABLE "Comment" ALTER COLUMN "userTagId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "reactionId" DROP NOT NULL,
ALTER COLUMN "seenUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "userNewfeedId" DROP NOT NULL,
ALTER COLUMN "userTagId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "avatarImage" DROP NOT NULL,
ALTER COLUMN "coverImage" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userTagId_fkey" FOREIGN KEY ("userTagId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userNewfeedId_fkey" FOREIGN KEY ("userNewfeedId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userTagId_fkey" FOREIGN KEY ("userTagId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_seenUserId_fkey" FOREIGN KEY ("seenUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
