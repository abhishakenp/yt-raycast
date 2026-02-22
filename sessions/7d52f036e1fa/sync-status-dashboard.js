<string, SyncJob>();
      syncJobs.forEach(job => jobMap.set(job.providerId, job));

      const result = providers.map(p => {
        const job = jobMap.get(p.id);
        const status = job?.status ?? 'idle';
        const progress = job?.progress ?? (status === 'completed' ? 100 : 0);
        const lastRunAt = job?.finishedAt?.toISOString() ?? null;
        const nextRunAt = job?.nextRunAt?.toISOString() ?? null;
        const errorMessage = job?.errorMessage ?? null;

        return {
          providerId: p.id,
          providerName: p.name,
          status,
          progress,
          lastRunAt,
          nextRunAt,
          errorMessage,
        };
      });

      // Validate before sending (ensures schema consistency)
      const validated = SyncStatusSchema.array().parse(result);
      res.json(validated);
    } catch (err) {
      logger.error('Failed to fetch sync status', { error: err, userId: (req as any).user?.id });
      next(err);
    }
  },
);

export default router;