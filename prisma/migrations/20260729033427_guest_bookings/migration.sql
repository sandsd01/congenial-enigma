-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_renterId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "guestPhone" TEXT,
ALTER COLUMN "renterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
