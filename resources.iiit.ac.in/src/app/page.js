import Image from 'next/image'
import styles from './page.module.css'

export default function Home({ searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
          Happy Coding...
      </div>
    </div>
  )
}
