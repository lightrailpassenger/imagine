'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TABLE users (
                id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
                client_side_id UUID NOT NULL DEFAULT GEN_RANDOM_UUID() UNIQUE,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
      );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `DROP TABLE IF EXISTS users`,
        );
    },
};
