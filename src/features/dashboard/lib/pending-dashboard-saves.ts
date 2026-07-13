export const createPendingDashboardSaves = () => {
  const pending = new Set<Promise<unknown>>()

  const track = <Result>(save: Result | PromiseLike<Result>) => {
    const tracked = Promise.resolve(save).finally(() => {
      pending.delete(tracked)
    })
    pending.add(tracked)
    return tracked
  }

  const hasPending = () => pending.size > 0

  const drain = async () => {
    while (pending.size > 0) {
      await Promise.allSettled([...pending])
    }
  }

  return { drain, hasPending, track }
}
