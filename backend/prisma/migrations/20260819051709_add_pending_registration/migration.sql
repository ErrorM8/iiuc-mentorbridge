-- CreateTable
CREATE TABLE "PendingRegistration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "batch" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'junior',
    "studentId" TEXT,
    "bloodGroup" TEXT,
    "bio" TEXT,
    "skills" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "otp" TEXT NOT NULL,
    "otpExpiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_email_key" ON "PendingRegistration"("email");
