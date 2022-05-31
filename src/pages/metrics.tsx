import { setupApiClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";
// serve para decodificar um token e pegar o conteudo dele
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

  {
// usuario so vai ver pagina se ele tiver essas permission 
    permissions: ["metrics.list2"],
    roles: ["administrator"],
  }
);
// so tenho acesso ao token do usuario, so o token me traz informações sobre o usuario
// mas dentro do payload tenho as permissions e roles do usuario