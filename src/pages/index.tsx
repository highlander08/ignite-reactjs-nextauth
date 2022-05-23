import Head from "next/head";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";
import { withSSRGuest } from "../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
// buscar dados do contexto
  const { signIn } = useContext(AuthContext);

  
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };
// função é uma promisse por isso usa async await 
    await signIn(data);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Next Auth</title>
        <link rel="icon" href="./favicon.ico" />
      </Head>

      <form onSubmit={handleSubmit} className={styles.container}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar </button>
      </form>
    </div>
  );
}
// metodo que faz ser executado pelo lado do servidor, quando o usuario acessar essa pagina
// obs:recebe como parametro uma outra função
// como eu nem sempre sei o tipo de propriedade
// ex: o retorno que eu quero ter dentro dessas props é algo do tipo como <{user: string[]}>
export const getServerSideProps = withSSRGuest<{user: string[]}>(async (ctx) => {
  // ver todos os cookies que estao armazenados na pagina
  // console.log(ctx.req.cookies)
  // const cookies = parseCookies(ctx);
// extra-> se nao existir o token eu faço um redirecionamento para uma pagina
  // if(!cookies['nextauth.token']){
  //   return {
  //     redirect: {
  //       destination: 'dashboard',
  //   permanent: false
  // }
  //   }
  // }
  return {
    props: {
      user: ['high', 'lucas']
      
    },
  };
});
// por que a função retorna uma função
// por que quando o next acessa a nossa pagina
// o next espera que meu getServerSideProps seja um função
// e como eu to chamando uma função withSSRGuest com o parametro dele sendo uma outra função, ou seja o next espera que isso  seja uma função para ele conseguir acessa quando o usuario acessa a tela