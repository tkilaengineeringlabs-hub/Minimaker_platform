import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { useSupabaseBootstrap } from "~/hooks/useSupabaseBootstrap";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  useSupabaseBootstrap();

  return (
    <>
      <Head>
        <title>Mini Maker Labs</title>
        <meta
          name="description"
          content="Plataforma educativa de electrónica, robótica y proyectos Maker para niñas y niños."
        />
        <link rel="icon" href="/faciconm.ico" />
        <meta name="theme-color" content="#0A0" />
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
