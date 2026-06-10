import { Edit } from 'lucide-react'

import { useEditController } from '../hooks/useEditController'
import styles from './EditPanel.module.css'

type EditPanelProps = {
  sessionId: string
}

export const EditPanel = ({ sessionId }: EditPanelProps) => {
  const { editError, edits, isEditing } = useEditController(sessionId)

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Edit className="size-4 text-cyan-200" />
        <h2 className={styles.panelTitle}>Edits</h2>
      </div>
      <div className={styles.editList}>
        {edits?.map((edit) => (
          <div className={styles.editCard} key={edit.editId}>
            <div className={styles.editHeader}>
              <p className={styles.editType}>{edit.editType}</p>
              <p className={styles.editVersion}>v{edit.previewVersion}</p>
            </div>
            {edit.targetLabel && <p className={styles.editLabel}>{edit.targetLabel}</p>}
            {edit.instruction && <p className={styles.editInstruction}>{edit.instruction}</p>}
          </div>
        ))}
        {edits?.length === 0 && (
          <p className={styles.emptyText}>No edits yet. Select text in the preview to edit.</p>
        )}
      </div>
      {editError && <p className={styles.errorText}>{editError}</p>}
      {isEditing && <p className={styles.statusText}>Applying edit...</p>}
    </div>
  )
}
