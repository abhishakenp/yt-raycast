<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

/* -------------------------------------------------
   JWT Helpers
------------------------------------------------- */
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(id: string) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/* -------------------------------------------------
   Middleware
------------------------------------------------- */
export async function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const currentUser = await User.findById(decoded.id).select("-password");
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "The user belonging to this token no longer exists" });
    }
    // @ts-ignore
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* -------------------------------------------------
   Controllers
------------------------------------------------- */
async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email and password" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "User with that email already exists" });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());

  // Set httpOnly cookie for convenience (optional)
  res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    .status(201)
    .json({
      status: "success",
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
}

async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id.toString());

  res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })
    .status(200)
    .json({
      status: "success",
      token,
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
}

async function getMe(req: Request, res: Response) {
  // @ts-ignore
  const user = req.user;
  res.status(200).json({ status: "success", data: { user } });
}

/* -------------------------------------------------
   Routes
------------------------------------------------- */
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;