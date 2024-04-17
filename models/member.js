module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'member',
    {
      membeer_id: {
        type: DataTypes.INTEGER,
        autoIncrememt: true,
        primaryKey: true,
        allowNull: false,
        comment: '사용자 고유번호',
      },
      member_email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '사용자 이메일주소',
      },
      member_password: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '사용자 비밀번호',
      },
      member_username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '사용자 이름',
      },
      member_profile_img_path: {
        type: DataTypes.STRING(300),
        allowNull: false,
        comment: '사용자 프로필 이미지 경로',
      },
      reg_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '등록일시',
      },
      reg_member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '등록자 고유번호',
      },
      edit_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '수정일시',
      },
      edit_member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '수정자 고유번호',
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
