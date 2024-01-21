import React from "react";
import Link from 'next/link'
import styles from './login.module.css'
import Image from 'next/image'
import 'bootstrap-icons/font/bootstrap-icons.css'


export default function Login(){
    return(
        <>
        <div className={styles.container}>
            <div className={styles.inner_container}>
                <div className={styles.image_container}>
                    <Image src="/images/signin-image.jpg" alt="Register" width={250} height={250} />
                    <div className={styles.login_container_img}>
                        <p>Don't have an account? <Link className={styles.links} href="/signup">Register</Link></p>
                    </div>
                </div>
                <div className={styles.main_content}>
                <div className={styles.form_container}>
                    <form action="" method="post" className={styles.form_class}>
                        <h1>Log In</h1>
                        <input type="email" name="email" placeholder="Your Email" required className={styles.input_class}/>
                        <input type="password" name="password" placeholder="Password" required className={styles.input_class}/>
                        <div className={styles.terms_conditions}>
                            <input type="checkbox" name="" id="terms_conditions_input" />
                            <label for="terms_conditions_input">Remember Me</label>
                        </div>
                        <button type="submit" name="submit">Login</button>
                    </form>
                    <h2>OR</h2>
                    <div className={styles.social_media}>
                        login with <br />
                        <Link className={styles.links} href="">
                            <i className="bi bi-google"  aria-details="Google"></i>
                        </Link>
                        <Link className={styles.links} href="">
                            <i className="bi bi-facebook" aria-details="Facebook"></i>
                        </Link>
                        <Link className={styles.links} href="">
                            <i className="bi bi-twitter" aria-details="Twitter"></i>
                        </Link>
                    </div>
                </div>
                <div className={styles.login_container}>
                    <p>Don't have an account? <Link href="/signup">Register</Link></p>
                </div>
            </div>
        </div>
    </div>
    </>
    )
}