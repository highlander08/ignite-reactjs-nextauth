// serve para decodificar um token e pegar o conteudo dele
import decode from "jwt-decode";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

// tipo para a opção de acessar pagina de metricas funcionar
type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};
// nao mostra componentes se nao passar pela validação
export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
// tipo para a opção de acessar pagina de metricas funcionar
  options?: WithSSRAuthOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies["nextauth.token"];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
// esssa validação so vai acontecer se o options nao for undefined(se o usuario envio alguma opção para ser validada)
    if (options) {
      // quando eu faço o decode ele nao sabe qual o tipo de informações que ta sendo armazenada no token, mas vou forçar o tipo com <{ permissions: string[]; roles: string[] }>
      const user = decode<{ permissions: string[]; roles: string[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: "/dashboard",
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      // so faço redirect se for um tipo de erro especifico
      if (err instanceof AuthTokenError) {
      // caso tenha um erro no token, eu direciono para a home e apago os cookie 

        destroyCookie(undefined, "nextauth.token", { path: "/" });
        destroyCookie(undefined, "nextauth.refreshToken", { path: "/" });

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}