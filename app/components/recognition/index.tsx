import classNames from 'classnames';
import { useState } from 'react';

import { useAppSelector } from '../../store';

import styles from './recognition.module.scss';

export default function Recognition() {
  const items = useAppSelector(s => s.recognition.matches);
  const threshold = useAppSelector(s => s.recognition.threshold);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const selectPerson = (personId:number) => {
    if (personId === selectedPerson) {
      setSelectedPerson(null);
    } else {
      setSelectedPerson(personId);
    }
  };

  const similarity = Math.round((1 - threshold) * 100);

  return (
    <div className="container px-4 px-lg-5 mt-5">
      <h2 className="fw-bolder mb-4">Recognition results</h2>
      <div className="col-md-6">
        <p className="lead">The application receives face data from the backend and compares it to the previously received faces. If a similarity of at least {similarity}% is detected, a face is considered to belong to the same person.</p>
        <p>Click on a photo to highlight all faces of a particular person.</p>
      </div>
      <div className="row gx-3 gx-lg-4 row-cols-2 row-cols-md-4 row-cols-xl-6">
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
                  { item.similarity
                    ? <div className="badge text-white position-absolute" style={{ bottom: '0.5rem', left: '0.5rem', backgroundColor: item.color }}>Similarity: {item.similarity}%</div>
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
