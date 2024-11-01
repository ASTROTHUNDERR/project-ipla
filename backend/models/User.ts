import bcrypt from 'bcrypt';
import sequelize  from '../config/db';
import { DataTypes, Model } from 'sequelize';

class User extends Model {
    declare id: number;
    declare username: string;
    declare email: string;
    declare password: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'users',
        hooks: {
            beforeCreate: async (user: User) => {
                const hashedPassword = await bcrypt.hash(user.password, 11);
                user.password = hashedPassword;
            }
        }
    }
);

export default User;