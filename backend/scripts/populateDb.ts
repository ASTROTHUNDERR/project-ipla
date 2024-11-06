import { User, Role, UserRole } from '../models';

const USER = {
    username: 'vision', email: 'giorgi@gmail.com',  password: 'merebagio', type: 'player'
}

const ROLES = [
    {
        name: 'default'
    },
    {
        name: 'admin'
    }
]

async function populateDb() {
    console.log('Populating database');

    const user = await User.create({ ...USER });

    for (const r of ROLES) {
        await Role.create({ ...r });
    }

    await UserRole.create({
        user_id: user.id, role_id: 2
    });

    console.log('Database populated');
};

populateDb();