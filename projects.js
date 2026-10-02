// Dummy project data. Real content will be adapted from Behance later.
// `locked` projects only carry public-safe fields here (title/tag) —
// real case study content stays out of any client-shipped file until
// server/edge-level password protection is wired up.
const PROJECTS = [
    {
        id: 'project-one',
        title: 'Designing Calm for Parents on the Go',
        tags: ['Product Design'],
        year: '2026',
        image: 'images/quiet-hours-cover.jpg',
        locked: false,
        // Real Quiet Hours case study, rebuilt from the Behance project using
        // the reusable block system, ordered around the Double Diamond.
        // Diagrams/sketches/wireframes/final-design composites are image-only
        // in the source case study — each is left as a placeholder gallery
        // slot (empty src) until the real screenshots are dropped in.
        body: [
            { type: 'meta', items: [
                { label: 'Overview', value: "Quiet Hours is an app designed to help new parents find calm, baby-friendly locations using real time crowd and noise data." },
                { label: 'Role', value: 'User Experience Designer — UX Research, Rapid Prototyping, Usability Testing, Illustration, and Product Design.' },
                { label: 'Timeline', value: '1 week' },
                { label: 'Tools', value: [
                    { text: 'Figma', logo: 'figma' },
                    { text: 'Maze', logoImg: 'images/logos/maze.png' },
                    { text: 'Claude', logo: 'claude' }
                ] }
            ] },

            { type: 'section', heading: 'Process' },
            { type: 'paragraph', text: 'I followed the Double Diamond framework — researching and defining the problem before exploring and validating solutions.' },
            { type: 'gallery', images: ['images/quiet-hours-double-diamond.png'], aspect: '16 / 9', figure: '1.0', caption: 'Double Diamond process diagram.' },

            { type: 'section', heading: 'Assumptions' },
            { type: 'numbered-list', items: [
                { text: "New parents hesitate to go out with their children as they can't predict the environment." },
                { text: 'Real time data about crowd and noise levels builds trust.' },
                { text: 'Reducing anxiety matters more than saving time.' }
            ] },

            { type: 'section', eyebrow: 'Discover', heading: 'User Interviews' },
            { type: 'paragraph', text: 'To understand the real needs of new parents, I conducted qualitative research to explore their behaviours, frustrations, and motivations when planning outings.' },
            { type: 'paragraph', text: 'I interviewed new parents aged 26-34 to understand how they currently plan outings with their children. The goal was to uncover pain points, workarounds, and unmet needs.' },
            { type: 'stat-row', items: [
                { value: '5', label: 'Interviews conducted' },
                { value: '26-34', label: 'Age range of parents' },
                { value: 'Under 2', label: 'Age of children' },
                { value: 'UK', label: 'Location' },
                { value: '15+', label: 'Insights gathered' }
            ] },

            { type: 'section', eyebrow: 'Discover', heading: 'Affinity Mapping' },
            { type: 'paragraph', text: 'With interview data collected, I began grouping insights to identify patterns. Using affinity mapping, I clustered observations into four recurring themes that revealed what truly matters to parents when planning outings.' },
            { type: 'card-grid', cards: [
                { heading: 'Planning around routines', items: [
                    '"I plan around when my child sleeps"',
                    '"I avoid times close to bedtime"',
                    '"Weather influences where I go"'
                ] },
                { heading: 'Uncertainty and reassurance', items: [
                    '"I struggle knowing when places will be calm"',
                    '"I call venues before I go out, just to double check"',
                    '"I trust other parents the most"'
                ] },
                { heading: 'Stress from crowds', items: [
                    '"Busy places are stressful for me and my child"',
                    '"Crowds overwhelm my child"',
                    '"I sometimes leave early or abandon plans"'
                ] },
                { heading: 'Tools and frustrations', items: [
                    '"When information is wrong it ruins the day"',
                    '"I want real time updates"',
                    "\"I'll stop using an app if it's slow or cluttered\""
                ] }
            ] },

            { type: 'section', eyebrow: 'Discover', heading: 'Key Findings' },
            { type: 'paragraph', text: 'Four critical insights emerged from research that shaped the direction of the project.' },
            { type: 'numbered-list', items: [
                { text: "The child's schedule drives the decision, not the destination." },
                { text: 'Sensory overload affects the whole family — not just the child.' },
                { text: 'Uncertainty is just as stressful as busyness itself.' },
                { text: "Existing tools don't provide parent specific context." }
            ] },

            { type: 'section', eyebrow: 'Discover', heading: 'Competitor Analysis' },
            { type: 'paragraph', text: "I analysed existing tools that parents might use to plan outings, identifying what works, what doesn't, and where opportunities exist." },
            { type: 'comparison', items: [
                {
                    title: 'Google Maps',
                    description: 'Popular times feature for venue busyness',
                    points: [
                        { text: 'Familiar', good: true },
                        { text: 'Widely used', good: true },
                        { text: 'Vague labels', good: false },
                        { text: 'No parent context', good: false }
                    ]
                },
                {
                    title: 'Winnie',
                    description: 'Parent focused reviews for family venues',
                    points: [
                        { text: 'Parent specific', good: true },
                        { text: 'Percentage indicators', good: true },
                        { text: 'Amenity information', good: true },
                        { text: 'No live data', good: false }
                    ]
                },
                {
                    title: 'Waitz',
                    description: 'Real time occupancy for university spaces',
                    points: [
                        { text: 'Live data', good: true },
                        { text: 'Percentage indicators', good: true },
                        { text: 'US universities only', good: false },
                        { text: 'No search functionality', good: false }
                    ]
                }
            ] },
            { type: 'callout', label: 'Key insight', text: 'No single tool combines real time crowd and noise data with parent specific context. This is a gap that Quiet Hours fills.' },

            { type: 'section', eyebrow: 'Define', heading: 'Problem Statement' },
            { type: 'statement', text: "New parents aren't avoiding outings because they don't want to go — they're avoiding the anxiety of not knowing what they're walking into." },

            { type: 'section', eyebrow: 'Define', heading: 'User Persona' },
            { type: 'paragraph', text: 'I began synthesising the research and formed a key persona that defined the user. Meet Maya — a new mum navigating outings with her 6 month old.' },
            { type: 'gallery', images: ['images/quiet-hours-persona.png'], aspect: '16 / 9', figure: '2.0', caption: 'Maya — user persona.' },

            { type: 'section', eyebrow: 'Define', heading: 'How Might We?' },
            { type: 'paragraph', text: 'With the problem clearly defined, I reframed it into How Might We statements to guide ideation.' },
            { type: 'numbered-list', items: [
                { text: 'HMW help parents quickly identify which locations are calm and suitable for their children?' },
                { text: 'HMW provide realtime data about crowd levels and noise so parents can plan confidently?' },
                { text: "HMW make it easier for parents to plan around their child's routine?" },
                { text: 'HMW reduce the time and effort needed to research locations before an outing?' }
            ] },

            { type: 'section', eyebrow: 'Develop', heading: 'User Flow' },
            { type: 'paragraph', text: "Before jumping into screens, I mapped out the core user journey to ensure the experience addressed Maya's key needs — from discovering a location to confirming it's right for her." },
            { type: 'gallery', images: ['images/quiet-hours-user-flow.png'], aspect: '1000 / 1489', figure: '3.0', caption: 'Core user flow.' },

            { type: 'section', eyebrow: 'Develop', heading: 'Sketching & Exploration' },
            { type: 'paragraph', text: 'I began by rapidly exploring ideas using the Crazy 8s framework — sketching multiple concepts to push beyond the obvious solutions. From there, I narrowed down the strongest ideas and mapped out the core user journey.' },
            { type: 'gallery', images: ['images/quiet-hours-sketches.png'], aspect: '16 / 9', figure: '4.0', caption: 'Sketches exploring early concepts.' },

            { type: 'section', eyebrow: 'Develop', heading: 'Wireframing' },
            { type: 'paragraph', text: 'With the user flow mapped out, I translated my sketches into low-fidelity wireframes. These screens established the core structure and interactions — from onboarding through to saving favourites. I then built these into a clickable prototype to take into usability testing.' },
            { type: 'gallery', images: ['images/quiet-hours-wireframes.png'], aspect: '16 / 9', figure: '5.0', caption: 'Low-fidelity wireframes.' },

            { type: 'section', eyebrow: 'Deliver', heading: 'Usability Testing' },
            { type: 'paragraph', text: 'I built a working prototype from the wireframes and tested it with parents using Maze. The goal was to validate the core flow and identify usability issues before moving to high fidelity.' },
            { type: 'stat-row', items: [
                { value: '5', label: 'Participants' },
                { value: '4', label: 'Tasks tested' },
                { value: 'Maze', label: 'Testing tool' },
                { value: '80%', label: 'Completion rate' }
            ] },
            { type: 'paragraph', text: 'The sessions surfaced three recurring friction points — moments where users hesitated, got confused, or could not complete tasks as expected.' },
            { type: 'numbered-list', items: [
                { text: "Users instinctively tried to scroll the home screen, but it wasn't scrollable in the prototype.", sub: 'Fix: Made the screen scrollable.' },
                { text: "The day selector touch targets were too small — users didn't realise the days were tappable.", sub: 'Fix: Redesigned as a more prominent, swipeable navigation with calendar integration.' },
                { text: "\"I've visited this location\" confused users — they weren't sure if it was a pre-visit or post-visit action.", sub: 'Fix: Clarified copy to indicate post-visit action.' }
            ] },

            { type: 'section', eyebrow: 'Deliver', heading: 'Final Designs' },
            { type: 'paragraph', text: 'Using insights from usability testing, I refined the wireframes into a high-fidelity prototype, improving touch targets, interaction clarity, and microcopy.' },
            { type: 'paragraph', text: 'Below are the final screens that bring the flow together.' },
            { type: 'gallery', images: ['', '', '', ''], figure: '6.0', caption: 'Final high-fidelity screens.' }
        ]
    },
    {
        id: 'project-two',
        title: 'Protecting Monzo Users from Crypto Scams',
        tags: ['Monzo', 'Product Design'],
        year: '2025',
        image: 'images/monzo-crypto-allowance-cover.jpg',
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
        locked: false,
        body: [
            { type: 'paragraph', text: 'Placeholder paragraph for the third project case study content.' }
        ]
    }
];
