// usar essa função em paginas que eu quero que ela so possa ser acessadas por visitantes, ou seja pessoas que nao estao logadas
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";
// receber o tipo aqui <{user: string[]}> = <P> e repassar para dentro do withSSRGuest e usar o <P> no GetServerSideProps tambem
export function withSSRGuest<P>(fn: GetServerSideProps<P>) {
  // retorna de dentro dessa função outra função high-oder-function
  return async (
    ctx: GetServerSidePropsContext
    // retorno dela tem que ser uma promisse do tipo GetServerSidePropsResult(obrigatorio receber uma tipagem que é qual que é o tipo da propriedade que eu vou desenvolver aqui dentro) para entender qual o tipo de retorno
    // repassar para dentro do GetServerSidePropsResult o tipo aqui <{user: string[]}>
  ): Promise<GetServerSidePropsResult<P>> => {
    // verificar se existir o cookies
    // se tiver redireciona para o dashboard
    const cookies = parseCookies(ctx);

    if (cookies["nextauth.token"]) {
      return {
        // entender qual o tipo de retorno
        // ver os tipos por causa do <P> do typescript
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }
// se nao tiver retorna a função original com o contexto que eu recebi como parametro
    return await fn(ctx);
  };
}


