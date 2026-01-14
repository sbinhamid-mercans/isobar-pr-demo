import { createApp } from './app';

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`orders desk listening on http://localhost:${port}`);
});
