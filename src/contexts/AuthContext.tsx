//  arquivo que tem todas as informaçãos  de autenticação
import Router from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { setCookie } from "../utils/setCookie";
// formato do usuário o backend
type User = {
  email: string;
  permissions: string[];
  roles: string[];
};
// formato de autenticação do usuario
type SignInCredentials = {
  email: string;
  password: string;
};
// formato das informaçõs do usuario
type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};
// definir formato para recebe elementos filhos
type AuthProviderProps = {
  children: ReactNode;
};

// definição do contexto
export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  // deletar o token
  destroyCookie(undefined, "nextauth.token", { path: "/" });
  // deletar o Refreshtoken
  destroyCookie(undefined, "nextauth.refreshToken", { path: "/" });
  // deslogar outra pagina que estaja logada
  authChannel.postMessage("signOut");
  // enviar para rota raiz
  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  // armazenar os dados do usuario
  const [user, setUser] = useState<User>();
  // se estiver vazio vai retornar false se nao vai retorna true
  const isAuthenticated = !!user;

  useEffect(() => {
// usuario sai do app, se uma outra aba estiver logada, sera redirecionada
    authChannel = new BroadcastChannel("auth");
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
  useEffect(() => {
// buscar todos que estao salvos
    const { "nextauth.token": token } = parseCookies();
    if (token) {
      // preencher user com as info que vem da resposta da requisição
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          // se essa chamada falhar significa que o token é invalido
          // deslogar usuario
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      // fazer autenticação
      const response = await api.post("sessions", {
        email,
        password,
      });

      // pegar os dados criados na rota acima
      const { token, refreshToken, permissions, roles } = response.data;
      // salvar a informação do token na nossa pagina
      setCookie("nextauth.token", token
      // {
      // maxAge: 24 * 60 * 60 * -> tempo de expiração 
      // path: "/" -> significa que qualquer endereço do app vai ter acesso ao cookie
      // }
      );
      // salvar a informação do Refreshtoken na nossa pagina
      setCookie("nextauth.refreshToken", refreshToken);
      // salvar o usuario
      setUser({
        email,
        permissions,
        roles,
      });

      // atualizar o header de autorização 
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      // redirecionar usuario 
      Router.push("/dashboard");
      authChannel.postMessage("signIn");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    // passar valores para ser acesso por toda a aplicação
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

// adicionar o cabeçalho de autenticação para todas as requisições
// metodo de autenticação 
// vou colocar dentro do contexto(compartilhar para todo o app) por que mais de uma pagina na aplicação pode precisar fazer a autenticação do usuario || pode ser que voce possa ter um formulario em outra parte do app || ou alguma outra ação do app faça com que o seu usuario se autentique dentro da aplicação
// as AuthContextData -> usado para quando chamar ocontext dentro dos componentes tenha a intelisense do editor par entender quais info eu posso pegar dentro do contexto

    //  1 buscar token,  2 fazer uma requisição para o backend(para a api de autenticação) e  3 guardar as info do usuario  que eu buscar de dentro dessa api 
    // se algum dado da api mudar a melhor maneira de fazer é  recarregar as info do usuario sempre que ele recaregar a pagina, assim vai garantir que os dados mudados sejam atualizados sempre que ele acessar a aplicação

    // retorna os cookies salvos
    // se o errros for de tojen inspirado quem vai interceptar é o arquivo api.ts(interceptos)

     // armazenar a info do token dentro do app para poder ter mesmo que o usuario sai da aplicação e volte e utilizar esse tokenpara as proximas requisições para poder enviar esse token junto e as proximas requisições verificar se o usuario esta logado no nosso app 

      // manter token, refreshToken mesmo se ele atualiza a pagina
// nome do cookie e o valor dele