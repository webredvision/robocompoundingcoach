import React from 'react';
import Link from 'next/link';
import styles from '../navbar/Navbar.module.css';

const RoundedButton = ({ label = "Click Me", href = "#", className = "" }) => {
  return (
    <div className="">
      <Link href={href}>
        <button className={`btn ${styles['btn-primary']} ${className}`}>
          {label}
        </button>
      </Link>
    </div>
  );
};

export default RoundedButton;
