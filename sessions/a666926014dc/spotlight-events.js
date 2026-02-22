<= 0)) {
    return res
      .status(400)
      .json({ success: false, message: 'limit must be a positive integer' });
  }

  if (offset && (isNaN(Number(offset)) || Number(offset) < 0)) {
    return res
      .status(400)
      .json({ success: false, message: 'offset must be a non‑negative integer' });
  }

  if (sort && sort !== 'popularity' && sort !== 'upcoming') {
    return res.status(400).json({
      success: false,
      message: 'sort must be either "popularity" or "upcoming"',
    });
  }

  next();
};