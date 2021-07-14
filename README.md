## 📖 Anotações

- JWT (JSON Web Token) é armazenado no sessionStorage, localStorage, ou cookies. Refresh Token é armazenado junto, e também normalmente no banco de dados do back end.
  - sessionStorage: é limpado ao fechar o navegador e abrir novamente;
  - localStorage: se mantém ao fechar ao fechar o navegador, reiniciar a máquina, etc; só existe no browser, o servidor não tem acesso, portando por exemplo se é usado Next.js já não da para utilizar;
  - cookies: pode ser acessado tanto no browser quanto no servidor;
