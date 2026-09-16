"use client";
import styles from "./LoaderCircle.module.css";

const LoaderCircle = ({ loadingText }) => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderCircle}></div>
      <p className={styles.loaderText}>{loadingText}</p>
    </div>
  );
};

export default LoaderCircle;
