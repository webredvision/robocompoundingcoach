import RiskProfiledata from "@/components/Riskprofile/risqprofile";
const RiskProfile = async () => {
    const roboUser = {
        roboUser: true,
        arnId: process.env.ARNID,
        arnNumber: process.env.ARN_NUMBER,
        deskType: process.env.DESK_TYPE,
        SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        CALLBACK_URL: process.env.CALLBACK_URL,
    }
    return (
        <div className="pt-20">
            <RiskProfiledata roboUser={roboUser} />
        </div>
    );
};

export default RiskProfile;
