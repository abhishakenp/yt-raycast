<no-reply@lightning.com>")
 */
export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private static async sendMail(options: EmailOptions) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await EmailService.transporter.sendMail(mailOptions);
  }

  private static loadTemplate(templateName: string, data: Record<string, any>): string {
    const templatePath = path.resolve(__dirname, '../../templates/email', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = compile(source);
    return compiled(data);
  }

  /** Send a welcome email after a new user registers */
  static async sendWelcomeEmail(user: User) {
    const html = EmailService.loadTemplate('welcome', {
      name: user.firstName || user.email,
      appName: 'Lightning',
      supportEmail: 'support@lightning.com',
    });

    await EmailService.sendMail({
      to: user.email,
      subject: `Welcome to Lightning, ${user.firstName || 'there'}!`,
      html,
    });
  }

  /** Notify user about a successful subscription purchase */
  static async sendSubscriptionConfirmation(user: User, subscription: Subscription, plan: Plan) {
    const html = EmailService.loadTemplate('subscription-confirmation', {
      name: user.firstName || user.email,
      planName: plan.name,
      price: plan.price,
      renewalDate: subscription.nextBillingDate?.toDateString(),
      appName: 'Lightning',
    });

    await EmailService.sendMail({
      to: user.email,
      subject: `Your Lightning ${plan.name} subscription is active`,
      html,
    });
  }

  /** Notify user when a subscription is about to renew */
  static async sendRenewalReminder(user: User, subscription: Subscription, plan: Plan) {
    const html = EmailService.loadTemplate('renewal-reminder', {
      name: user.firstName || user.email,
      planName: plan.name,
      renewalDate: subscription.nextBillingDate?.toDateString(),
      appName: 'Lightning',
    });

    await EmailService.sendMail({
      to: user.email,
      subject: `Your Lightning subscription renews soon`,
      html,
    });
  }

  /** Notify user when a payment fails */
  static async sendPaymentFailed(user: User, subscription: Subscription, plan: Plan) {
    const html = EmailService.loadTemplate('payment-failed', {
      name: user.firstName || user.email,
      planName: plan.name,
      nextAttemptDate: subscription.nextBillingDate?.toDateString(),
      supportEmail: 'support@lightning.com',
      appName: 'Lightning',
    });

    await EmailService.sendMail({
      to: user.email,
      subject: `Payment issue for your Lightning ${plan.name} subscription`,
      html,
    });
  }

  /** Generic method to send any custom email */
  static async sendCustomEmail(to: string, subject: string, templateName: string, data: Record<string, any>) {
    const html = EmailService.loadTemplate(templateName, data);
    await EmailService.sendMail({ to, subject, html });
  }
}