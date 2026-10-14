import type { GetServerSideProps, NextPage } from "next";

const LoginRedirect: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = () =>
  Promise.resolve({
    redirect: {
      destination: "/?login",
      permanent: false,
    },
  });

export default LoginRedirect;
