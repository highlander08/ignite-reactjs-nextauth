import axios, { AxiosError } from "axios";
import { Router } from "next/router";
import { parseCookies } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { setCookie } from "../utils/setCookie";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
// todas as requisições que deram falha por causa do token inspirado 
let failedRequestQueue = [] as Array<any>;

export function setupApiClient(ctx = undefined) {
  // busca todos os cookies
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
// adicionar o cabeçalho de autenticação para todas as requisições
// passar o token de autenticação que esta salvo la nos cookies
    headers: {
      // ao buscar o cookie token é preenchido dentro do cabeçalho
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });
// sempre que o token expirar ele gera um novo token atraves de uma chamada no backend
// esperar uma resposta do backend para entao fazer a regra de negocio
  api.interceptors.response.use(
    // se a resposta der sucesso nao faça nada
    (response) => response,
    // mas se der, logo der um refresh token
    (error: AxiosError) => {
      // 401 pode ser retornado mesmo quando o token.expired nao retornar
      if (error.response?.status === 401) {
        // se o 401 disparar mas o tipo de error nao for do tipo token.expired eu quero deslogar o usuario
        if (error.response.data.code === "token.expired") {
          // renovar token
          // recuperar o token que o usuario tem no momento
          // token atualizado quando essa condição for executada
          // if-> se receber o token invalido vou atualizar o token com api.post('refresh')
          cookies = parseCookies(ctx);
// buscar o refresh token
          const { "nextauth.refreshToken": refreshToken } = cookies;
          // é toda configuração da requisição que eu fiz para o backend, dentro desse config vai ter todas as informações que eu preciso para repetir uma requisição para o meu backend. ex: qual rota eu chamei, quais parametros eu enviei, callbacks(o que deveria acontecer apos a requisição ser feita)
          const originalConfig = error.config;

          
// quandoo interceptors detectar queo token esta expirado ele vai pausar todas as requisiçoes que estao sendo feitas ao mesmo tempo e todas as requisiçoes que vierem no furuto ate o token esta realmente esta atualizado e depois vai pegar as requisiçoes que nao foram feitas por que o token nao foi atualizado vai executar elas de novo com o token atualizado e agente nao muda nada na aplicação
// criar uma fila de requisição, essa fila de requisição vai armazenar todas as requisiçoes que foram feitas para o nosso backend enquanto o token esta sendo atualizado(recebendo um refresh) e quando esse token finalizar a atualização agente refaz as requisição da fila com as novas informação do token
          if (!isRefreshing) {
            isRefreshing = true;

            // quando eu detectar que o token esta inspirado, todas as outras requisiçoes que acontecerem eu quero que elas esperem o token ser atualizado para entao elas acontecerem
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                // pegar o novo token
                const { token } = response.data;

                // salvar ele nos cookies
                setCookie("nextauth.token", token, ctx);
                setCookie(
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  ctx
                );
// atualizar o token que esta sendo enviado nas requisições na api
                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                // vou na lista de requisições e para cada uma dela, vou executar o metodo onSuccess passando o token atualizado
                  request.onSuccess(token)
                );
                // depois limpa a lista
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];
// executar somente se eu estiver pelo lado do cliente/browser
// informa se esta sendo executa no lado do browser ou lado do servidor comé um tru ou false
                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
// unico caso pra tornar a função assyncrona usando axios é retornando dentro dele uma promisse ai ele aguarda a promisse finalizar para tudo funcionar
          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                // retentar a requisição de token atualizado
                // trocar o Authorization pelo novo token que to recebendo em paramentro
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                // função executa caso o refreshtoken tenha dado certo 
// o que vai acontecer quando o token tiver finalizado de ser atualizado(processo de refresh tiver finalizado)
// executa a chamada api novamente -originalConfig-todas as informaçoes que eu preciso pra fazer uma chamada de novo-
// obs: esta dentro do resolve por que é a unica forma do axios aguardar isso ser feito para entao ele ser chamado
                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                // o que acontece caso o processo de refreshToken tenha dado errado
                reject(err);
              },
            });
          });
        } else {
// quando agente quer fazer um tipo de redirecionamento do lado do servidor eu nao posso utilizar o Router.push
// quando der um erro no axios como vou avisar a função que ta no withssrauth que aconteceu um erro pra entao eu fazer esse logou do usuario:
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
// deixar o erro do axios continuar acontecendo para que a propria chamada da api trate esse erro dentro dos catch que ela tem aqui no final
      return Promise.reject(error);
    }
  );

  return api;
}

// varias tratativas no processo de refreshToken toke para deslogar o usuario caso qualquer tipo de erro aconteça nesses processos