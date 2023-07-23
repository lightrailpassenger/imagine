'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TABLE image_share_links (
                 token TEXT PRIMARY KEY,
                 image_id UUID NOT NULL REFERENCES user_images(id) ON DELETE CASCADE,
                 total_limit INTEGER NOT NULL DEFAULT 1,
                 used_limit INTEGER NOT NULL DEFAULT 0,
                 CHECK (total_limit > 0),
                 CHECK (total_limit >= used_limit)
             )`
        );
        await queryInterface.sequelize.query(
            `CREATE INDEX image_share_links_image_id_btree
             ON image_share_links
             USING BTREE(image_id)`,
        );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `DROP TABLE IF EXISTS image_share_links`
        );
    },
};
