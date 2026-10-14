import type { GetServerSideProps, NextPage } from "next";

const SettingsRedirect: NextPage = () => null;

export const getServerSideProps: GetServerSideProps = () =>
  Promise.resolve({
    redirect: {
      destination: "/settings/account",
      permanent: false,
    },
  });

export default SettingsRedirect;
