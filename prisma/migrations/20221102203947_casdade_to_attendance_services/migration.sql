-- DropForeignKey
ALTER TABLE "AttendanceServices" DROP CONSTRAINT "AttendanceServices_attendanceId_fkey";

-- AddForeignKey
ALTER TABLE "AttendanceServices" ADD CONSTRAINT "AttendanceServices_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
