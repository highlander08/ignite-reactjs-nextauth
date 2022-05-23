//  responsavel por ter todas as informaçãos do contexto de autenticação 
import Router from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { setCookie } from "../utils/setCookie";
// formato do usuario
type User = {
  email: string;
  permissions: string[];
  roles: string[];
};
// para autenticar usuario eu preciso de email  e password
type SignInCredentials = {
  email: string;
  password: string;
};
//informações que eu vou ter dentro do contexto || o que eu quero salvar de informação do usuario
type AuthContextData = {
  // metodo que recebi as credencias do usuario || chamada na api, mas sem retorno
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  // info se o usuario esta autenticado ou nao
  isAuthenticated: boolean;
};
// informar que o componente recebe filhos
type AuthProviderProps = {
  // informa que o componente pode receber dentro dele componentes, numeros, textos etc...
  children: ReactNode;
};
// metodo de autenticação vou colocar dentro do contexto(compartilhar para todo o app) por que mais de uma pagina na aplicação pode precisar fazer a autenticação do usuario || pode ser que voce possa ter um formulario em outra parte do app || ou alguma outra ação do app faça com que o seu usuario se autentique dentro da aplicação
// as AuthContextData -> usado para quando chamar ocontext dentro dos componentes tenha a intelisense do editor par entender quais info eu posso pegar dentro do contexto
export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, "nextauth.token", { path: "/" });
  destroyCookie(undefined, "nextauth.refreshToken", { path: "/" });

  authChannel.postMessage("signOut");
// so funcionar pelo lado do browser
  Router.push("/");
}
// children -> todos os elementos que estao dentro do authProvider
export function AuthProvider({ children }: AuthProviderProps) {
  // armazenar os dados do usuario
  const [user, setUser] = useState<User>();
  // se estiver vazio vai retornar false se nao vai retorna true
  const isAuthenticated = !!user;

// toda vez que o usuario sai do app, se uma aba estiver logada, vamos ter que redireciona todas as abas para a home/login
  useEffect(() => {
    authChannel = new BroadcastChannel("auth");
// deslogar o usuario caso ele tenha saido do app e esteja aberto em outra aba
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          authChannel.close();
          break;
        case "signIn":
          window.location.replace("http://localhost:3000/dashboard");
          break;
        default:
          break;
      }
    };
  }, []);
// toda vez que o usuario acessar nosso app pela primerira vez deve carregar a informação do usuario novamente 
  useEffect(() => {
    // buscar token,  fazer uma requisição para o backend(para a api de autenticação) e guardar as info do usuario  que eu buscar de dentro dessa api 
    // se algum dado da api mudar a melhor maneira de fazer é  recarregar as info do usuario sempre que ele recaregar a pagina, assim vai garantir que os dados mudados sejam atualizados sempre que ele acessar a aplicação

    // retorna os cookies salvos
    // se o errros for de tojen inspirado quem vai interceptar é o arquivo api.ts(interceptos)
    const { "nextauth.token": token } = parseCookies();
// adicionar o cabeçalho de autenticação para todas as requisições
    if (token) {
      // preencher user que tem no estado com as info que vem da resposta da requisição
      // obs: se essa chamada falhar significa que o token que a pessoa tem aqui em cima nao é um token valido
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        // obs: so vai cair no catch se acontecer um erro na rota acima e nao for de refreshtoken
        .catch(() => {
          // desloga e redireciona para a home
          signOut();
        });
    }
  }, []);

  // tem que ser assyncrona para validar que é uma promisse
  async function signIn({ email, password }: SignInCredentials) {
    try {
      // chamada de autenticação
      // criar algo na rota session passando os valores
      const response = await api.post("sessions", {
        email, 
        password,
      });
      // armazenar a info do token dentro do app para poder ter mesmo que o usuario sai da aplicação e volte e utilizar esse tokenpara as proximas requisições para poder enviar esse token junto e as proximas requisições verificar se o usuario esta logado no nosso app 
      console.log(response.data) 
// resposta da requisição enviada pela rota do backend end
// manter token, refreshToken mesmo se ele atualiza a pagina
      const { token, refreshToken, permissions, roles } = response.data;
// nome do cookie e o valor dele
      setCookie("nextauth.token", token
      // , {
      // maxAge: 24 * 60 * 60 * -> quanto tempo que quero armazenar esse cookie no meu navegador
      // path: "/" -> qualquer endereço do app vai ter acesso ao cookie
      // }
      );
// nome do cookie e o valor dele
// armazenar token de atutenticação sempre que o usuarios faz login dentro do cookies
      setCookie("nextauth.refreshToken", refreshToken);
// salvar o usuario com os dados recebido pela requisição
      setUser({
        email,
        permissions,
        roles,
      });
// quando eu fizer o login eu devo atualizar o header de autorização que ta dentro de api.ts
// app funcionar ate o token expirar
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
// redirecionar usuario para oura pagina
      Router.push("/dashboard");
      authChannel.postMessage("signIn");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
