import React from "react";
import Navbar from "../components/Navbar/Navbar";
import styles from "./page.module.css";

export default function course() {
    return (
        <div>
            <Navbar />
            <div className={styles.container}>
                <input type="text" className={styles.searchbar} placeholder="Search Course Name.."></input>
                <button className={styles.searchbutton}>Search</button>
            </div>

            <div className={styles.coursecont}> 
               <div className={styles.coursebar}>
                    <button className={styles.course}>Perfomance Modelling in Computer systems</button>
                    <button className={styles.course}>Course Name</button>
                    <button className={styles.course}>Course Name</button>
                    <button className={styles.course}>Course Name</button>
                </div>
                <div className={styles.coursebar}>
                    <button className={styles.course}>Course Name</button>
                    <button className={styles.course}>Course Name</button>
                    <button className={styles.course}>Course Name</button>
                    <button className={styles.course}>Course Name</button>
                </div>
            </div>
        </div>
    );
}
