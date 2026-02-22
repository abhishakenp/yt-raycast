<User> = {};

      if (name !== undefined) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (theme !== undefined) updateData.theme = theme as any;
      if (moodStatus !== undefined) updateData.moodStatus = moodStatus;

      // Handle avatar upload
      if (req.file) {
        // Delete old avatar if exists
        if (currentUser.avatarUrl) {
          const oldPath = path.join(uploadDir, path.basename(currentUser.avatarUrl));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      // Handle email change with verification flow
      if (email && email !== currentUser.email) {
        // Mark email as unverified and store pending email
        updateData.email = email;
        updateData.isEmailVerified = false;
        updateData.pendingEmail = email; // custom field in schema for verification flow

        // Send verification email asynchronously
        sendVerificationEmail(email, userId).catch((e) => {
          console.error('Failed to send verification email:', e);
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          isEmailVerified: true,
          avatarUrl: true,
          bio: true,
          theme: true,
          moodStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

export default router;