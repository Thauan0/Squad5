// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Compila para a versão do Node que você está usando
        },
      },
    ],
  ],
};