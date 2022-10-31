/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttendanceServices" DROP CONSTRAINT "AttendanceServices_attendanceId_fkey";

-- DropTable
DROP TABLE "Attendance";

-- CreateTable
CREATE TABLE "Attendances" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "startedIn" TIMESTAMP(3) NOT NULL,
    "endedIn" TIMESTAMP(3) NOT NULL,
    "totalValue" INTEGER NOT NULL,
    "totalCommissionPercentage" INTEGER NOT NULL,
    "totalCommissionValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Attendances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AttendanceServices" ADD CONSTRAINT "AttendanceServices_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
