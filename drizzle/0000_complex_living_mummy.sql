DO $$ BEGIN
 CREATE TYPE "post_content_type" AS ENUM('poll', 'image', 'video');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	UNIQUE ("name")
);

CREATE TABLE IF NOT EXISTS "category_community" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	UNIQUE ("community_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "category_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	UNIQUE ("user_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "community" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"disabled" boolean DEFAULT false,
	UNIQUE ("title")
);

CREATE TABLE IF NOT EXISTS "community_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"disabled" boolean DEFAULT false,
	UNIQUE ("community_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "poll_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"desc" varchar(32) NOT NULL,
	UNIQUE ("poll_id", "desc")
);

CREATE TABLE IF NOT EXISTS "poll_vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	UNIQUE ("poll_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "poll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"desc" varchar(255) NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"disabled" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "post_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"content" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "post_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"type" post_content_type NOT NULL,
	UNIQUE ("post_id")
);

CREATE TABLE IF NOT EXISTS "post_reaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"reaction" boolean NOT NULL,
	UNIQUE ("post_id", "owner_id")
);

CREATE TABLE IF NOT EXISTS "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"content" varchar(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"disabled" boolean DEFAULT false,
	"deleted" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "user_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(80) NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(80) NOT NULL,
	"provider_id" varchar(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(80) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"disabled" boolean DEFAULT false,
	"avatar_url" varchar(255),
	"deleted" boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS "category_name_idx" ON "category" ("name");
CREATE INDEX IF NOT EXISTS "category_community_community_id_idx" ON "category_community" ("community_id");
CREATE INDEX IF NOT EXISTS "category_community_category_id_idx" ON "category_community" ("category_id");
CREATE INDEX IF NOT EXISTS "category_user_user_id_idx" ON "category_user" ("user_id");
CREATE INDEX IF NOT EXISTS "category_user_category_id_idx" ON "category_user" ("category_id");
CREATE INDEX IF NOT EXISTS "community_owner_id_idx" ON "community" ("owner_id");
CREATE INDEX IF NOT EXISTS "community_created_at_idx" ON "community" ("created_at");
CREATE INDEX IF NOT EXISTS "community_member_community_id_idx" ON "community_member" ("community_id");
CREATE INDEX IF NOT EXISTS "community_member_user_id_idx" ON "community_member" ("user_id");
CREATE INDEX IF NOT EXISTS "poll_option_poll_id_idx" ON "poll_option" ("poll_id");
CREATE INDEX IF NOT EXISTS "poll_vote_poll_id_idx" ON "poll_vote" ("poll_id");
CREATE INDEX IF NOT EXISTS "poll_vote_option_id_idx" ON "poll_vote" ("option_id");
CREATE INDEX IF NOT EXISTS "poll_vote_user_id_idx" ON "poll_vote" ("user_id");
CREATE INDEX IF NOT EXISTS "poll_post_id_idx" ON "poll" ("post_id");
CREATE INDEX IF NOT EXISTS "poll_started_at_idx" ON "poll" ("started_at");
CREATE INDEX IF NOT EXISTS "post_comment_post_id_idx" ON "post_comment" ("post_id");
CREATE INDEX IF NOT EXISTS "post_comment_owner_id_idx" ON "post_comment" ("owner_id");
CREATE INDEX IF NOT EXISTS "post_comment_created_at_idx" ON "post_comment" ("created_at");
CREATE INDEX IF NOT EXISTS "post_content_post_id_idx" ON "post_content" ("post_id");
CREATE INDEX IF NOT EXISTS "post_reaction_post_id_idx" ON "post_reaction" ("post_id");
CREATE INDEX IF NOT EXISTS "post_reaction_owner_id_idx" ON "post_reaction" ("owner_id");
CREATE INDEX IF NOT EXISTS "post_community_id_idx" ON "post" ("community_id");
CREATE INDEX IF NOT EXISTS "post_owner_id_idx" ON "post" ("owner_id");
CREATE INDEX IF NOT EXISTS "post_created_at_idx" ON "post" ("created_at");
CREATE INDEX IF NOT EXISTS "user_auth_email_idx" ON "user_auth" ("email");
CREATE INDEX IF NOT EXISTS "user_auth_user_id_idx" ON "user_auth" ("user_id");
CREATE INDEX IF NOT EXISTS "user_auth_provider_id_idx" ON "user_auth" ("provider_id");
CREATE INDEX IF NOT EXISTS "user_name_idx" ON "user" ("username");
DO $$ BEGIN
 ALTER TABLE "category_community" ADD CONSTRAINT "category_community_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "category_community" ADD CONSTRAINT "category_community_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "category_user" ADD CONSTRAINT "category_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "category_user" ADD CONSTRAINT "category_user_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "community" ADD CONSTRAINT "community_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "community_member" ADD CONSTRAINT "community_member_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "community_member" ADD CONSTRAINT "community_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "poll_option" ADD CONSTRAINT "poll_option_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_option_id_poll_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "poll_option"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "poll_vote" ADD CONSTRAINT "poll_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "poll" ADD CONSTRAINT "poll_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_content" ADD CONSTRAINT "post_content_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_reaction" ADD CONSTRAINT "post_reaction_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_reaction" ADD CONSTRAINT "post_reaction_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post" ADD CONSTRAINT "post_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post" ADD CONSTRAINT "post_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
