-- DropForeignKey
ALTER TABLE "StudentFee" DROP CONSTRAINT "StudentFee_feeStructureId_fkey";

-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "targetSection" TEXT;

-- AddForeignKey
ALTER TABLE "StudentFee" ADD CONSTRAINT "StudentFee_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
