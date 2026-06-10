-- Store attachment bytes in Postgres so downloads work on serverless (Vercel) where /tmp is not shared across instances.
ALTER TABLE "task_attachments" ADD COLUMN "data" BYTEA;
