import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function Can({ children, permissions, roles }: CanProps) {
  // reaproveitamento do hook e deixar a variavel bem explicita pra poder entender o que ela faz
  const userCanSeeComponent = useCan({
    permissions,
    roles,
  });

  if (!userCanSeeComponent) {
    return null;
  }

  return <>{children}</>;
}
