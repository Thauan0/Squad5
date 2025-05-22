// babel.config.cjs
module.exports = function (api) {
  // api.cache(true); // Você pode habilitar o cache do Babel se quiser, mas para depuração, às vezes é bom desabilitar.

  // Verifica se o Babel está sendo executado pelo Jest (ambiente 'test')
  const isTest = api.env('test');

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          // Para o Jest, é bom direcionar para a versão do Node que você está usando para rodar os testes.
          // 'current' geralmente funciona bem.
          node: 'current',
        },
        // Ponto CRUCIAL:
        // Quando no ambiente de teste (Jest), NÃO transforme ES modules em CommonJS (modules: false).
        // Deixe o Jest (com --experimental-vm-modules) lidar com os ES modules para que o jest.mock funcione corretamente.
        // Para outros ambientes (como 'development' ou 'production' se você usar build), 'auto' é o padrão e geralmente ok.
        modules: isTest ? false : 'auto',
      },
    ],
  ];

  // Adicione quaisquer plugins do Babel que você possa precisar aqui.
  // Exemplo: const plugins = [ ... ];

  return {
    presets,
    // plugins,
  };
};