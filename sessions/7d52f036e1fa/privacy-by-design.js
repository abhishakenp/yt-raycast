<void> {
  // Delete everything that belongs to the user in a single transaction
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { authorId: userId } }),
    prisma.attachment.deleteMany({ where: { ownerId: userId } }),
    prisma.chatThread.deleteMany({ where: { ownerId: userId } }),
    prisma.provider.deleteMany({ where: { userId } }),
    prisma.tag.deleteMany({ where: { userId } }),
    prisma.archive.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

// -----------------------------------------------------------------------------
// Export prisma instance for the rest of the app
// -----------------------------------------------------------------------------
export default prisma;