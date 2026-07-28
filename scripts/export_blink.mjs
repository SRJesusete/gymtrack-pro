import { createClient } from '@blinkdotnew/sdk';
import fs from 'fs';

const blink = createClient({
  projectId: 'gymtrack-mobile-app-u6wmrz3v',
  publishableKey: 'blnk_pk_JZTCt7UQO7BNLi0_edtLd41Xt34Qxan-',
  authRequired: false,
});

async function dump(table, opts = {}) {
  try {
    const rows = await blink.db.table(table).list(opts);
    console.log(`OK ${table}: ${rows.length} rows`);
    return rows;
  } catch (e) {
    console.log(`ERR ${table}: ${e?.message || e}`);
    return null;
  }
}

const out = {};
out.exercises = await dump('exercises', { orderBy: { name: 'asc' }, limit: 1000 });

fs.writeFileSync('/app/scripts/blink_export.json', JSON.stringify(out, null, 2));
console.log('written /app/scripts/blink_export.json');
process.exit(0);
