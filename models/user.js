module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'user',
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrememt: true,
        primaryKey: true,
        allowNull: false,
        comment: '사용자 고유번호',
      },
      user_email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '사용자 이메일주소',
      },
      user_password: {
        type: DataTypes.STRING(300),
        allowNull: false,
        comment: '사용자 비밀번호',
      },
      user_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '사용자 이름',
      },
      user_profile_img_path: {
        type: DataTypes.STRING(300),
        allowNull: true,
        comment: '사용자 프로필 이미지 경로',
      },
      reg_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '등록일시',
      },
      edit_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '수정일시',
      },
      delete_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '삭제일시',
      },
    },
    {
      sequelize,
      tableName: 'user',
      timestamps: false,
      comment: '사용자정보',
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'user_id' }],
        },
      ],
    }
  );
};
