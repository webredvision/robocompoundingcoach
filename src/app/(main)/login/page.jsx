import ArnPage from "./arnLogin";
import IfaPage from "./ifaLogin";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const desk = process.env.DESK_TYPE;
  const envs = {
    SITE_URL: process.env.SITE_URL,
    ARNID: process.env.ARNID,
    ARN_NUMBER: process.env.ARN_NUMBER,
    DESK_TYPE: process.env.DESK_TYPE,
    CALLBACK_URL: process.env.CALLBACK_URL,
  };
  return (
    <div className={styles.loginPage}>
      {desk === 'arn' ? <ArnPage envs={envs} /> : <IfaPage envs={envs} />}

    </div>
  );
};

export default LoginPage;