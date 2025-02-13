-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "longUrl" TEXT NOT NULL,
    "countOfRedirect" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_shortId_key" ON "Url"("shortId");
