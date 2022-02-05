import dynamic from 'next/dynamic';
import Head from 'next/head';

import Fork from '../components/fork';
import Logo from '../components/logo';
import Noise from '../components/noise';

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
          <div className="container px-4 px-lg-5 my-5">
              <div className="row gx-4 gx-lg-5 align-items-center">
                  <div className="col-md-6">
                    <Noise />  
                  </div>
                  <div className="col-md-6">
                      <h1 className="display-5 fw-bolder">Facial recognition demo</h1>
                      <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium at dolorem quidem modi. Nam sequi consequatur obcaecati excepturi alias magni, accusamus eius blanditiis delectus ipsam minima ea iste laborum vero?</p>
                      <div className="d-flex">
                          <BroacastComponent />
                      </div>
                  </div>
              </div>
          </div>
      </section>
      
      <section className="py-5 bg-light">
          <div className="container px-4 px-lg-5 mt-5">
              <h2 className="fw-bolder mb-4">Recognition results</h2>
              <div className="col-md-6">
                <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium at dolorem quidem modi. Nam sequi consequatur obcaecati excepturi alias magni, accusamus eius blanditiis delectus ipsam minima ea iste laborum vero?</p>
                <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium at dolorem quidem modi. Nam sequi consequatur obcaecati excepturi alias magni, accusamus eius blanditiis delectus ipsam minima ea iste laborum vero?</p>
              </div>
              {/* <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                  <div className="col mb-5">
                      <div className="card h-100">
                          
                          <img className="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
                          
                          <div className="card-body p-4">
                              <div className="text-center">
                                  
                                  <h5 className="fw-bolder">Fancy Product</h5>
                                  
                                  $40.00 - $80.00
                              </div>
                          </div>
                          
                          <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                              <div className="text-center"><a className="btn btn-outline-dark mt-auto" href="#">View options</a></div>
                          </div>
                      </div>
                  </div>
                  <div className="col mb-5">
                      <div className="card h-100">
                          
                          <div className="badge bg-dark text-white position-absolute" style={{top: '0.5rem', right: '0.5rem'}}>Sale</div>
                          
                          <img className="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
                          
                          <div className="card-body p-4">
                              <div className="text-center">
                                  
                                  <h5 className="fw-bolder">Special Item</h5>
                                  
                                  <div className="d-flex justify-content-center small text-warning mb-2">
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                  </div>
                                  
                                  <span className="text-muted text-decoration-line-through">$20.00</span>
                                  $18.00
                              </div>
                          </div>
                          
                          <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                              <div className="text-center"><a className="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
                          </div>
                      </div>
                  </div>
                  <div className="col mb-5">
                      <div className="card h-100">
                          
                          <div className="badge bg-dark text-white position-absolute" style={{top: '0.5rem', right: '0.5rem'}}>Sale</div>
                          
                          <img className="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
                          
                          <div className="card-body p-4">
                              <div className="text-center">
                                  
                                  <h5 className="fw-bolder">Sale Item</h5>
                                  
                                  <span className="text-muted text-decoration-line-through">$50.00</span>
                                  $25.00
                              </div>
                          </div>
                          <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                              <div className="text-center"><a className="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
                          </div>
                      </div>
                  </div>
                  <div className="col mb-5">
                      <div className="card h-100">
                          <img className="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt="..." />
                          <div className="card-body p-4">
                              <div className="text-center">
                                  <h5 className="fw-bolder">Popular Item</h5>
                                  <div className="d-flex justify-content-center small text-warning mb-2">
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                      <div className="bi-star-fill"></div>
                                  </div>
                                  $40.00
                              </div>
                          </div>
                          
                          <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                              <div className="text-center"><a className="btn btn-outline-dark mt-auto" href="#">Add to cart</a></div>
                          </div>
                      </div>
                  </div>
              </div> */}
          </div>
      </section>

      <footer className="py-5 bg-dark">
          <div className="container">
            <p className="m-0 text-center text-white">
              <Logo />
            </p>
          </div>
      </footer>
    </div>
  )
}
