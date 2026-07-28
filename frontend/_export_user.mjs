import { createClient } from '@blinkdotnew/sdk';
import fs from 'fs';

const blink = createClient({
  projectId: 'gymtrack-mobile-app-u6wmrz3v',
  publishableKey: 'blnk_pk_JZTCt7UQO7BNLi0_edtLd41Xt34Qxan-',
  authRequired: false,
  auth: { mode: 'headless' },
});

async function dump(table, opts = {}) {
  try {
    const rows = await blink.db.table(table).list(opts);
    console.log(`OK ${table}: ${rows.length}`);
    return rows;
  } catch (e) {
    console.log(`ERR ${table}: ${e?.message || e}`);
    return null;
  }
}

const cred = { email: 'v1785168280205@gymtrack.test', password: 'test1234' };
let user = null;
try {
  const res = await blink.auth.signInWithEmail(cred.email, cred.password);
  console.log('signin res:', JSON.stringify(res)?.slice(0, 300));
  const st = blink.auth.me ? await blink.auth.me() : null;
  console.log('me:', JSON.stringify(st)?.slice(0, 300));
  user = st?.id ? st : res?.user || res;
} catch (e) {
  console.log('signin failed:', e?.message || e);
}

const uid = user?.id;
console.log('uid =', uid);

const out = {};
if (uid) {
  out.sessions = await dump('sessions', { where: { userId: uid }, limit: 1000 });
  out.templates = await dump('templates', { where: { userId: uid }, limit: 1000 });
  out.personalRecords = await dump('personalRecords', { where: { userId: uid }, limit: 1000 });
  out.userExercises = await dump('userExercises', { where: { userId: uid }, limit: 1000 });
}
fs.writeFileSync('/app/scripts/blink_userdata.json', JSON.stringify({ uid, ...out }, null, 2));
console.log('done');
process.exit(0);
