import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../contexts/AuthContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // todo dado que tiver dentro do provider o app vai ter acesso 
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
export default MyApp;
