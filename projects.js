// Dummy project data. Real content will be adapted from Behance later.
// `locked` projects only carry public-safe fields here (title/tag/blurb) —
// real case study content stays out of any client-shipped file until
// server/edge-level password protection is wired up.
const PROJECTS = [
    {
        id: 'project-one',
        title: 'Designing Calm for Parents on the Go',
        tags: ['Product Design'],
        year: '2026',
        blurb: 'A short placeholder description of what this project was about and the impact it had.',
        image: 'images/quiet-hours-cover.png',
        locked: false,
        body: [
            { type: 'paragraph', text: 'Placeholder paragraph describing the problem, approach, and outcome for this case study. Real content will be adapted from Behance later.' },
            { type: 'paragraph', text: 'Another placeholder paragraph with more detail on the process and results.' }
        ]
    },
    {
        id: 'project-two',
        title: 'Protecting Monzo Users from Crypto Scams',
        tags: ['Monzo', 'Product Design'],
        year: '2025',
        blurb: 'Short placeholder description for the second project card.',
        image: 'images/monzo-crypto-allowance-cover.png',
        locked: true,
        body: [
            { type: 'paragraph', text: 'Placeholder body content. This project will be password protected once real protection is wired up — real content is not included here yet.' }
        ]
    },
    {
        id: 'project-three',
        title: 'Project Three',
        tags: ['Design Systems'],
        year: '2023',
        blurb: 'Short placeholder description for the third project card.',
        locked: false,
        body: [
            { type: 'paragraph', text: 'Placeholder paragraph for the third project case study content.' }
        ]
    }
];
