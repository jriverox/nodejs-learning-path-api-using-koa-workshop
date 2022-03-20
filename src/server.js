const yenv = require('yenv');
const mongoose = require('mongoose');
const app = require('./app');

const env = yenv();

app.on('error', (err, ctx) => {
  const isOperationalError = logManager.error(err);
  if (!isOperationalError) {
    process.exit(1);
  }
});

// abrir la conexión con MongoDB
mongoose
  .connect(env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => {
    // iniciar el servidor koa para que empiece a escuchar peticiones
    app.listen(env.PORT, () => {
      console.log(`Escuchando en el puerto ${env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
