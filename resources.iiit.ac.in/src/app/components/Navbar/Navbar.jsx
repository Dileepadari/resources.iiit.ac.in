"use client"
import { useSession, signOut } from 'next-auth/react';
import styles from './navbar.module.css'
import Link from 'next/link'

const Navbar = ({user}) => {
    const {data, status} = useSession();
    console.log(status)
    return (
        <div className={styles.container}>
            <Link className={styles.logo} href="/">IIIT&nbsp;Hyderabad</Link>
            <div className={styles.links}>
                <Link className = {styles.eachlink} href="/">Home</Link>
                <Link className = {styles.eachlink} href="/course">Courses</Link>
                <Link className = {styles.eachlink} href="/about">About</Link>
                {status === "authenticated" ?
                <div className = {styles.eachlink} onClick={() => signOut()}>logout</div>
                :
                <Link className = {styles.eachlink} href="/login">login</Link>}
            </div>
        </div>
    )
}

export default Navbar;