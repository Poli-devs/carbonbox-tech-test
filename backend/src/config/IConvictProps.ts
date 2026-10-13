export interface IConvictProps {
  env: string;
  port: number;
  host: string;
  databaseUrl: string;
  storageDir: string;
  queuePollIntervalMs: number;
}
