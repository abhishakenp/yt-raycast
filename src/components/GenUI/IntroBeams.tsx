import styles from './IntroLoader.module.css'

export function IntroBeams() {
  return (
    <div className={styles.beams}>
      <span className={styles.beam} />
      <span className={styles.beam} />
      <span className={styles.beam} />
    </div>
  )
}
