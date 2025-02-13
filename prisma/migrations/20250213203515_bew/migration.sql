-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Click_shortId_idx" ON "Click"("shortId");

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_shortId_fkey" FOREIGN KEY ("shortId") REFERENCES "Url"("shortId") ON DELETE RESTRICT ON UPDATE CASCADE;
