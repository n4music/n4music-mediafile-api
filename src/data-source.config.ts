import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { cfg } from './submodules/config/env.config';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: cfg('DB_HOST'),
  port: cfg('DB_PORT', Number),
  username: cfg('DB_USERNAME'),
  password: cfg('DB_PASSWORD'),
  database: cfg('DB_NAME'),
  extra: {
    timezone: cfg('DB_TIMEZONE'),
  },
  logging: true,
  synchronize: false,
  entities: [join(__dirname, '/submodules/entities/*.entity{.ts,.js}')], // Path to your entity files
  migrations: [join(__dirname, '/migrations/*.{js,ts}')],
  migrationsTableName: 'history',
  migrationsRun: true,
  // cache: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
