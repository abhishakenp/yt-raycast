<Video[]> {
  const { limit = 10, excludeWatched = true } = options

  // 1️⃣ Fetch creators the user is subscribed to
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    select: { creatorId: true },
  })
  const subscribedCreatorIds = subscriptions.map((s) => s.creatorId)

  // 2️⃣ Determine categories the user has shown interest in
  //    We infer interest from comments and ratings (if a rating field existed)
  const commentedCategoryIds = await prisma.comment
    .findMany({
      where: { userId },
      select: { video: { select: { categoryId: true } } },
    })
    .then((comments) => {
      const ids = comments.map((c) => c.video?.categoryId).filter(Boolean) as number[]
      return Array.from(new Set(ids))
    })

  // 3️⃣ Optionally exclude videos the user has already watched
  let watchedVideoIds: number[] = []
  if (excludeWatched) {
    // Assuming a WatchHistory table exists; if not, this block can be removed.
    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId },
      select: { videoId: true },
    })
    watchedVideoIds = watchHistory.map((wh) => wh.videoId)
  }

  // 4️⃣ Build the recommendation query
  const videos = await prisma.video.findMany({
    where: {
      AND: [
        // Exclude already watched videos if requested
        excludeWatched ? { id: { notIn: watchedVideoIds } } : {},
        // Prefer videos from subscribed creators OR from interested categories
        {
          OR: [
            { creatorId: { in: subscribedCreatorIds } },
            { categoryId: { in: commentedCategoryIds } },
          ],
        },
        // Only fetch videos that are marked as public/active
        { isPublic: true },
      ],
    },
    orderBy: [
      // Primary: rating (higher is better)
      { rating: 'desc' },
      // Secondary: viewCount (more popular)
      { viewCount: 'desc' },
    ],
    take: limit,
    include: {
      creator: {
        select: { id: true, name: true, profileImageUrl: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  })

  return videos
}

/**
 * Example usage (e.g., in an Express route handler):
 *
 *   import { getRecommendations } from './services/recommendation.service'
 *
 *   app.get('/api/recommendations', async (req, res) => {
 *     const userId = Number(req.user?.id) // assuming auth middleware populates req.user
 *     if (!userId) return res.status(401).json({ error: 'Unauthenticated' })
 *
 *     const recommendations = await getRecommendations(userId, { limit: 12 })
 *     res.json(recommendations)
 *   })
 *
 * The function can be further refined with machine‑learning models,
 * collaborative filtering, or time‑based decay for fresher content.
 */