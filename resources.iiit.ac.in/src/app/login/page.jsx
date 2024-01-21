"use client";
import {React, useState} from "react";
import Link from 'next/link'
import styles from './login.module.css'
import Image from 'next/image'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { useRouter } from "next/navigation";
import { signIn } from 'next-auth/react'



export default function Login(){
    const router = useRouter();
    const [FormData, setFormData] = useState({email: "", password: ""});
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);


    function handleInput(e){
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    }

    async function handleSubmit(e){
        e.preventDefault();
        if(!FormData.email || !FormData.password){
            setError("Please Provide all Required details");
        }
        try{
            setPending(true);
            await signIn('credentials', {
                email: FormData.email,
                password: FormData.password,
                redirect: false
            }).then((callback) =>{
                console.log(callback)
                if(callback?.ok){
                    setPending(false);
                    router.push('/')
                }
                if(callback?.error){
                    setPending(false);
                    setError(error);
                }
            })
        }
        catch(error){
            setPending(false);
            setError("Can't handle the Request")
        }
    }
    
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
                    <form action="" method="post" className={styles.form_class} onSubmit={handleSubmit}>
                        <h1>Log In</h1>
                        <input type="email" name="email" placeholder="Your Email" required className={styles.input_class} onChange={(e) => handleInput(e)}/>
                        <input type="password" name="password" placeholder="Password" required className={styles.input_class} onChange={(e) => handleInput(e)}/>
                        <div className={styles.terms_conditions}>
                            <input type="checkbox" name="" id="terms_conditions_input" required/>
                            <label htmlFor="terms_conditions_input">Remember Me</label>
                        </div>
                        <button type="submit" name="submit" disabled={pending? true: false}>{pending? "Loging" : "Login"}</button>
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
                    {error && <div id="error">{error}</div>}
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