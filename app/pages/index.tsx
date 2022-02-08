import dynamic from 'next/dynamic';
import Head from 'next/head';

import Fork from '../components/fork';
import Footer from '../components/footer';
import Recognition from '../components/recognition';

// Dynamically import component so that server-side rendering is never used
// to avoid having issues with OpenVidu client
const BroadcastContainer = dynamic(() => import('../components/broadcast'), { ssr: false });

export default function Home() {
  return (
    <div>
      <Head>
        <title>Facial recognition demo</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css" />
      </Head>

      <Fork />

      <section className="py-5">
        <BroadcastContainer />
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
