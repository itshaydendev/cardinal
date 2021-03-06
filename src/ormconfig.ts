import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  url: process.env.DB_URI ?? '',
  entities: [__dirname + '/../build/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../build/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: __dirname + '/../src/migrations',
  },
};

export = config;
