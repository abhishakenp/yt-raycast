const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Types } = mongoose;

// Assuming Event model is defined elsewhere and imported here
const Event = require('../models/Event');

/**
 * GET /api/events/search
 * Search events with various filters.
 * Query Parameters:
 *   - q: keyword search (matches title, description, tags)
 *   - category: event category
 *   - lat, lng, radius: location based search (radius in km)
 *   - startDate, endDate: ISO date strings to filter event dates
 *   - minPrice, maxPrice: numeric price range
 *   - spotlight: boolean to filter spotlight events
 *   - page: pagination page (default 1)
 *   - limit: items per page (default 20)
 */
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      category,
      lat,
      lng,
      radius,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      spotlight,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Text search (requires a text index on title, description, tags)
    if (q) {
      filter.$text = { $search: q };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Spotlight filter
    if (spotlight !== undefined) {
      filter.isSpotlight = spotlight === 'true';
    }

    // Date range filter
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) {
        filter.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.startDate.$lte = new Date(endDate);
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Geospatial filter (requires a 2dsphere index on location)
    if (lat && lng && radius) {
      const distanceInMeters = Number(radius) * 1000; // km to meters
      filter.location = {
        $geoWithin: {
          $centerSphere: [
            [Number(lng), Number(lat)],
            distanceInMeters / 6378100, // Earth's radius in meters
          ],
        },
      };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    let query = Event.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ startDate: 1 });

    // If text search, add a score field and sort by relevance
    if (q) {
      query = query
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, startDate: 1 });
    }

    const [events, total] = await Promise.all([
      query.exec(),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: events,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('Event search error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;