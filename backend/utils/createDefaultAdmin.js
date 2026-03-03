const Admin = require('../models/Admin');

const createDefaultAdmin = async () => {
    const email = 'bhargav@gmail.com';
    const password = 'admin';

    const existing = await Admin.findOne({ email });
    if (existing) {
        return;
    }

    await Admin.create({
        name: 'Super Admin',
        email,
        password
    });
};

module.exports = createDefaultAdmin;

