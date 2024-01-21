"use client";
import React from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function course() {
    const router = useRouter();
    const {data, status} = useSession();
    if(status === "unauthenticated"){
        router.replace('/login')
    }
    return (
        <div>
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
