import crypto from 'crypto';
import sequelize  from '../../../config/db';
import { DataTypes, Model } from 'sequelize';

import { User } from '../User';

class EmailChangeVerification extends Model {
    declare id: number;
    declare user_id: number;
    declare current_email_token: string;
    declare new_email_token: string;
    declare new_email: string;
    declare expires_at: Date;
}

EmailChangeVerification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id'
            },
            unique: true,
            onDelete: 'CASCADE',
        },
        current_email_token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        new_email_token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        new_email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'email_change_verification',
        hooks: {
            beforeCreate: async (emailChangeVerification: EmailChangeVerification) => {
                const currentEmailToken = crypto.randomBytes(64).toString('hex');
                emailChangeVerification.current_email_token = currentEmailToken;

                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + 10);

                emailChangeVerification.expires_at = expiresAt;
            }
        }
    }
);

export default EmailChangeVerification;