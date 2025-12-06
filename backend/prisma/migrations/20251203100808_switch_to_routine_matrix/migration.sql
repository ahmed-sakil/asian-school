/*
  Warnings:

  - You are about to drop the `class_routines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "class_routines" DROP CONSTRAINT "class_routines_subject_class_id_fkey";

-- DropTable
DROP TABLE "class_routines";

-- CreateTable
CREATE TABLE "routine_slots" (
    "id" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "period" INTEGER NOT NULL,
    "subjectClassId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "routine_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "routine_slots_sectionId_day_period_key" ON "routine_slots"("sectionId", "day", "period");

-- AddForeignKey
ALTER TABLE "routine_slots" ADD CONSTRAINT "routine_slots_subjectClassId_fkey" FOREIGN KEY ("subjectClassId") REFERENCES "subject_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_slots" ADD CONSTRAINT "routine_slots_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
