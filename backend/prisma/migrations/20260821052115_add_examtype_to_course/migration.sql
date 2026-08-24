-- DropIndex
DROP INDEX "Course_code_departmentId_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "examType" TEXT,
ALTER COLUMN "code" DROP NOT NULL;
