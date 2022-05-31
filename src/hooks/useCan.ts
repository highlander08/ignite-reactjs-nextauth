import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

// tipando as informaçoes
type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};
// verificar se os usuario tem tais permissions ou tais roles
export function useCan({ permissions, roles }: UseCanParams) {
  // importar dados contexto
  const { user, isAuthenticated } = useContext(AuthContext);
// se o usuario nao estiver autenticado eu retorno que ele nao tem permission
  if (!isAuthenticated) return false;

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });
  return userHasValidPermissions;
}


// returnar se o usuario pode ou nao pode fazer algo
