<= 0
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid latitude, longitude or radius' });
    }

    // If the DB has PostGIS, we could use native ST_DWithin.
    // Prisma currently does not expose raw PostGIS functions directly,
    // so we fall back to a bounding box + Haversine filter.

    // Approximate bounding box (in degrees)
    const latDelta = (radiusKm / 111.32); // 1 deg lat ≈ 111.32 km
    const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

    const events = await prisma.event.findMany({
      where: {
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
        // Additional filters (e.g., public, not cancelled) can be added here
      },
    });

    // Refine with exact Haversine distance
    const filtered = events.filter((e) => {
      if (e.latitude == null || e.longitude == null) return false;
      const distance = haversineDistance(
        lat,
        lng,
        e.latitude,
        e.longitude
      );
      return distance <= radiusKm;
    });

    return res.status(200).json({ events: filtered });
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to attach the current user's location (if stored) to the request.
 * Useful for endpoints that need the user's location without extra queries.
 */
export async function attachUserLocation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(); // no auth, just continue
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { latitude: true, longitude: true },
    });

    if (user?.latitude != null && user?.longitude != null) {
      (req as any).location = {
        latitude: user.latitude,
        longitude: user.longitude,
      };
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Example route registration (to be placed in your routes file):
 *
 * import { Router } from 'express';
 * import {
 *   updateUserLocation,
 *   getNearbyEvents,
 *   attachUserLocation,
 * } from '../services/locationService';
 *
 * const router = Router();
 *
 * // protect routes with your auth middleware before using attachUserLocation
 * router.put('/me/location', updateUserLocation);
 * router.get('/events/nearby', getNearbyEvents);
 *
 * export default router;
 *
 * Remember to add latitude & longitude columns (type Float) to both User and Event
 * models in your Prisma schema, then run `prisma migrate dev`.
 */