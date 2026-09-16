import RegistrationComponent from "@/components/robo/registration/registrationcomponent";
export default async function Page({ children }) {
  const envs = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ARNID: process.env.ARNID,
    ARN_NUMBER: process.env.ARN_NUMBER,
    DESK_TYPE: process.env.DESK_TYPE,
    SITE_URL: process.env.SITE_URL,
    CALLBACK_URL: process.env.CALLBACK_URL,
  };
  return (
    <div className="mt-10">
      <RegistrationComponent envs={envs} />
    </div>
  );
}
