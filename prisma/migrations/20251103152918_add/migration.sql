-- DropForeignKey
ALTER TABLE "public"."boards" DROP CONSTRAINT "boards_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cards" DROP CONSTRAINT "cards_columnId_fkey";

-- DropForeignKey
ALTER TABLE "public"."columns" DROP CONSTRAINT "columns_boardId_fkey";

-- AddForeignKey
ALTER TABLE "public"."boards" ADD CONSTRAINT "boards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."columns" ADD CONSTRAINT "columns_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "public"."columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
