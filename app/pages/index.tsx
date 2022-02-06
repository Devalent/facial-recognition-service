import dynamic from 'next/dynamic';
import Head from 'next/head';

import Fork from '../components/fork';
import Footer from '../components/footer';
import Recognition from '../components/recognition';

import styles from '../styles/Home.module.scss';

const BroacastComponent = dynamic(() => import('../components/broadcast'), { ssr: false });

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Facial recognition demo</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>

      <Fork />

      <section className="py-5">
        <BroacastComponent />
      </section>
      
      <section className="py-5 bg-light">
        <Recognition />
      </section>

      <footer className="py-5 bg-dark">
        <Footer />
      </footer>
    </div>
  )
}
