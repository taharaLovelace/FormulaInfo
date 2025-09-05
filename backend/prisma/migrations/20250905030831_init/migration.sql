-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "driver_number" INTEGER,
    "full_name" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "nationality" TEXT,
    "team_name" TEXT,
    "birth_date" DATE,
    "bio" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_driver_number_key" ON "drivers"("driver_number");
