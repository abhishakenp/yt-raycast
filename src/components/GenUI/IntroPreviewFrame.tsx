import styles from './IntroLoader.module.css'

export function IntroPreviewFrame() {
  return (
    <div className={styles.previewRiser}>
      <div className={styles.previewShell}>
        <div className={styles.previewTopbar} />
        <div className={styles.previewBody}>
          <div className={styles.previewSidebar}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.previewMain}>
            <div className={styles.previewHero}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.previewGrid}>
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
