import { setupApiClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";
// serve para decodificar um token e pegar o conteudo dele
// import decode from 'jwt-decode'
// usuario so vai ver pagina se ele tiver permission
export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupApiClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  // quais permissoes eu quero verificar que o usuario tem para poder acessar a tela e pode receber role tb
  {
    permissions: ["metrics.list2"],
    roles: ["administrator"],
  }
);
// so tenho acesso ao token do usuario, so o token me traz informações sobre o usuario
// mas dentro do payload tenho as permissions e roles do usuario