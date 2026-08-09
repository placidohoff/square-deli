// One-time (or re-run-to-reset-password) setup script for the admin account.
// Run it with `npm run create-admin` from server/. Prompts interactively
// rather than taking the password as a command-line arg or env var, so it
// never ends up sitting in your shell history.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const username = await rl.question('Admin username: ');
  const password = await rl.question('Admin password: ');
  rl.close();

  // bcrypt.hash is intentionally slow (it runs the hashing algorithm
  // multiple rounds — 10, here) so that even if the hashes ever leaked,
  // brute-forcing the original password back out would be expensive.
  const passwordHash = await bcrypt.hash(password, 10);

  // upsert: create the row if this username doesn't exist yet, or overwrite
  // its passwordHash if it does — so re-running this script later is also
  // how you reset the admin password.
  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Admin user "${admin.username}" is ready.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
