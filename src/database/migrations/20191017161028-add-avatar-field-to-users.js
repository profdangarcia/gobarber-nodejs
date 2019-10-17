/* onUpdate fará cascata caso o o arquivo seja alterado, alterando tbm na tabela
de usuarios o novo avatar, onDelete fará com que caso o arquivo seja deletado,
na tabela usuários ficará o campo NULL para o avatar_id */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'set NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
