const EmailAlias = require('../models/EmailAlias');

const createDefaultAliases = async () => {
  const samples = [
    { personalEmail: 'b@gmail.com', eduEmail: 'b@srmap.edu.in', collegeDomain: 'srmap.edu.in' }
  ];

  for (const s of samples) {
    const exists = await EmailAlias.findOne({ personalEmail: s.personalEmail.toLowerCase() });
    if (!exists) {
      await EmailAlias.create({
        personalEmail: s.personalEmail.toLowerCase(),
        eduEmail: s.eduEmail.toLowerCase(),
        collegeDomain: s.collegeDomain.toLowerCase()
      });
    }
  }
};

module.exports = createDefaultAliases;
