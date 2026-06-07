const { app, BrowserWindow } = require('electron');
const path = require('path');

// Manipular a criação/remoção de atalhos no Windows durante a instalação.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Criar a janela do navegador.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.ico'), // Opcional: adicionar um ícone depois
    autoHideMenuBar: true, // Esconde a barra de menu (Alt para mostrar)
  });

  // e carregar o index.html do app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Abrir o DevTools (opcional, comentar para produção)
  // mainWindow.webContents.openDevTools();
};

// Este método será chamado quando o Electron terminar
// a inicialização e estiver pronto para criar janelas do navegador.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // No macOS é comum recriar uma janela no aplicativo quando o
    // ícone do dock é clicado e não há outras janelas abertas.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas forem fechadas, exceto no macOS. Lá, é comum
// que os aplicativos e sua barra de menu permaneçam ativos até que o usuário saia explicitamente com Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
