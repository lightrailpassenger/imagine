'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TABLE user_images (
                user_id UUID REFERENCES users(id),
                name TEXT NOT NULL DEFAULT 'Untitled',
                image BYTEA NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                expire_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day'
            )`
        );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `DROP TABLE IF EXISTS user_images`
        );
    },
};
