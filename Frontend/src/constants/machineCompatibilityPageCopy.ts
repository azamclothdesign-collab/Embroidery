export const machineCompatibilityPageCopy = {
  metaTitle: "Which Embroidery File Format Do You Need? | Machine Compatibility",
  metaDescription:
    "Select your embroidery machine to find the file format you need—PES, DST, JEF, EXP, and more—then browse compatible designs.",
  eyebrow: "Machine Compatibility",
  heading: "Which Embroidery File Format Do You Need?",
  body: "Select your embroidery machine and we'll help you find the format you need.",
  finderLabel: "What Machine Do You Use?",
  searchPlaceholder: "Search your machine...",
  popularLabel: "Popular",
  yourMachine: "Your Machine",
  recommendedFormat: "Recommended Format",
  compatibleFormat: "Compatible format",
  formatUsesPrefix: "Your machine commonly uses",
  formatUsesSuffix: "embroidery files.",
  browseFormatPrefix: "Browse",
  browseFormatSuffix: "Designs",
  browseCompatible: "Browse Compatible Designs",
  chooseAnother: "Choose another machine",
  disclaimer:
    "Compatibility can vary by machine model and software version. Always confirm the format requirements in your machine's documentation before downloading.",
  formatsEyebrow: "Understanding Embroidery Formats",
  formatsHeading: "What Do PES, DST, JEF & EXP Mean?",
  brandsHeading: "Find Your Machine",
  tableSearchPlaceholder: "Search machine model...",
  tableMachine: "Machine",
  tableFormat: "Format",
  brandEmptyModels:
    "No individual models are listed for this brand yet. Use the brand recommendation above, or contact us with your exact model.",
  stillHeading: "Still Not Sure?",
  stillBody:
    "If you can't find your machine, don't guess. Send us your machine model and we'll help you identify the correct format.",
  contactUs: "Contact Us",
  sendModel: "Send Machine Model",
  findModelHeading: "Where Can I Find My Machine Model?",
  downloadHeading: "Which File Should I Download?",
  downloadBody:
    "When you purchase a design, you'll see the embroidery formats included with that design. Choose the format supported by your machine.",
  downloadMachine: "Your Machine",
  downloadFormat: "Your Format",
  downloadFile: "Your Download",
  downloadExampleFile: "Floral-Butterfly.pes",
  beginnerHeading: "New to Machine Embroidery? Start Here.",
  beginnerCta: "Browse Embroidery Designs",
  faqHeading: "Machine & File Format Questions",
  seoHeading: "Embroidery File Formats, Explained Simply",
  relatedEyebrow: "Ready to Stitch?",
  relatedHeading: "Find Your Next Design",
  relatedFormatPrefix: "Designs available in",
  relatedFormatSuffix: "format",
  relatedEmpty:
    "No designs in the catalog currently list this format. Explore the full collection, or contact us if you need help matching a file.",
  browseAll: "Browse All Designs",
  finalHeading: "Know Your Format. Find Your Design. Start Stitching.",
  finalBody:
    "Now that you know what you need, explore our collection of professionally digitized embroidery designs.",
  finalCta: "Browse Designs",
  noResults: "No machines matched that search.",
} as const;

export const machineCompatibilityFindSteps = [
  {
    id: "01",
    title: "Look at the front of your machine.",
    body: "Many machines show the model name clearly on the front panel or embroidery unit.",
  },
  {
    id: "02",
    title: "Check the label on the side or back.",
    body: "A sticker or plate often lists the exact model number you need for format guidance.",
  },
  {
    id: "03",
    title: "Check your machine manual or settings.",
    body: "Manuals and on-screen settings menus usually name the model and supported file types.",
  },
] as const;

export const machineCompatibilityBeginnerSteps = [
  {
    id: "01",
    title: "Choose Your Design",
    body: "Browse the embroidery collection.",
  },
  {
    id: "02",
    title: "Check Your Format",
    body: "Use the Machine Compatibility Finder.",
  },
  {
    id: "03",
    title: "Download & Stitch",
    body: "Download the correct file and transfer it to your machine.",
  },
] as const;

export const machineCompatibilityFormatCards = [
  {
    format: "PES",
    machine: "Brother",
    body: "Commonly used with Brother embroidery machines.",
  },
  {
    format: "DST",
    machine: "Tajima",
    body: "Widely used in commercial embroidery and Tajima machines.",
  },
  {
    format: "JEF",
    machine: "Janome",
    body: "Commonly associated with Janome embroidery machines.",
  },
  {
    format: "EXP",
    machine: "Bernina / Melco",
    body: "Used by various Bernina and Melco-compatible workflows.",
  },
] as const;

export const machineCompatibilitySeoParagraphs = [
  "Embroidery file formats tell your machine how to place each stitch. PES, DST, JEF, and EXP are among the most common embroidery machine file formats you'll see when shopping for designs.",
  "PES embroidery files are commonly used with Brother machines. DST embroidery files are widely used in commercial embroidery, including many Tajima workflows. JEF is commonly associated with Janome, while EXP appears in various Bernina and Melco-compatible setups.",
  "Because models and software versions differ, treat every recommendation as a starting point—then confirm the format listed in your machine's documentation before you download and stitch.",
] as const;

export const machineCompatibilityFaqItems = [
  {
    question: "What embroidery format does Brother use?",
    answer:
      "Brother embroidery machines commonly use PES files. Exact support can vary by model and software, so confirm PES (or any other listed formats) in your machine's documentation.",
  },
  {
    question: "What embroidery format does Janome use?",
    answer:
      "Janome embroidery machines are commonly associated with JEF files. Model and software differences can apply, so verify the formats your machine accepts before downloading.",
  },
  {
    question: "What is a DST file?",
    answer:
      "DST is a widely used embroidery file format, especially in commercial embroidery and Tajima-related workflows. Many design packs include DST so a single purchase can cover more machines.",
  },
  {
    question: "Can I convert one embroidery format into another?",
    answer:
      "Conversion is possible with appropriate embroidery software, but converting a file does not guarantee identical stitch quality. When you can, download the format your machine already supports.",
  },
  {
    question: "Can I use PES on a Janome machine?",
    answer:
      "It depends on the machine and any software you use with it. Prefer the formats listed for your model—commonly JEF for Janome—rather than assuming PES will work.",
  },
  {
    question: "Which file should I download?",
    answer:
      "Use the Machine Compatibility Finder on this page, then choose the matching format from the formats included with your design.",
  },
  {
    question: "What if I can't find my machine?",
    answer:
      "Don't guess. Contact support with your machine brand and model, and we'll help you identify the correct format.",
  },
] as const;
