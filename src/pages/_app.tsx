import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { useEffect } from "react";
import { useSupabaseBootstrap } from "~/hooks/useSupabaseBootstrap";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  useSupabaseBootstrap();

  useEffect(() => {
    const savedTheme = localStorage.getItem("minimaker-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : prefersDark
        ? "dark"
        : "light";

    document.documentElement.dataset.theme = theme;
  }, []);

  return (
    <>
      <Head>
        <title>Mini Maker Labs</title>
        <meta
          name="description"
          content="Plataforma educativa de electrónica, robótica y proyectos Maker para niñas y niños."
        />
        <link rel="icon" href="/faciconm.ico" />
        <meta name="theme-color" content="#08d9d6" />
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
