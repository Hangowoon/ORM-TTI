module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'generated_data',
    {
      data_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: '생성데이터 고유번호',
      },
      reg_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '생성자 고유번호(사용자 고유번호)',
      },
      data_prompt: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '생성데이터 프롬프트',
      },
      data_ai_model_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '생성데이터 ai모델명',
      },
      data_img_size: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '생성데이터 이미지크기',
      },
      data_output_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '생성데이터 산출수량',
      },
      data_save_path: {
        type: DataTypes.STRING(300),
        allowNull: true,
        comment: '생성데이터 저장경로',
      },
      data_disclosure: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '생성데이터 공개여부 : 0 비공개, 1 공개',
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
      tableName: 'generated_data',
      timestamps: false,
      comment: '생성데이터정보',
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'data_id' }],
        },
      ],
    }
  );
};
