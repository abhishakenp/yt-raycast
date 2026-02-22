let _tasks = []
let _homepageReady = false
let _prompt = ''
let _lastStatus = null
let _broadcast = null

export function setBroadcaster(fn) {
  _broadcast = fn
}

function broadcast(msg) {
  if (msg.type === 'status') _lastStatus = msg
  _broadcast?.(msg)
}

export function getState() {
  return { tasks: _tasks, homepageReady: _homepageReady, prompt: _prompt, lastStatus: _lastStatus }
}

export function setPrompt(prompt) {
  _prompt = prompt
}

export function setTasks(tasks) {
  _tasks = tasks
  broadcast({ type: 'tasks_loaded', tasks })
}

export function updateTask(task) {
  const idx = _tasks.findIndex((t) => t.id === task.id)
  if (idx >= 0) _tasks[idx] = { ..._tasks[idx], ...task }
  else _tasks.push(task)
  broadcast({ type: 'task_updated', task: _tasks[idx >= 0 ? idx : _tasks.length - 1] })
}

export function signalHomepageReady() {
  _homepageReady = true
  broadcast({ type: 'homepage_ready' })
}

export { broadcast }
