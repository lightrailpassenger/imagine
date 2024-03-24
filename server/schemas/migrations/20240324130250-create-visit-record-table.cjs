'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TABLE visit_records (
                link_token TEXT NOT NULL REFERENCES image_share_links(token) ON DELETE CASCADE,
                user_agent TEXT NOT NULL
            )`
        );
        await queryInterface.sequelize.query(
            `CREATE INDEX visit_records_link_id_btree
            ON visit_records
            USING BTREE(link_token)`
        );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `DROP TABLE visit_records`
        );
    }
};
