import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function Can({ children, permissions, roles }: CanProps) {
  // reaproveitar hook
  // obs: deixar a variavelexplicita pra poder entender o que ela faz
  const userCanSeeComponent = useCan({
    permissions,
    roles,
  });
// se nao existir retorna null
  if (!userCanSeeComponent) {
    return null;
  }
//  retorna o elemento filho
  return <>{children}</>;
}
