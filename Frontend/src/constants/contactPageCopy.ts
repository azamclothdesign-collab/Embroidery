export const contactPageCopy = {
  metaTitle: "Contact & Support | We're Here to Help You Stitch",
  metaDescription:
    "Get help with embroidery downloads, ZIP packages, orders, and more — or send our support team a message.",
  eyebrow: "We're Here to Help",
  heading: "Questions? Let's Get You Stitching.",
  body: "Whether you need help downloading your ZIP, checking an order, or getting ready for your next project, we're here to help.",
  contactSupport: "Contact Support",
  browseHelp: "Browse Help Center",
  quickEyebrow: "Quick Help",
  quickHeading: "You Might Find Your Answer Here.",
  formHeading: "Send Us a Message",
  formBody: "Tell us what you need help with and we'll get back to you.",
  nameLabel: "Your Name",
  emailLabel: "Email Address",
  topicLabel: "What Can We Help With?",
  topicPlaceholder: "Select a topic",
  orderLabel: "Order Number (Optional)",
  orderPlaceholder: "Example: FLB-10482",
  messageLabel: "Message",
  messagePlaceholder: "Share a few details so we can help you faster.",
  sendMessage: "Send Message",
  sending: "Sending…",
  successHeading: "Message Sent",
  successBody:
    "Thanks for reaching out. We've received your message and will get back to you as soon as possible.",
  successNote:
    "Your message was received. We’ll reply as soon as we can.",
  errorHeading: "Something went wrong.",
  errorBody: "Please try again.",
  tryAgain: "Try Again",
  emailInvalid: "Please enter a valid email address.",
  nameRequired: "Please enter your name.",
  topicRequired: "Please select a topic.",
  messageRequired: "Please enter a message.",
  preferEmailHeading: "Prefer Email?",
  preferEmailBody:
    "A direct support email will appear here once the client publishes one. Until then, use the form and include your order number if you have one.",
  orderSupportHeading: "Already Purchased a Design?",
  orderSupportBody:
    "If you're having trouble accessing a purchase, have your order number ready so we can help you faster.",
  viewMyOrders: "View My Orders",
  downloadHelpHeading: "Having Trouble Downloading?",
  downloadGuide: "Read Download Guide",
  machineHelpHeading: "Need Help With Your Download?",
  machineHelpBody:
    "After purchase you get one confidential ZIP per design. Contact support with your order number if the download fails.",
  findMyMachine: "Contact Support",
  faqHeading: "Common Questions",
  privacyHeading: "Your Information Stays Private",
  privacyBody:
    "We only use the information you provide to respond to your request and provide customer support, subject to our Privacy Policy.",
  privacyCta: "Privacy Policy",
  finalEyebrow: "Ready to Create?",
  finalHeading: "Still Looking for the Right Design?",
  finalBody:
    "If you have everything you need, explore the collection and find your next project.",
  browseDesigns: "Browse Designs",
  checkMachine: "Check Machine Compatibility",
  supportFlowLabel: "How Support Works",
} as const;

export const contactQuickHelp = [
  {
    id: "01",
    title: "How Do Downloads Work?",
    body: "After payment you get one ZIP package with the embroidery files for that design.",
    cta: "How It Works",
    href: "how-it-works",
  },
  {
    id: "02",
    title: "Where Are My Files?",
    body: "Learn how downloads work after purchasing.",
    cta: "Download Help",
    href: "downloads",
  },
  {
    id: "03",
    title: "Need Help With an Order?",
    body: "Find your order information or contact support.",
    cta: "Order Help",
    href: "orders",
  },
  {
    id: "04",
    title: "Frequently Asked Questions",
    body: "Find answers to common questions about designs, files, payments, and downloads.",
    cta: "View FAQs",
    href: "faqs",
  },
] as const;

export const contactSupportTopics = [
  { id: "", label: "Select a topic" },
  { id: "download-issue", label: "Download Issue" },
  { id: "order-question", label: "Order Question" },
  { id: "payment-question", label: "Payment Question" },
  { id: "technical-issue", label: "Technical Issue" },
  { id: "other", label: "Other" },
] as const;

export const contactDownloadScenarios = [
  {
    title: "Files Not Appearing",
    body: "Confirm that your payment has been completed and check your order page.",
  },
  {
    title: "Download Failed",
    body: "Try downloading the ZIP again or use another browser or device.",
  },
  {
    title: "Can't Open the ZIP",
    body: "Open the ZIP on your computer first, then transfer the embroidery file your machine needs.",
  },
] as const;

export const contactSupportFlow = [
  "Question",
  "Help Center",
  "FAQ",
  "Still Need Help?",
  "Contact Support",
  "Order Number",
  "Resolution",
] as const;

export const contactFaqItems = [
  {
    category: "Before Buying",
    question: "What am I purchasing?",
    answer:
      "You're purchasing a digital embroidery design delivered as one confidential ZIP package after payment.",
  },
  {
    category: "Before Buying",
    question: "Are these physical or digital products?",
    answer:
      "These are digital embroidery designs. No physical product is shipped.",
  },
  {
    category: "Before Buying",
    question: "What do I download?",
    answer:
      "One ZIP package per design. That single download contains the confidential embroidery files for stitching.",
  },
  {
    category: "Before Buying",
    question: "When do I get my files?",
    answer:
      "Immediately after successful payment from your order page or account downloads.",
  },
  {
    category: "After Buying",
    question: "Where do I download my files?",
    answer:
      "After successful payment, download the ZIP from the order success page, order detail, or account downloads.",
  },
  {
    category: "After Buying",
    question: "Can I download my purchase again?",
    answer:
      "Yes. Return to your order or account downloads to get the same ZIP again.",
  },
  {
    category: "Technical",
    question: "How should I treat the ZIP files?",
    answer:
      "Treat the design files as confidential. Do not redistribute the ZIP or share the embroidery files.",
  },
  {
    category: "Technical",
    question: "Why isn't my design stitching correctly?",
    answer:
      "Confirm hoop size and design specifications from the product page. If something still looks wrong, contact support with your order number.",
  },
  {
    category: "Orders",
    question: "How can I find my order?",
    answer:
      "Check your confirmation email and your orders page. Include the order number when you contact support.",
  },
  {
    category: "Orders",
    question: "What happens if payment fails?",
    answer:
      "If payment isn't completed, downloads won't be released. Try checkout again or contact support with the details from your attempt.",
  },
  {
    category: "Orders",
    question: "How can I contact support about an order?",
    answer:
      "Use the contact form, select Order Question, and include your order number so we can help faster.",
  },
] as const;
