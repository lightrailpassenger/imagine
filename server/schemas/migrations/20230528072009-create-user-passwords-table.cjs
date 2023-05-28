'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TABLE user_passwords (
                user_id UUID UNIQUE NOT NULL REFERENCES users(id),
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                version INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`
        );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `DROP TABLE IF EXISTS user_passwords`,
        )
    },
};
