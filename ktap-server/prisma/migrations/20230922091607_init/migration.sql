-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "title" TEXT DEFAULT '普通用户',
    "gender" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "birthday" DATETIME,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "pwd_reset_code" TEXT,
    "pwd_reset_expire_at" DATETIME,
    "last_updated_name_at" DATETIME,
    "is_activated" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "options" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "App" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slogan" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "score" REAL NOT NULL DEFAULT 3.0,
    "released_at" DATETIME,
    "legal_text" TEXT,
    "legal_url" TEXT,
    "download_url" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppLanguages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appId" INTEGER NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "audio" TEXT NOT NULL DEFAULT '',
    "caption" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AppLanguages_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "video" TEXT,
    "thumbnail" TEXT,
    "usage" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "size" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AppMedia_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'normal',
    "color_hex" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppGenreRef" (
    "app_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    PRIMARY KEY ("app_id", "tag_id"),
    CONSTRAINT "AppGenreRef_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppGenreRef_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppFeatureRef" (
    "app_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    PRIMARY KEY ("app_id", "tag_id"),
    CONSTRAINT "AppFeatureRef_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppFeatureRef_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppUserTagRef" (
    "user_id" INTEGER NOT NULL,
    "app_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("app_id", "user_id", "tag_id"),
    CONSTRAINT "AppUserTagRef_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppUserTagRef_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'company',
    "summary" TEXT,
    "logo" TEXT,
    "site" TEXT,
    "country" TEXT,
    "user_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Organization_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppPublisherRef" (
    "app_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,

    PRIMARY KEY ("app_id", "organization_id"),
    CONSTRAINT "AppPublisherRef_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppPublisherRef_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppDeveloperRef" (
    "app_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,

    PRIMARY KEY ("app_id", "organization_id"),
    CONSTRAINT "AppDeveloperRef_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AppDeveloperRef_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppSocialLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AppSocialLink_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppPlatform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "os" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AppPlatform_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppAward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AppAward_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "url" TEXT,
    CONSTRAINT "ProReview_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "score" REAL NOT NULL,
    "content" TEXT NOT NULL,
    "ip" TEXT,
    "allow_comment" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Review_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "review_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ReviewImage_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ReviewComment_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReviewComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewReport_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewThumb" (
    "review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'up',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("review_id", "user_id")
);

-- CreateTable
CREATE TABLE "ReviewGiftRef" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review_id" INTEGER,
    "gift_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "ReviewGiftRef_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReviewGiftRef_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "Gift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewGiftRef_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "head" TEXT,
    "banner" TEXT,
    "content" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "News_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HotSearch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "hit_count" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FollowApp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "follower_id" INTEGER NOT NULL,
    "app_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowApp_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "follower_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Buzzword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "target_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PageWidget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "page" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "style" TEXT NOT NULL DEFAULT 'Standard',
    "target" TEXT NOT NULL,
    "targetIds" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TokenBlackList" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DiscussionChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "app_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DiscussionChannel_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserDiscussionChannelRef" (
    "user_id" INTEGER NOT NULL,
    "discussion_channel_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "discussion_channel_id"),
    CONSTRAINT "UserDiscussionChannelRef_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserDiscussionChannelRef_discussion_channel_id_fkey" FOREIGN KEY ("discussion_channel_id") REFERENCES "DiscussionChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "is_sticky" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "discussion_channel_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_post_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "app_id" INTEGER,
    CONSTRAINT "Discussion_discussion_channel_id_fkey" FOREIGN KEY ("discussion_channel_id") REFERENCES "DiscussionChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Discussion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Discussion_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "App" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Discussion_last_post_id_fkey" FOREIGN KEY ("last_post_id") REFERENCES "DiscussionPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscussionPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "discussion_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "DiscussionPost_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "Discussion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscussionPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscussionPostThumb" (
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'up',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("post_id", "user_id")
);

-- CreateTable
CREATE TABLE "DiscussionPostReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionPostReport_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "DiscussionPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscussionPostReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscussionPostGiftRef" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER,
    "gift_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionPostGiftRef_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "DiscussionPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DiscussionPostGiftRef_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "Gift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscussionPostGiftRef_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'system',
    "target" TEXT,
    "target_id" INTEGER,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "extra" TEXT NOT NULL DEFAULT '{}',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "criteria" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserAchievementRef" (
    "user_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "accumulation" INTEGER NOT NULL DEFAULT 0,
    "unlocked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "achievement_id"),
    CONSTRAINT "UserAchievementRef_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievementRef_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_key" ON "UserSetting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppLanguages_appId_key" ON "AppLanguages"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Review_app_id_user_id_key" ON "Review"("app_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "HotSearch_content_key" ON "HotSearch"("content");

-- CreateIndex
CREATE UNIQUE INDEX "FollowApp_follower_id_app_id_key" ON "FollowApp"("follower_id", "app_id");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUser_follower_id_user_id_key" ON "FollowUser"("follower_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Discussion_last_post_id_key" ON "Discussion"("last_post_id");
