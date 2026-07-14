import { spawnSync } from 'node:child_process';
import net from 'node:net';

const dockerCheck = spawnSync('docker', ['--version'], {
  encoding: 'utf8',
  stdio: 'pipe',
});

if (dockerCheck.error?.code === 'ENOENT' || dockerCheck.status !== 0) {
  console.error('\nDocker is required to start PostgreSQL and Redis.');
  console.error('Install and start Docker Desktop, then run npm run dev again.\n');
  process.exit(1);
}

const result = spawnSync('docker', ['compose', 'up', '-d'], {
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const waitForPort = ({ host, port, name, timeoutMs = 45_000 }) => {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ host, port });

      socket.setTimeout(1_000);

      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });

      const retry = () => {
        socket.destroy();

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`${name} did not become ready at ${host}:${port}`));
          return;
        }

        setTimeout(tryConnect, 1_000);
      };

      socket.on('error', retry);
      socket.on('timeout', retry);
    };

    tryConnect();
  });
};

console.log('Waiting for PostgreSQL and Redis...');

try {
  await Promise.all([
    waitForPort({ host: 'localhost', port: 5432, name: 'PostgreSQL' }),
    waitForPort({ host: 'localhost', port: 6379, name: 'Redis' }),
  ]);
  console.log('PostgreSQL and Redis are ready.');
} catch (error) {
  console.error(`\n${error.message}`);
  console.error('Check Docker Desktop and run: docker compose ps\n');
  process.exit(1);
}
