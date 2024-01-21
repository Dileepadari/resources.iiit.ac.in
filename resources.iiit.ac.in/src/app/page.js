"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home({ searchParams }) {
  const router = useRouter();
  const {data, status} = useSession();
  if(status === "unauthenticated"){
      router.replace('/login')
  }
  return (
    <div className={styles.container}>
      <div className={styles.content}>
          Happy Coding...<br/>
          You are <span >{data?.user?.name}</span><br/>
          You email is <span >{data?.user?.email}</span><br/>
      </div>
    </div>
  )
}
