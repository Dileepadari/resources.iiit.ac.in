require("dotenv/config");
const bcrypt = require("bcryptjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const USERS = [
  { name: "Dileep Adari", email: "dileep@students.iiit.ac.in", password: "password123", role: "ADMIN" },
  { name: "Ananya Rao", email: "ananya@students.iiit.ac.in", password: "password123", role: "STUDENT" },
  { name: "Karthik Nanda", email: "karthik@students.iiit.ac.in", password: "password123", role: "STUDENT" },
];

const COURSES = [
  {
    code: "CS3.401",
    name: "Performance Modelling in Computer Systems",
    description:
      "Queueing theory, Markov chains and simulation applied to the design and analysis of computer systems. Covers open and closed networks, operational laws and capacity planning.",
    instructor: "Prof. S. Ramesh",
    semester: "Monsoon 2026",
    tags: ["systems", "theory", "elective"],
    resources: [
      { title: "Full lecture notes (all 14 weeks)", type: "NOTES", url: "https://drive.google.com/drive/folders/example-pmcs-notes", description: "Typed notes covering every lecture, with the derivations written out in full." },
      { title: "Queueing theory slide deck", type: "SLIDES", url: "https://example.iiit.ac.in/pmcs/slides.pdf" },
      { title: "Midsem 2025 with solutions", type: "PAST_PAPER", url: "https://example.iiit.ac.in/pmcs/midsem-2025.pdf", description: "Solutions were checked against the official key." },
      { title: "Harchol-Balter, Performance Modeling and Design of Computer Systems", type: "BOOK", url: "https://www.cs.cmu.edu/~harchol/PerformanceModeling/book.html" },
    ],
  },
  {
    code: "CS1.301",
    name: "Algorithm Analysis and Design",
    description:
      "Design paradigms and analysis techniques: divide and conquer, greedy methods, dynamic programming, graph algorithms, and an introduction to NP-completeness.",
    instructor: "Prof. K. Iyer",
    semester: "Spring 2026",
    tags: ["theory", "core", "algorithms"],
    resources: [
      { title: "Dynamic programming problem set with worked answers", type: "ASSIGNMENT", url: "https://github.com/example/aad-dp-problems", description: "Every problem from the tutorials, solved and explained." },
      { title: "Recorded lectures playlist", type: "VIDEO", url: "https://www.youtube.com/playlist?list=example-aad" },
      { title: "Graph algorithms cheat sheet", type: "NOTES", url: "https://example.iiit.ac.in/aad/graphs.pdf" },
    ],
  },
  {
    code: "CS7.501",
    name: "Advanced Natural Language Processing",
    description:
      "Statistical and neural approaches to language: embeddings, sequence models, attention, transformers, pretraining and evaluation of modern language models.",
    instructor: "Prof. M. Shrivastava",
    semester: "Monsoon 2026",
    tags: ["ai", "nlp", "elective"],
    resources: [
      { title: "Assignment 1 starter code and report template", type: "ASSIGNMENT", url: "https://github.com/example/anlp-a1" },
      { title: "Transformer architecture, annotated", type: "NOTES", url: "https://example.iiit.ac.in/anlp/transformers.pdf", description: "Diagrams for every block, with the tensor shapes labelled." },
      { title: "Course reading list", type: "LINK", url: "https://example.iiit.ac.in/anlp/readings" },
    ],
  },
  {
    code: "CS9.302",
    name: "Computer Networks",
    description:
      "The internet protocol stack from the link layer up: framing, routing, congestion control, TCP internals, DNS and an introduction to network security.",
    instructor: "Prof. A. Bhattacharya",
    semester: "Spring 2026",
    tags: ["systems", "core", "networks"],
    resources: [
      { title: "Wireshark lab walkthroughs", type: "NOTES", url: "https://example.iiit.ac.in/cn/wireshark-labs.pdf" },
      { title: "Endsem 2024 paper", type: "PAST_PAPER", url: "https://example.iiit.ac.in/cn/endsem-2024.pdf" },
    ],
  },
  {
    code: "CS4.401",
    name: "Operating Systems and Networks",
    description:
      "Processes, threads, scheduling, memory management, file systems and concurrency, taught alongside the networking stack that operating systems expose.",
    instructor: "Prof. R. Kumar",
    semester: "Monsoon 2026",
    tags: ["systems", "core"],
    resources: [
      { title: "xv6 source walkthrough", type: "NOTES", url: "https://example.iiit.ac.in/osn/xv6-walkthrough.pdf", description: "Function by function, in the order the kernel boots." },
      { title: "Concurrency problems and solutions", type: "ASSIGNMENT", url: "https://github.com/example/osn-concurrency" },
      { title: "Scheduling lecture recording", type: "VIDEO", url: "https://www.youtube.com/watch?v=example-osn" },
    ],
  },
  {
    code: "CS6.401",
    name: "Software Engineering",
    description:
      "Requirements, architecture, testing strategies, version control workflows and the practices that keep a codebase maintainable across a team.",
    instructor: "Prof. V. Choppella",
    semester: "Spring 2026",
    tags: ["software", "core"],
    resources: [
      { title: "Design patterns summary", type: "NOTES", url: "https://example.iiit.ac.in/se/patterns.pdf" },
      { title: "Team project rubric and past submissions", type: "LINK", url: "https://example.iiit.ac.in/se/projects" },
    ],
  },
];

async function main() {
  console.log("Clearing existing data");
  await prisma.vote.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users");
  const users = [];
  for (const user of USERS) {
    users.push(
      await prisma.user.create({
        data: { ...user, password: await bcrypt.hash(user.password, 12) },
      }),
    );
  }

  console.log("Creating courses and resources");
  let resourceIndex = 0;
  const createdResources = [];

  for (const [index, course] of COURSES.entries()) {
    const owner = users[index % users.length];
    const created = await prisma.course.create({
      data: {
        code: course.code,
        name: course.name,
        description: course.description,
        instructor: course.instructor,
        semester: course.semester,
        tags: course.tags,
        createdById: owner.id,
      },
    });

    for (const resource of course.resources) {
      createdResources.push(
        await prisma.resource.create({
          data: {
            title: resource.title,
            description: resource.description ?? null,
            url: resource.url,
            type: resource.type,
            courseId: created.id,
            authorId: users[resourceIndex++ % users.length].id,
          },
        }),
      );
    }
  }

  console.log("Adding votes");
  let votes = 0;
  for (const [index, resource] of createdResources.entries()) {
    // A deterministic spread so the ordering by votes is visibly different
    // every time the seed runs against a fresh database.
    for (let u = 0; u < (index % users.length) + 1; u += 1) {
      await prisma.vote.create({
        data: { resourceId: resource.id, userId: users[u].id },
      });
      votes += 1;
    }
  }

  console.log(
    `Seeded ${users.length} users, ${COURSES.length} courses, ${createdResources.length} resources, ${votes} votes.`,
  );
  console.log(`Sign in as ${USERS[0].email} with password ${USERS[0].password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
