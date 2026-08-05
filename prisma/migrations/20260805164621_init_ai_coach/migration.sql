-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_circuits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rounds" INTEGER NOT NULL DEFAULT 3,
    "rest_between_rounds" INTEGER NOT NULL DEFAULT 30,
    "user_id" TEXT NOT NULL,
    "share_slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_circuits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_circuit_exercises" (
    "id" TEXT NOT NULL,
    "circuit_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "duration_sec" INTEGER NOT NULL,
    "rest_sec" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "shared_circuit_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "shared_circuits_share_slug_key" ON "shared_circuits"("share_slug");

-- AddForeignKey
ALTER TABLE "shared_circuits" ADD CONSTRAINT "shared_circuits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_circuit_exercises" ADD CONSTRAINT "shared_circuit_exercises_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "shared_circuits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
