import React from "react";
import styles from './signup.module.css'


export default function SignUp(){
    return(
        <>
        <div className={styles.container}>
        <div className={styles.inner_container}>
            <div className={styles.main_content}>
                <div className={styles.form_container}>
                    <form action="/register" method="post" className={styles.form_class}>
                        <h1>Sign Up</h1>
                        <input type="text" name="name" placeholder="Your Name" className={styles.input_class} required />
                        <input type="email" name="email" placeholder="Your Email"  className={styles.input_class}required autocomplete="email" />
                        <input type="password" name="password" placeholder="Password" id="pass1" className={styles.input_class} required autocomplete="new-password" />
                        <input type="password" name="password-repeat" placeholder="Repeat Your Password" id="pass2" className={styles.input_class} required autocomplete="new-password" />
                        <div id="error"></div>
                        <div className={styles.terms_conditions}>
                            <input type="checkbox" name="" id="terms_conditions_input" className={styles.input_class} required />
                            <label for="terms_conditions_input">I agree all statements in <a href="">Terms of service</a></label>
                        </div>
                        <button type="submit" name="submit" id="submit">Register</button>
                    </form>
                </div>
                <div className={styles.login_container}>
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
            <div className={styles.image_container}>
                <img src="images/signup-image.jpg" alt="Register" />
                <div className={styles.login_container_img}>
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    </div>
    </>
    );
}