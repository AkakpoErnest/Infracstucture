-- CreateIndex
CREATE INDEX "Design_userId_idx" ON "Design"("userId");

-- CreateIndex
CREATE INDEX "DesignAlternative_designId_idx" ON "DesignAlternative"("designId");

-- CreateIndex
CREATE INDEX "DesignItem_designAlternativeId_idx" ON "DesignItem"("designAlternativeId");

-- CreateIndex
CREATE INDEX "DesignItem_productId_idx" ON "DesignItem"("productId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
