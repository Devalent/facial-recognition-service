import dynamic from 'next/dynamic';
import Head from 'next/head';

import styles from '../styles/Home.module.scss';

const BroacastContainer = dynamic(() => import('../components/broadcast'), { ssr: false });

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Video Client</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <BroacastContainer />
      </main>
    </div>
  )
}
