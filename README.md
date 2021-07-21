<img alt="ignite-reactjs" title="ignite-reactjs" src=".github/cover-reactjs.png">

<h1 align="center">
  Autenticação e autorização
</h1>

## 🚀 Tecnologias e bibliotecas utilizadas

- React.js
- Next.js
- TypeScript
- Axios
- nookies (biblioteca para gerenciamento de cookies no Next.js)

## 💻 Repositório

Projeto desenvolvido estudando como criar um processo completo de autenticação, autorização e refresh token dentro do React com Next.js, permitindo controlar o acesso à rotas e componentes tanto no client-side quanto no server-side.

## 📖 Anotações

- JWT (JSON Web Token) é armazenado no sessionStorage, localStorage, ou cookies. Refresh Token é armazenado junto, e também normalmente no banco de dados do back end.
  - sessionStorage: é limpado ao fechar o navegador e abrir novamente;
  - localStorage: se mantém ao fechar ao fechar o navegador, reiniciar a máquina, etc; só existe no browser, o servidor não tem acesso, portando por exemplo se é usado Next.js já não da para utilizar;
  - cookies: pode ser acessado tanto no browser quanto no servidor;

## ⚙ Clone e execução

```bash
# Abra um terminal e clone este repositório com o comando

$ git clone https://github.com/FelipeBrenner/ignite-reactjs-nextauth.git

# Acesse a pasta da aplicação

$ cd ignite-reactjs-nextauth

# Instale as dependências

$ yarn

# Clone o projeto do back end para realização do login e autenticações

$ git clone https://github.com/rocketseat-education/ignite-reactjs-auth-backend.git

# Acesse a pasta da aplicação

$ cd ignite-reactjs-auth-backend

# Instale suas dependências

$ yarn

# Pode iniciar ambas aplicações, back e front

$ yarn dev
```

---

Por Felipe Brenner
