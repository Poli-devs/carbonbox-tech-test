import convict from 'convict';
import dotenv from 'dotenv';
import path from 'path';
import { IConvictProps } from './IConvictProps';

dotenv.config();

const config = convict<IConvictProps>({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind the HTTP server to.',
    format: 'port',
    default: 3001,
    env: 'PORT',
  },
  host: {
    doc: 'The IP address to bind.',
    format: String,
    default: '0.0.0.0',
    env: 'HOST',
  },
  databaseUrl: {
    doc: 'PostgreSQL connection string.',
    format: String,
    default: 'postgresql://postgres:postgres@localhost:5432/document_processing?schema=public',
    env: 'DATABASE_URL',
  },
  storageDir: {
    doc: 'Path to directory for local file storage.',
    format: String,
    default: path.resolve(process.cwd(), 'uploads'),
    env: 'STORAGE_DIR',
  },
  queuePollIntervalMs: {
    doc: 'Interval in ms for polling queue in workers.',
    format: 'nat',
    default: 2000,
    env: 'QUEUE_POLL_INTERVAL_MS',
  },
});

config.validate({ allowed: 'strict' });

export default config;
