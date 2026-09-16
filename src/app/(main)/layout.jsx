import LenisScrollProvider from "@/components/LenisScrollProvider";

export default async function Layout({ children }) {
    return (
        <div>
            <LenisScrollProvider />
            {children}
        </div>
    );
}