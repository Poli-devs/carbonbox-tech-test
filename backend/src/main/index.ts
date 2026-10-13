import { App } from './App';

async function bootstrap() {
  const application = new App();

  const shutdown = async () => {
    console.log('\nGracefully shutting down...');
    await application.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await application.start();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
