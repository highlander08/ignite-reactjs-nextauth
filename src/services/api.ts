import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { setCookie } from "../utils/setCookie";

let isRefreshing = false;
let failedRequestQueue = [] as Array<any>;

export function setupApiClient(ctx: GetServerSidePropsContext) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data.code === "token.expired") {
          cookies = parseCookies(ctx);

          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;
            console.log("refresh");
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie("nextauth.token", token, ctx);
                setCookie(
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  ctx
                );

                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token)
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
