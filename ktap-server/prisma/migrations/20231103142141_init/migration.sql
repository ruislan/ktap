-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(256) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `password` VARCHAR(256) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `avatar` VARCHAR(2048) NULL,
    `title` VARCHAR(64) NULL DEFAULT '普通用户',
    `gender` VARCHAR(16) NULL,
    `bio` VARCHAR(512) NULL,
    `location` VARCHAR(256) NULL,
    `birthday` DATETIME(3) NULL,
    `balance` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `pwd_reset_code` VARCHAR(256) NULL,
    `pwd_reset_expire_at` DATETIME(3) NULL,
    `last_updated_name_at` DATETIME(3) NULL,
    `is_activated` BOOLEAN NOT NULL DEFAULT false,
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_name_key`(`name`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSetting` (
    `userId` INTEGER UNSIGNED NOT NULL,
    `options` TEXT NOT NULL,

    UNIQUE INDEX `UserSetting_userId_key`(`userId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trading` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `target` VARCHAR(64) NOT NULL,
    `targetId` INTEGER UNSIGNED NOT NULL,
    `amount` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `App` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `slogan` VARCHAR(64) NULL,
    `summary` VARCHAR(256) NULL,
    `description` TEXT NULL,
    `score` DOUBLE NOT NULL DEFAULT 3.0,
    `released_at` DATETIME(3) NULL,
    `legal_text` TEXT NULL,
    `legal_url` VARCHAR(2048) NULL,
    `download_url` VARCHAR(2048) NULL,
    `is_visible` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppLanguages` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `appId` INTEGER UNSIGNED NOT NULL,
    `text` TEXT NOT NULL,
    `audio` TEXT NOT NULL,
    `caption` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppLanguages_appId_key`(`appId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppMedia` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `image` VARCHAR(2048) NOT NULL,
    `video` VARCHAR(2048) NULL,
    `thumbnail` VARCHAR(2048) NULL,
    `usage` VARCHAR(64) NOT NULL,
    `type` VARCHAR(64) NOT NULL DEFAULT 'image',
    `size` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `category` VARCHAR(64) NOT NULL DEFAULT 'normal',
    `color_hex` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppGenreRef` (
    `app_id` INTEGER UNSIGNED NOT NULL,
    `tag_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`app_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppFeatureRef` (
    `app_id` INTEGER UNSIGNED NOT NULL,
    `tag_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`app_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppUserTagRef` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `tag_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`app_id`, `user_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `type` VARCHAR(64) NOT NULL DEFAULT 'company',
    `summary` VARCHAR(512) NULL,
    `logo` VARCHAR(2048) NULL,
    `site` VARCHAR(2048) NULL,
    `country` VARCHAR(64) NULL,
    `user_id` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppPublisherRef` (
    `app_id` INTEGER UNSIGNED NOT NULL,
    `organization_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`app_id`, `organization_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppDeveloperRef` (
    `app_id` INTEGER UNSIGNED NOT NULL,
    `organization_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`app_id`, `organization_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppSocialLink` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `brand` VARCHAR(64) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `url` VARCHAR(2048) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppPlatform` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `os` VARCHAR(64) NOT NULL,
    `requirements` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppAward` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `image` VARCHAR(2048) NOT NULL,
    `url` VARCHAR(2048) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProReview` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `score` VARCHAR(64) NOT NULL,
    `summary` VARCHAR(512) NOT NULL,
    `url` VARCHAR(2048) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NULL,
    `score` DOUBLE NOT NULL,
    `content` TEXT NOT NULL,
    `ip` VARCHAR(64) NULL,
    `allow_comment` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_app_id_user_id_key`(`app_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewImage` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(2048) NOT NULL,
    `review_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewComment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER UNSIGNED NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `ip` VARCHAR(64) NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewReport` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewThumb` (
    `review_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `direction` VARCHAR(16) NOT NULL DEFAULT 'up',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`review_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewGiftRef` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER UNSIGNED NULL,
    `gift_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gift` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(512) NOT NULL,
    `price` BIGINT UNSIGNED NOT NULL,
    `url` VARCHAR(2048) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `News` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `summary` VARCHAR(512) NOT NULL,
    `head` VARCHAR(2048) NULL,
    `banner` VARCHAR(2048) NULL,
    `content` TEXT NOT NULL,
    `viewCount` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotSearch` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(64) NOT NULL,
    `hit_count` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HotSearch_content_key`(`content`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FollowApp` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `follower_id` INTEGER UNSIGNED NOT NULL,
    `app_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FollowApp_follower_id_app_id_key`(`follower_id`, `app_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FollowUser` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `follower_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FollowUser_follower_id_user_id_key`(`follower_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Buzzword` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(256) NOT NULL,
    `weight` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Timeline` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `target` VARCHAR(64) NOT NULL,
    `target_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageWidget` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `page` VARCHAR(64) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `style` VARCHAR(64) NOT NULL DEFAULT 'Standard',
    `target` VARCHAR(64) NOT NULL,
    `targetIds` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenBlackList` (
    `token` VARCHAR(256) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionChannel` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(512) NULL,
    `icon` VARCHAR(2048) NULL,
    `app_id` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDiscussionChannelRef` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `discussion_channel_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`user_id`, `discussion_channel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discussion` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(256) NOT NULL,
    `is_sticky` BOOLEAN NOT NULL DEFAULT false,
    `is_closed` BOOLEAN NOT NULL DEFAULT false,
    `discussion_channel_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_post_id` INTEGER UNSIGNED NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `app_id` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `Discussion_last_post_id_key`(`last_post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionPost` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `ip` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `discussion_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionPostThumb` (
    `post_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `direction` VARCHAR(16) NOT NULL DEFAULT 'up',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`post_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionPostReport` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionPostGiftRef` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER UNSIGNED NULL,
    `gift_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `type` VARCHAR(64) NOT NULL DEFAULT 'system',
    `target` VARCHAR(64) NULL,
    `target_id` INTEGER UNSIGNED NULL,
    `title` VARCHAR(256) NOT NULL,
    `content` TEXT NOT NULL,
    `url` VARCHAR(2048) NULL,
    `extra` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(512) NOT NULL,
    `icon` VARCHAR(2048) NOT NULL,
    `message` VARCHAR(512) NOT NULL,
    `criteria` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAchievementRef` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `achievement_id` INTEGER UNSIGNED NOT NULL,
    `accumulation` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `unlocked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`, `achievement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSetting` ADD CONSTRAINT `UserSetting_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppLanguages` ADD CONSTRAINT `AppLanguages_appId_fkey` FOREIGN KEY (`appId`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppMedia` ADD CONSTRAINT `AppMedia_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppGenreRef` ADD CONSTRAINT `AppGenreRef_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppGenreRef` ADD CONSTRAINT `AppGenreRef_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppFeatureRef` ADD CONSTRAINT `AppFeatureRef_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppFeatureRef` ADD CONSTRAINT `AppFeatureRef_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppUserTagRef` ADD CONSTRAINT `AppUserTagRef_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppUserTagRef` ADD CONSTRAINT `AppUserTagRef_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppPublisherRef` ADD CONSTRAINT `AppPublisherRef_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppPublisherRef` ADD CONSTRAINT `AppPublisherRef_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppDeveloperRef` ADD CONSTRAINT `AppDeveloperRef_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppDeveloperRef` ADD CONSTRAINT `AppDeveloperRef_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppSocialLink` ADD CONSTRAINT `AppSocialLink_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppPlatform` ADD CONSTRAINT `AppPlatform_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppAward` ADD CONSTRAINT `AppAward_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProReview` ADD CONSTRAINT `ProReview_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewImage` ADD CONSTRAINT `ReviewImage_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `Review`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewComment` ADD CONSTRAINT `ReviewComment_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `Review`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewComment` ADD CONSTRAINT `ReviewComment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewReport` ADD CONSTRAINT `ReviewReport_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `Review`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewReport` ADD CONSTRAINT `ReviewReport_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewGiftRef` ADD CONSTRAINT `ReviewGiftRef_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `Review`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewGiftRef` ADD CONSTRAINT `ReviewGiftRef_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `Gift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewGiftRef` ADD CONSTRAINT `ReviewGiftRef_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowApp` ADD CONSTRAINT `FollowApp_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUser` ADD CONSTRAINT `FollowUser_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionChannel` ADD CONSTRAINT `DiscussionChannel_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDiscussionChannelRef` ADD CONSTRAINT `UserDiscussionChannelRef_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDiscussionChannelRef` ADD CONSTRAINT `UserDiscussionChannelRef_discussion_channel_id_fkey` FOREIGN KEY (`discussion_channel_id`) REFERENCES `DiscussionChannel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Discussion` ADD CONSTRAINT `Discussion_discussion_channel_id_fkey` FOREIGN KEY (`discussion_channel_id`) REFERENCES `DiscussionChannel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Discussion` ADD CONSTRAINT `Discussion_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Discussion` ADD CONSTRAINT `Discussion_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `App`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Discussion` ADD CONSTRAINT `Discussion_last_post_id_fkey` FOREIGN KEY (`last_post_id`) REFERENCES `DiscussionPost`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPost` ADD CONSTRAINT `DiscussionPost_discussion_id_fkey` FOREIGN KEY (`discussion_id`) REFERENCES `Discussion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPost` ADD CONSTRAINT `DiscussionPost_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPostReport` ADD CONSTRAINT `DiscussionPostReport_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `DiscussionPost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPostReport` ADD CONSTRAINT `DiscussionPostReport_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPostGiftRef` ADD CONSTRAINT `DiscussionPostGiftRef_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `DiscussionPost`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPostGiftRef` ADD CONSTRAINT `DiscussionPostGiftRef_gift_id_fkey` FOREIGN KEY (`gift_id`) REFERENCES `Gift`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPostGiftRef` ADD CONSTRAINT `DiscussionPostGiftRef_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAchievementRef` ADD CONSTRAINT `UserAchievementRef_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAchievementRef` ADD CONSTRAINT `UserAchievementRef_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `Achievement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
