"use client";
import React, { useState } from "react";
import styles from './signup.module.css'
import { useRouter } from 'next/navigation'
import { signIn } from "next-auth/react";


export default function SignUp(){
    const router = useRouter();
    const [FormData, setFormData] = useState({name: "", email: "", password: ""});
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    function handleInput(e){
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    }

    async function handleSubmit(e){
        e.preventDefault();
        if(!FormData.name || !FormData.email || !FormData.password){
            setError("Please Provide all Required details");
        }
        try{
            setPending(true);
            const res = await fetch("api/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(FormData)
            }
            )
            if(res.ok){
                setPending(false);
                console.log("logged in");
                signIn('credentials', {
                    email: FormData.email,
                    password: FormData.password,
                    redirect: false
                }).then((callback) =>{
                    if(callback?.ok){
                        router.push('/')
                    }
                    if(callback?.error){
                        setError("Can't Login");
                    }
                })

            }
            else{
                console.log("something went wrong");
                setPending(false);
            }
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
            <div className={styles.main_content}>
                <div className={styles.form_container}>
                    <form action="/register" method="post" className={styles.form_class} onSubmit={handleSubmit}>
                        <h1>Sign Up</h1>
                        <input type="text" name="name" placeholder="Your Name" className={styles.input_class} required onChange={(e) => handleInput(e)}/>
                        <input type="email" name="email" placeholder="Your Email"  className={styles.input_class}required autoComplete="email" onChange={(e) => handleInput(e)}/>
                        <input type="password" name="password" placeholder="Password" id="pass1" className={styles.input_class} required autoComplete="new-password" onChange={(e) => handleInput(e)}/>
                        <input type="password" name="password-repeat" placeholder="Repeat Your Password" id="pass2" className={styles.input_class} required autoComplete="new-password" onChange={(e) => handleInput(e)}/>
                        {error && <div id="error">{error}</div>}
                        <div className={styles.terms_conditions}>
                            <input type="checkbox" name="" id="terms_conditions_input" className={styles.input_class} required />
                            <label htmlFor="terms_conditions_input">I agree all statements in <a href="">Terms of service</a></label>
                        </div>
                        <button type="submit" name="submit" id="submit" disabled={pending? true: false}>{pending ? "Registering": "Register"}</button>
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