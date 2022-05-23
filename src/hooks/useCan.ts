import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";
// returnar se o usuario pode ou nao pode fazer algo

// tipando as informaçoes
type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};
// verificar se os usuario tem tais permissions ou tais roles
export function useCan({ permissions, roles }: UseCanParams) {
  // importar dados do usuarios e se o usuario esta autenticado
  const { user, isAuthenticated } = useContext(AuthContext);
// se o usuario nao estiver autenticado eu retorno que ele nao tem permission
  if (!isAuthenticated) return false;

  // chama metodo pasando os parametros
  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });
// so retorna se todas as condição que eu colocar dentro da função seja true
  return userHasValidPermissions;
}
