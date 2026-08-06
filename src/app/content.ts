export const SUBJECTS = [
  "Programming",
  "AI",
  "Robotics",
  "Automation",
  "Professional Skills",
];

export const HOW_IT_WORKS = [
  { step: "Select a subject", description: "Tell us what you want to learn." },
  { step: "Find a tutor", description: "We match you with an experienced tutor for that subject." },
  { step: "Book a session", description: "Schedule time with your tutor and start learning." },
];

export type SampleTutor = {
  name: string;
  subject: string;
  bio: string;
};

export const SAMPLE_TUTORS: SampleTutor[] = [
  {
    name: "Maya Chen",
    subject: "Programming",
    bio: "Full-stack engineer who has mentored dozens of beginners into their first dev jobs.",
  },
  {
    name: "Daniel Osei",
    subject: "AI",
    bio: "ML researcher turned educator, focused on making AI concepts click through hands-on projects.",
  },
  {
    name: "Priya Nair",
    subject: "Robotics",
    bio: "Robotics engineer with a decade of experience building and teaching embedded systems.",
  },
  {
    name: "Tom Whitfield",
    subject: "Automation",
    bio: "Automation consultant who helps learners turn repetitive work into reliable scripts and workflows.",
  },
];
