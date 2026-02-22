< 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}

/**
 * Middleware factory that verifies the user meets the required age.
 * It expects `req.body.birthdate` (ISO string) during registration
 * or `req.userId` (authenticated user) for protected routes.
 *
 * @param requiredAge Minimum age required (e.g., 18).
 */
export function ageVerification(requiredAge: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1️⃣ Registration flow – birthdate supplied in the request body.
      if (req.body && req.body.birthdate) {
        const birthdate = new Date(req.body.birthdate);
        if (isNaN(birthdate.getTime())) {
          throw new BadRequestError('Invalid birthdate format.');
        }

        const age = calculateAge(birthdate);
        if (age < requiredAge) {
          throw new ForbiddenError(`You must be at least ${requiredAge} years old to use this platform.`);
        }

        // Attach calculated age to request for downstream handlers (optional).
        (req as any).calculatedAge = age;
        return next();
      }

      // 2️⃣ Authenticated flow – fetch birthdate from DB using userId.
      const userId = (req as any).userId;
      if (!userId) {
        throw new BadRequestError('User identifier missing for age verification.');
      }

      const user: User | null = await prisma.user.findUnique({
        where: { id: userId },
        select: { birthdate: true },
      });

      if (!user || !user.birthdate) {
        throw new BadRequestError('User birthdate not found.');
      }

      const age = calculateAge(user.birthdate);
      if (age < requiredAge) {
        throw new ForbiddenError(`You must be at least ${requiredAge} years old to access this resource.`);
      }

      // Attach age to request for downstream handlers (optional).
      (req as any).calculatedAge = age;
      return next();
    } catch (err) {
      next(err);
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Example usage in an Express router (for reference only)                  */
/* -------------------------------------------------------------------------- */
// import express from 'express';
// import { registerUser } from '../controllers/authController';
// const router = express.Router();
//
// // Registration route – enforce 18+ age at sign‑up.
// router.post(
//   '/register',
//   ageVerification(18), // <-- age gate
//   registerUser
// );
//
// // Protected route – only 21+ users can create an event.
// router.post(
//   '/events',
//   authenticate, // your auth middleware that sets req.userId
//   ageVerification(21),
//   createEvent
// );
//
// export default router;