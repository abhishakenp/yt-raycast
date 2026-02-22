<= new Date()) {
        throw new Error('Start date must be in the future.');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) {
        throw new Error('End date must be after start date.');
      }
      return true;
    }),
  body('location')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Location can be up to 255 characters.'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer.'),
  body('price')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Price must be a non‑negative integer (cents).'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer.'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean.'),
  body('coverPhotoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cover photo ID must be a positive integer.')
];

/**
 * POST /events
 * Creates a new event.
 */
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Age verification (example: minimum 13 years old)
    const MIN_AGE = 13;
    const userAge = user.age; // assuming `age` field exists on User
    if (userAge < MIN_AGE) {
      return res.status(403).json({ error: `You must be at least ${MIN_AGE} years old to create events.` });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      capacity,
      price = 0,
      categoryId,
      isVirtual = false,
      coverPhotoId,
    } = req.body;

    // Optional: charge creator Lids for premium event creation
    // For demonstration, assume creating a "highlighted" event costs 50 Lids.
    const HIGHLIGHT_COST = 50;
    const wantsHighlight = req.body.highlight === true;
    if (wantsHighlight) {
      const userLids = await getUserLids(user.id);
      if (userLids < HIGHLIGHT_COST) {
        return res.status(402).json({ error: 'Insufficient Lids to create a highlighted event.' });
      }
      await deductLids(user.id, HIGHLIGHT_COST);
    }

    // Verify cover photo belongs to user (if provided)
    if (coverPhotoId) {
      const photo = await prisma.photo.findUnique({
        where: { id: coverPhotoId },
        select: { id: true, ownerId: true },
      });
      if (!photo || photo.ownerId !== user.id) {
        return res.status(400).json({ error: 'Invalid cover photo.' });
      }
    }

    // Create the event
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        location,
        capacity: capacity ?? null,
        price,
        isVirtual,
        highlighted: wantsHighlight ?? false,
        status: EventStatus.ACTIVE,
        creator: { connect: { id: user.id } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        coverPhoto: coverPhotoId ? { connect: { id: coverPhotoId } } : undefined,
      },
      include: {
        creator: { select: { id: true, username: true } },
        category: true,
        coverPhoto: true,
      },
    });

    // Notify followers of the creator about the new event
    await sendNotification({
      type: 'EVENT_CREATED',
      recipientIds: await prisma.follow.findMany({
        where: { followeeId: user.id },
        select: { followerId: true },
      }).then(f => f.map(r => r.followerId)),
      payload: {
        eventId: newEvent.id,
        title: newEvent.title,
        creator: {
          id: user.id,
          username: user.username,
        },
      },
    });

    return res.status(201).json({ event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    next(err);
  }
};