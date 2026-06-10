-- CreateTable
CREATE TABLE "task_attachments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(127) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_attachments_task_id_created_at_idx" ON "task_attachments"("task_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
