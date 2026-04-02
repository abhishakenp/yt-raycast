const sessionId = location.pathname.split('/session/')[1]?.split('/')[0] ?? ''
const previewUrl = sessionId ? `${location.origin}/preview/${sessionId}/` : ''

function closeMenus(root) {
  root.querySelectorAll('.preview-tb-dropdown.is-open').forEach((d) => d.classList.remove('is-open'))
  root.querySelectorAll('.preview-tb-menu').forEach((m) => {
    m.hidden = true
  })
  root.querySelectorAll('.preview-tb-btn[aria-expanded]').forEach((b) => {
    b.setAttribute('aria-expanded', 'false')
  })
}

async function runExportZip(target) {
  const g = window.shipFastDashboardGithub
  await g.ready
  const user = g.getCurrentUser()
  if (!user) {
    alert('Sign in on the homepage to export ZIP files.')
    window.location.href = '/'
    return
  }
  const token = await user.getIdToken()
  const base = location.origin
  const targetsRes = await fetch(`${base}/api/sessions/${sessionId}/export-targets`)
  const targetsData = await targetsRes.json().catch(() => ({}))
  const entry = targetsData.targets?.find((t) => t.target === target)
  if (!entry) {
    alert('Export is not available for this session yet.')
    return
  }
  if (!entry.ready) {
    const genRes = await fetch(`${base}/api/sessions/${sessionId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ target }),
    })
    const genData = await genRes.json().catch(() => ({}))
    if (!genRes.ok) {
      alert(genData.error || 'Could not build export.')
      return
    }
  }
  const dl = await fetch(`${base}/api/sessions/${sessionId}/download/${target}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (dl.status === 401) {
    alert('Sign in to download exports.')
    window.location.href = '/'
    return
  }
  if (dl.status === 402) {
    const err = await dl.json().catch(() => ({}))
    alert(err.error || 'Subscribe or use credits to download ZIP exports.')
    return
  }
  if (!dl.ok) {
    const err = await dl.json().catch(() => ({}))
    alert(err.error || 'Download failed.')
    return
  }
  const blob = await dl.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${sessionId}-${target}.zip`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function runDeploy(target) {
  const g = window.shipFastDashboardGithub
  await g.ready
  if (!g.getCurrentUser()) {
    alert('Sign in and link GitHub to deploy.')
    window.location.href = '/'
    return
  }
  try {
    await g.pushExportToGitHub(sessionId, target)
    alert('Pushed to GitHub.')
  } catch (e) {
    alert(e?.message || 'Deploy failed.')
  }
}

function init() {
  const root = document.getElementById('preview-toolbar-actions')
  if (!root || !sessionId) return

  const g = window.shipFastDashboardGithub
  if (!g) return

  g.ready.catch(() => {
    root.remove()
  })

  const shareBtn = document.getElementById('preview-share-btn')
  const exportDrop = document.getElementById('preview-export-dropdown')
  const exportTrigger = document.getElementById('preview-export-trigger')
  const exportMenu = document.getElementById('preview-export-menu')
  const deployDrop = document.getElementById('preview-deploy-dropdown')
  const deployTrigger = document.getElementById('preview-deploy-trigger')
  const deployMenu = document.getElementById('preview-deploy-menu')

  shareBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(previewUrl)
    } catch {
      prompt('Copy preview link:', previewUrl)
      return
    }
    const prev = shareBtn.textContent
    shareBtn.textContent = 'Copied'
    setTimeout(() => {
      shareBtn.textContent = prev
    }, 1600)
  })

  exportTrigger?.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = !exportDrop.classList.contains('is-open')
    closeMenus(root)
    if (open) {
      exportDrop.classList.add('is-open')
      exportMenu.hidden = false
      exportTrigger.setAttribute('aria-expanded', 'true')
    }
  })

  deployTrigger?.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = !deployDrop.classList.contains('is-open')
    closeMenus(root)
    if (open) {
      deployDrop.classList.add('is-open')
      deployMenu.hidden = false
      deployTrigger.setAttribute('aria-expanded', 'true')
    }
  })

  exportMenu?.querySelectorAll('[data-export-target]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-export-target')
      closeMenus(root)
      try {
        await runExportZip(target)
      } catch (err) {
        alert(err?.message || 'Export failed.')
      }
    })
  })

  deployMenu?.querySelectorAll('[data-deploy-target]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-deploy-target')
      closeMenus(root)
      await runDeploy(target)
    })
  })

  document.addEventListener('click', () => closeMenus(root))
  root.addEventListener('click', (e) => e.stopPropagation())
}

init()
