if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const {database, connection} = require('./db/config/database');

async function importUsers() {
  const XLSX = require('xlsx');
  const userRepository = require('./repositories/user');
  const {UniqueConstraintError} = require('sequelize');
  const countBefore = await userRepository.count();
  const duplicates = [];
  console.log(`Users before import: ${countBefore}`);
  try {
      console.log('running import');
      const workbook = XLSX.readFile('files/EE BAFTA DETAILS ATTENDEES.xlsx');
      const sheet_name_list = workbook.SheetNames;
      sheet_name_list.forEach(async (sheet) => {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
        const usersToInsert = data.length;
        console.log(`Users to import: ${usersToInsert}`);
        for (const user of data) {
            const userType = 'audience';
            const fields = {
              company: user.Company,
            };
            try {
              // console.log(user, userType, fields);
              await userRepository.create(user.Email, user.Email, user.Forename, user.Surname, null, null, userType, JSON.stringify(fields), 15, 'active');
            } catch (e) {
                console.log(`error on ${user.Email}`);
                if (e instanceof UniqueConstraintError) {
                    duplicates.push(user.Email);
                }
            }
        }
        // await transaction.commit();
        const countAfter = await userRepository.count();
        console.log(`Duplicate users:`, duplicates);
        console.log(`Before: ${countBefore}. To Import: ${usersToInsert}. Duplicates: ${duplicates.length}. After: ${countAfter}`);
      });
  } catch (e) {
      console.error('error', e);
  }
}

database.configure().then(() => {
  importUsers();
});