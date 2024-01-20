import styles from './navbar.module.css'
import Link from 'next/link'

const Navbar = () => {
    return (
        <div className={styles.container}>
            <Link className={styles.logo} href="/">IIIT&nbsp;Hyderabad</Link>
            <div className={styles.links}>
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
            </div>
        </div>
    )
}

export default Navbar;