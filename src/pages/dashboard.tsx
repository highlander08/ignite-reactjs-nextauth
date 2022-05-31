import { useContext } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { setupApiClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  // pegar dados do Context
  const { user, signOut } = useContext(AuthContext);

  // quando esse hook for executado nao enviara o token de autorização, se caso isso nao for adicionado
      // api.defaults.headers["Authorization"] = `Bearer ${token}`;
      // obs: sempre importante ter uma tratativa de erro em uma chamada api ter uma tratativa de erro
  // useEffect(() => {
  //   api
  //     .get("/me")
  //     .then((response) => console.log(response))
  //     .catch((err) => console.log(err));
  // }, []);

  return (
    <>
    {/* no primeiro momento eu nao tenho nada no 'user' por isso eu coloco que ele pode ser 'vazio'(?)*/}
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sign out</button>

    {/*  ver apenas se ele tiver permissao  */}
      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  // instanciar uma apiclient nosso http do axios ele vai ter um funcionamento diferente na parte de buscar os cookies, se eu tiver rodando no lado do cliente ou do lado do servidor
  // refresh pode acontecer nesse momento
  const apiClient = setupApiClient(ctx);
  // const response = await apiClient.get("/me");

  // console.log(response);

  return {
    props: {},
  };
});
