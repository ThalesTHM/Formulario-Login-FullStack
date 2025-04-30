/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "IpTries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "tries" INTEGER NOT NULL DEFAULT 0,
    "lastTry" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
