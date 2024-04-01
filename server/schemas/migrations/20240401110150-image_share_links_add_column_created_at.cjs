'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `ALTER TABLE image_share_links
             ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()`
        );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `ALTER TABLE image_share_links
             DROP COLUMN created_at`
        );
    },
};
