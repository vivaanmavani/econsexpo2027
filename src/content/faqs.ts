import { baseStatus, site } from "@/content/site";

// Driven by the same fields as the rest of the site, so an answer can't disagree with the Register button.
const dateAnswer = baseStatus.dateNote
  ? `${site.date.label} is the planned date and is still to be confirmed. We will update this page as soon as it is final.`
  : `Yes. Econs Expo ${site.edition} takes place on ${site.date.label}.`;

const signupAnswer =
  baseStatus.registration === "pending"
    ? `${baseStatus.registrationNote} Follow ${site.instagramHandle} on Instagram for the announcement.`
    : "Use the Register button on this page. It opens the official sign-up form.";

export const faqs = [
  {
    q: "Do I need to take economics?",
    a: "No. Econs Expo is open to students who don't take economics as a subject. Curiosity is enough.",
  },
  { q: "Is the date fixed?", a: dateAnswer },
  { q: "How do I sign up?", a: signupAnswer },
];
