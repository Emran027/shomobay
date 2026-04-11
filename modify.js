import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/members/route.ts',
  'src/app/api/contributions/route.ts',
  'src/app/api/lottery/route.ts',
  'src/app/api/settings/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/approve/route.ts',
  'src/app/api/admin/pending/route.ts',
  'src/app/api/admin/permissions/route.ts',
  'src/app/api/admin/reset/route.ts'
];

const asyncFunctions = [
  'getUsers', 'findUserByEmail', 'findUserById', 'createUser', 'adminCreateUser',
  'updateUserStatus', 'updateUserRole', 'updateUserPermission', 'deleteUser', 
  'getContributions', 'addContribution', 'deleteContribution', 'getUserContributions',
  'getContributionsForMonth', 'getLotteryResults', 'addLotteryResult', 'isEligibleForLottery', 
  'getUserDebt', 'getSettings', 'updateSettings', 'factoryResetData'
];

for (const filepath of files) {
  let content = fs.readFileSync(path.join(__dirname, filepath), 'utf-8');
  for (const fn of asyncFunctions) {
    const regex = new RegExp(`(?<!await\\s+)(?<!function\\s+)(?<!\\w)${fn}\\(`, 'g');
    content = content.replace(regex, `await ${fn}(`);
  }
  fs.writeFileSync(path.join(__dirname, filepath), content);
}
console.log('Done refactoring API routes to use await');
