import styles from './fork.module.scss';

export default function Fork() {
  return (
    <div className={styles.container}>
      <a href="https://github.com/Devalent/facial-recognition-service">
        <img width="149" height="149" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png?resize=149%2C149" alt="Fork me on GitHub" />
      </a>
    </div>
  )
}
