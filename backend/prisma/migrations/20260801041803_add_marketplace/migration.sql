-- CreateTable
CREATE TABLE "MarketItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketItemImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "MarketItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyRequest" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketItem" ADD CONSTRAINT "MarketItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketItemImage" ADD CONSTRAINT "MarketItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyRequest" ADD CONSTRAINT "BuyRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
