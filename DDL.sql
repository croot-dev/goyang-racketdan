CREATE SCHEMA "public";
CREATE SCHEMA "auth";
CREATE SCHEMA "neon_auth";
CREATE SCHEMA "pgrst";
CREATE TABLE "bbs_comment" (
	"comment_id" bigserial PRIMARY KEY,
	"post_id" bigint NOT NULL,
	"parent_comment_id" bigint,
	"content" text NOT NULL,
	"writer_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "bbs_post" (
	"post_id" bigserial PRIMARY KEY,
	"bbs_type_id" bigint NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"writer_id" bigint NOT NULL,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "bbs_type" (
	"bbs_type_id" bigserial PRIMARY KEY,
	"type_code" varchar(50) NOT NULL CONSTRAINT "bbs_type_type_code_key" UNIQUE,
	"type_name" varchar(100) NOT NULL,
	"description" varchar(200),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "event_absence" (
	"id" bigserial PRIMARY KEY,
	"event_id" bigint NOT NULL UNIQUE,
	"member_seq" bigint NOT NULL UNIQUE,
	"absence_type" varchar(10) NOT NULL,
	"reason" text NOT NULL,
	"late_minutes" integer,
	"reported_by" bigint,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_event_absence" UNIQUE("event_id","member_seq"),
	CONSTRAINT "chk_event_absence_late" CHECK (CHECK (((((absence_type)::text = 'LATE'::text) AND (late_minutes IS NOT NULL) AND (late_minutes > 0)) OR (((absence_type)::text = 'NO_SHOW'::text) AND (late_minutes IS NULL))))),
	CONSTRAINT "chk_event_absence_type" CHECK (CHECK (((absence_type)::text = ANY ((ARRAY['LATE'::character varying, 'NO_SHOW'::character varying])::text[]))))
);
CREATE TABLE "event_comments" (
	"id" bigserial PRIMARY KEY,
	"event_id" bigint NOT NULL,
	"member_seq" bigint NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
CREATE TABLE "event_participant_logs" (
	"id" bigserial PRIMARY KEY,
	"event_id" bigint NOT NULL,
	"member_seq" bigint NOT NULL,
	"from_status" varchar(10),
	"to_status" varchar(10) NOT NULL,
	"action_type" varchar(20) NOT NULL,
	"actor_member_seq" bigint,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chk_from_status" CHECK (CHECK (((from_status IS NULL) OR ((from_status)::text = ANY ((ARRAY['JOIN'::character varying, 'WAIT'::character varying, 'CANCEL'::character varying])::text[]))))),
	CONSTRAINT "chk_to_status" CHECK (CHECK (((to_status)::text = ANY ((ARRAY['JOIN'::character varying, 'WAIT'::character varying, 'CANCEL'::character varying])::text[]))))
);
CREATE TABLE "event_participants" (
	"id" bigserial PRIMARY KEY,
	"event_id" bigint NOT NULL UNIQUE,
	"member_seq" bigint NOT NULL UNIQUE,
	"status" varchar(10) NOT NULL,
	"wait_order" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_event_participants" UNIQUE("event_id","member_seq"),
	CONSTRAINT "chk_event_participants_status" CHECK (CHECK (((status)::text = ANY ((ARRAY['JOIN'::character varying, 'WAIT'::character varying, 'CANCEL'::character varying])::text[])))),
	CONSTRAINT "chk_event_participants_wait" CHECK (CHECK (((((status)::text = 'WAIT'::text) AND (wait_order IS NOT NULL)) OR (((status)::text <> 'WAIT'::text) AND (wait_order IS NULL)))))
);
CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY,
	"title" varchar(100) NOT NULL,
	"description" text,
	"location_name" varchar(100),
	"location_url" text,
	"max_participants" integer NOT NULL,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"host_member_seq" bigint NOT NULL,
	"start_datetime" timestamp with time zone NOT NULL,
	"end_datetime" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chk_participant_limit" CHECK (CHECK ((current_participants <= max_participants))),
	CONSTRAINT "events_current_participants_check" CHECK (CHECK ((current_participants >= 0))),
	CONSTRAINT "events_max_participants_check" CHECK (CHECK ((max_participants > 0)))
);
CREATE TABLE "member" (
	"seq" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "member_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(20) NOT NULL,
	"nickname" varchar(20) NOT NULL CONSTRAINT "member_nickname_key" UNIQUE,
	"gender" varchar(10) DEFAULT 'M' NOT NULL,
	"ntrp" numeric(3, 1),
	"email" varchar(100) NOT NULL CONSTRAINT "member_email_key" UNIQUE,
	"password_hash" text NOT NULL,
	"phone" varchar(20),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"profile_image_url" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"member_id" numeric CONSTRAINT "member_member_id_key" UNIQUE,
	"birthdate" date
);
CREATE TABLE "member_role" (
	"seq" bigserial PRIMARY KEY,
	"member_seq" bigint NOT NULL UNIQUE,
	"role_seq" bigint NOT NULL UNIQUE,
	"assigned_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_member_role" UNIQUE("member_seq","role_seq")
);
CREATE TABLE "role" (
	"seq" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "role_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL CONSTRAINT "role_code_key" UNIQUE,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
CREATE TABLE "neon_auth"."users_sync" (
	"raw_json" jsonb NOT NULL,
	"id" text PRIMARY KEY GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED,
	"name" text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
	"email" text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
	"created_at" timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
ALTER TABLE "bbs_comment" ADD CONSTRAINT "fk_bbs_comment_parent" FOREIGN KEY ("parent_comment_id") REFERENCES "bbs_comment"("comment_id") ON DELETE CASCADE;
ALTER TABLE "bbs_comment" ADD CONSTRAINT "fk_bbs_comment_post" FOREIGN KEY ("post_id") REFERENCES "bbs_post"("post_id") ON DELETE CASCADE;
ALTER TABLE "bbs_post" ADD CONSTRAINT "fk_bbs_post_type" FOREIGN KEY ("bbs_type_id") REFERENCES "bbs_type"("bbs_type_id");
ALTER TABLE "event_absence" ADD CONSTRAINT "fk_event_absence_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;
ALTER TABLE "event_absence" ADD CONSTRAINT "fk_event_absence_member" FOREIGN KEY ("member_seq") REFERENCES "member"("seq") ON DELETE CASCADE;
ALTER TABLE "event_absence" ADD CONSTRAINT "fk_event_absence_reporter" FOREIGN KEY ("reported_by") REFERENCES "member"("seq");
ALTER TABLE "event_comments" ADD CONSTRAINT "fk_event_comments_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;
ALTER TABLE "event_comments" ADD CONSTRAINT "fk_event_comments_member" FOREIGN KEY ("member_seq") REFERENCES "member"("seq") ON DELETE CASCADE;
ALTER TABLE "event_participant_logs" ADD CONSTRAINT "fk_logs_actor" FOREIGN KEY ("actor_member_seq") REFERENCES "member"("seq");
ALTER TABLE "event_participant_logs" ADD CONSTRAINT "fk_logs_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;
ALTER TABLE "event_participant_logs" ADD CONSTRAINT "fk_logs_member" FOREIGN KEY ("member_seq") REFERENCES "member"("seq") ON DELETE CASCADE;
ALTER TABLE "event_participants" ADD CONSTRAINT "fk_event_participants_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;
ALTER TABLE "event_participants" ADD CONSTRAINT "fk_event_participants_member" FOREIGN KEY ("member_seq") REFERENCES "member"("seq") ON DELETE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "fk_events_host" FOREIGN KEY ("host_member_seq") REFERENCES "member"("seq");
ALTER TABLE "member_role" ADD CONSTRAINT "fk_member_role_member" FOREIGN KEY ("member_seq") REFERENCES "member"("seq") ON DELETE CASCADE;
ALTER TABLE "member_role" ADD CONSTRAINT "fk_member_role_role" FOREIGN KEY ("role_seq") REFERENCES "role"("seq") ON DELETE CASCADE;
CREATE UNIQUE INDEX "bbs_comment_pkey" ON "bbs_comment" ("comment_id");
CREATE UNIQUE INDEX "bbs_post_pkey" ON "bbs_post" ("post_id");
CREATE UNIQUE INDEX "bbs_type_pkey" ON "bbs_type" ("bbs_type_id");
CREATE UNIQUE INDEX "bbs_type_type_code_key" ON "bbs_type" ("type_code");
CREATE UNIQUE INDEX "event_absence_pkey" ON "event_absence" ("id");
CREATE UNIQUE INDEX "uq_event_absence" ON "event_absence" ("event_id","member_seq");
CREATE UNIQUE INDEX "event_comments_pkey" ON "event_comments" ("id");
CREATE UNIQUE INDEX "event_participant_logs_pkey" ON "event_participant_logs" ("id");
CREATE UNIQUE INDEX "event_participants_pkey" ON "event_participants" ("id");
CREATE UNIQUE INDEX "uq_event_participants" ON "event_participants" ("event_id","member_seq");
CREATE UNIQUE INDEX "events_pkey" ON "events" ("id");
CREATE UNIQUE INDEX "member_email_key" ON "member" ("email");
CREATE UNIQUE INDEX "member_member_id_key" ON "member" ("member_id");
CREATE UNIQUE INDEX "member_nickname_key" ON "member" ("nickname");
CREATE UNIQUE INDEX "member_pkey" ON "member" ("seq");
CREATE UNIQUE INDEX "member_role_pkey" ON "member_role" ("seq");
CREATE UNIQUE INDEX "uq_member_role" ON "member_role" ("member_seq","role_seq");
CREATE UNIQUE INDEX "role_code_key" ON "role" ("code");
CREATE UNIQUE INDEX "role_pkey" ON "role" ("seq");
CREATE INDEX "users_sync_deleted_at_idx" ON "neon_auth"."users_sync" ("deleted_at");
CREATE UNIQUE INDEX "users_sync_pkey" ON "neon_auth"."users_sync" ("id");