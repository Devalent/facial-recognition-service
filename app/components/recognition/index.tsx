import classNames from 'classnames';
import { useState } from 'react';

import { useAppSelector } from '../../store';

import styles from './recognition.module.scss';

export default function Recognition() {
  const isStandalone = useAppSelector(s => s.demo.isStandalone);
  const items = useAppSelector(s => s.recognition.matches);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const selectPerson = (personId:number) => {
    if (personId === selectedPerson) {
      setSelectedPerson(null);
    } else {
      setSelectedPerson(personId);
    }
  };

  return (
    <div className="container px-4 px-lg-5 mt-5">
      <h2 className="fw-bolder mb-4">Recognition results</h2>
      <div className="col-md-6">
        <p className="lead">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium at dolorem quidem modi. Nam sequi consequatur obcaecati excepturi alias magni, accusamus eius blanditiis delectus ipsam minima ea iste laborum vero?</p>
        { isStandalone &&
          <div className="alert alert-warning">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium at dolorem quidem modi. Nam sequi consequatur obcaecati excepturi alias magni, accusamus eius blanditiis delectus ipsam minima ea iste laborum vero?
          </div>
        }
      </div>
      <div className="row gx-3 gx-lg-4 row-cols-4 row-cols-md-5 row-cols-xl-6">
        {
          items
          .map((item) => (
            <div className="col mb-5" key={item.id}>
              <div className="card h-100">
                <div
                  className={classNames(styles.person, {
                    [styles.person_disabled]: selectedPerson && selectedPerson !== item.personId,
                  })}
                  onClick={() => selectPerson(item.personId)}
                >
                  <div className="badge text-white position-absolute" style={{ top: '0.5rem', left: '0.5rem', backgroundColor: item.color }}>{item.name}</div>
                  <div className="badge text-white position-absolute" style={{ top: '0.5rem', right: '0.5rem', backgroundColor: item.color }}>{new Date(item.created).toLocaleTimeString()}</div>
                  { item.probability
                    ? <div className="badge text-white position-absolute" style={{ bottom: '0.5rem', left: '0.5rem', backgroundColor: item.color }}>Probability: {item.probability}%</div>
                    : <div className="badge text-white bg-dark position-absolute" style={{ bottom: '0.5rem', left: '0.5rem', backgroundColor: item.color }}>First time seen</div>
                  }
                  <img className="card-img-top" src={item.image} alt="..." />
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
