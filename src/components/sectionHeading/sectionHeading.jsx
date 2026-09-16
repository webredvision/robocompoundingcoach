import styles from "./SectionHeading.module.css";
export default function SectionHeading({ title, heading, variant = "light", align = "center" }) {
    return (
        <div className={`${align === "start" ? "text-start" : "text-center"}`}>
            <h3
                className={`text-anime-style-2 ${variant === "dark" ? styles.headingDark : styles.headingLight}`}
            >
                {heading}
            </h3>
            <h3
                className={`text-anime-style-1 ${variant === "dark" ? styles.titleDark : styles.titleLight}`}
            >
                {title}
            </h3>
        </div>
    );
}