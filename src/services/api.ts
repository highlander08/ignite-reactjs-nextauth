import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { setCookie } from "../utils/setCookie";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
// forçcando o tipo do array 
let failedRequestQueue = [] as Array<any>;

export function setupApiClient(ctx = undefined) {
  // busca todos os cookies
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
// adicionar o cabeçalho de autenticação para todas as requisições
// passar o token de autenticação que esta salvo nos cookies
    headers: {
      //preenchido token para o cabeçalho
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });

// response = espera uma resposta do backend para entao fazer a regra de negocio
  api.interceptors.response.use(
    // se a resposta der sucesso nao faça nada
    (response) => response,
    // mas se der, use o refresh token
    (error: AxiosError) => {
      // 401 pode ser retornado mesmo quando o token.expired nao retornar
      if (error.response?.status === 401) {
        // se o 401 disparar mas o tipo de error nao for do tipo token.expired eu quero deslogar o usuario
        if (error.response.data.code === "token.expired") {
          // manter token atualizado quando essa condição for executada
          cookies = parseCookies(ctx);
          // buscar o refresh token
          const { "nextauth.refreshToken": refreshToken } = cookies;
          // dentro desse config vai ter todas as informações que eu preciso para repetir uma requisição para o meu backend
          const originalConfig = error.config;



          // se nao estiver fazendo o refreshtoken
          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                // pegar o novo token
                const { token } = response.data;

                // salvar novo token 
                setCookie("nextauth.token", token, ctx);
                // salvar novo Refreshtoken 
                setCookie(
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  ctx
                );
                // atualizar o token
                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                // vou na lista de requisições e para cada uma dela, vou executar o metodo onSuccess passando o token atualizado
                  request.onSuccess(token)
                );
                // limpar lista
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];
              // executar somente se eu estiver pelo lado do cliente
                if (process.browser) {
                  signOut();
                }
              })
              // indepedente de entra no try ou no catch executa o finally
              .finally(() => {
                isRefreshing = false;
              });
          }
          // no axios pra tornar a função assyncrona é retornando uma promisse
          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                // trocar o Authorization/header  pelo novo token
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                // função executa caso o refreshtoken tenha dado certo 
                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                // caso tenha erro retorne err
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
// deixar o erro do axios continuar acontecendo para que a propria chamada da api trate esse erro dentro dos catch
      return Promise.reject(error);
    }
  );

  return api;
}
// quando agente quer fazer um tipo de redirecionamento do lado do servidor eu nao posso utilizar o Router.push
// quando der um erro no axios como vou avisar a função que ta no withssrauth que aconteceu um erro pra entao eu fazer esse logou do usuario:
// varias tratativas no processo de refreshToken toke para deslogar o usuario caso qualquer tipo de erro aconteça nesses processos

// sempre que o token expirar ele gera um novo token atraves de uma chamada no backend
 // renovar token
          // recuperar o token que o usuario tem no momento
          // if-> se receber o token invalido vou atualizar o token com api.post('refresh')
          // é toda configuração da requisição que eu fiz para o backend, 
          // dentro desse config vai ter todas as informações que eu preciso para repetir uma requisição para o meu backend. ex: qual rota eu chamei, quais parametros eu enviei, callbacks(o que deveria acontecer apos a requisição ser feita)
          // quando o interceptors detectar que o token esta expirado ele vai pausar todas as requisiçoes que estao sendo feitas ao mesmo tempo e todas as requisiçoes que vierem no furuto ate o token esta realmente esta atualizado e depois vai pegar as requisiçoes que nao foram feitas por que o token nao foi atualizado vai executar elas de novo com o token atualizado e agente nao muda nada na aplicação
// criar uma fila de requisição, essa fila de requisição vai armazenar todas as requisiçoes que foram feitas para o nosso backend enquanto o token esta sendo atualizado(recebendo um refresh) e quando esse token finalizar a atualização agente refaz as requisição da fila com as novas informação do token
 // quando eu detectar que o token esta inspirado, todas as outras requisiçoes que acontecerem eu quero que elas esperem o token ser atualizado para entao elas acontecerem
 // o que vai acontecer quando o token tiver finalizado de ser atualizado(processo de refresh tiver finalizado)
// executa a chamada api novamente -originalConfig-todas as informaçoes que eu preciso pra fazer uma chamada de novo-
// obs: esta dentro do resolve por que é a unica forma do axios aguardar isso ser feito para entao ele ser chamado