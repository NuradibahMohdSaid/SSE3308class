// Malaysia's Air Pollutant Index (API) bands, using the colours shown on APIMS.
export const API_BANDS = [
  {
    min: 0,
    max: 50,
    label: 'Good',
    color: '#2f7fd1',
    text: '#ffffff',
    advice: 'The air is clean. Enjoy outdoor activities as usual.',
  },
  {
    min: 51,
    max: 100,
    label: 'Moderate',
    color: '#3d9a4e',
    text: '#ffffff',
    advice:
      'Fine for most people. If you have asthma or a heart condition, watch for symptoms.',
  },
  {
    min: 101,
    max: 200,
    label: 'Unhealthy',
    color: '#f2c230',
    text: '#2a2203',
    advice:
      'Cut back on outdoor exercise. Children, older people and anyone with asthma or heart disease should stay indoors.',
  },
  {
    min: 201,
    max: 300,
    label: 'Very unhealthy',
    color: '#e8862e',
    text: '#2a1503',
    advice:
      'Stay indoors with the windows closed. Wear an N95 mask if you have to go out.',
  },
  {
    min: 301,
    max: 500,
    label: 'Hazardous',
    color: '#c93a32',
    text: '#ffffff',
    advice:
      'Avoid going outside. Follow official instructions, as schools and workplaces may close.',
  },
]

export const API_MAX = 500

export function bandFor(api) {
  return API_BANDS.find((band) => api <= band.max) ?? API_BANDS.at(-1)
}

export const NAV_LINKS = [
  { href: '#facts', label: 'The facts' },
  { href: '#api', label: 'Read the API' },
  { href: '#health', label: 'Health' },
  { href: '#history', label: 'History' },
  { href: '#quiz', label: 'Quiz' },
  { href: '#pledge', label: 'Pledge' },
]

export const STATS = [
  {
    title: 'Size of a PM2.5 particle',
    value: '2.5 µm',
    desc: 'About 30 times thinner than a human hair',
  },
  {
    title: 'People breathing polluted air',
    value: '99%',
    desc: 'Of the world lives above WHO guideline limits',
  },
  {
    title: 'Early deaths each year',
    value: '4.2 million',
    desc: 'Linked to outdoor air pollution (WHO)',
  },
  {
    title: 'Land burned in 2015',
    value: '2.6 million ha',
    desc: 'In Indonesia alone (World Bank)',
  },
]

export const CAUSES = [
  {
    id: 'fires',
    label: 'Land and forest fires',
    title: 'Fires on drained peatland are the biggest source',
    body: 'Most of the smoke that drifts across Southeast Asia comes from land being cleared by fire, much of it on peat. Dried-out peat can smoulder underground for weeks and releases thick smoke that travels hundreds of kilometres.',
    action: 'Choose products made with certified sustainable palm oil and paper.',
  },
  {
    id: 'burning',
    label: 'Open burning',
    title: 'Small fires add up close to home',
    body: 'Burning rubbish, garden waste or crop leftovers sends smoke straight into the neighbourhood. During a dry spell these fires also spread easily to nearby scrub and landfills.',
    action: 'Never burn waste in the open, and report open burning to the Department of Environment.',
  },
  {
    id: 'traffic',
    label: 'Traffic and industry',
    title: 'Everyday emissions make a bad day worse',
    body: 'Exhaust from vehicles, power stations and factories adds fine particles and gases to city air all year round. When smoke arrives on top of that, readings climb faster.',
    action: 'Share rides, take public transport and keep your vehicle serviced.',
  },
  {
    id: 'weather',
    label: 'Weather',
    title: 'Dry seasons and wind decide where the smoke goes',
    body: 'Haze in Malaysia usually peaks during the southwest monsoon, roughly June to September, when the weather is dry and winds carry smoke across the sea. El Niño years bring longer droughts and worse fires.',
    action: 'Expect haze in the dry months and prepare your masks and filters early.',
  },
]

export const HEALTH = [
  {
    title: 'What you may feel within hours',
    body: 'Itchy or watery eyes, a runny nose, a sore throat, coughing and headaches are the most common complaints. They usually ease once the air clears or you move indoors.',
  },
  {
    title: 'Who is most at risk',
    body: 'Young children, older people, pregnant women and anyone with asthma, lung disease or heart disease react sooner and more strongly. They should take precautions even at moderate readings.',
  },
  {
    title: 'What long exposure does',
    body: 'Fine particles are small enough to reach deep into the lungs and pass into the blood. Breathing them in repeatedly over the years is linked to weaker lungs, heart disease and stroke.',
  },
  {
    title: 'When to see a doctor',
    body: 'Get medical help if you have trouble breathing, chest pain, wheezing that does not settle, or if an existing condition suddenly gets worse.',
  },
]

export const CHECKLIST = [
  'Check the API reading before leaving home',
  'Keep N95 masks ready for everyone in the family',
  'Close windows and doors when the API passes 100',
  'Drink plenty of water through the day',
  'Run an air purifier, or set the air-con to recirculate',
  'Keep inhalers and regular medication within reach',
  'Never burn rubbish or garden waste in the open',
]

export const TIMELINE = [
  {
    year: '1997',
    title: 'The first regional crisis',
    body: 'Fires in Sumatra and Kalimantan during a strong El Niño cover the region in smoke. Sarawak declares a state of emergency as readings in Kuching pass 800.',
  },
  {
    year: '2002',
    title: 'ASEAN signs a haze agreement',
    body: 'Member states sign the ASEAN Agreement on Transboundary Haze Pollution in Kuala Lumpur, promising to prevent and monitor fires together.',
  },
  {
    year: '2005',
    title: 'Emergency in Selangor',
    body: 'A haze emergency is declared in Port Klang and Kuala Selangor after the API climbs above 500.',
  },
  {
    year: '2013',
    title: 'Muar records 746',
    body: 'Muar in Johor records an API of 746, and an emergency is declared in Muar and Ledang.',
  },
  {
    year: '2015',
    title: 'Months of smoke',
    body: 'About 2.6 million hectares burn in Indonesia. Schools close across Malaysia and Singapore, and flights are cancelled.',
  },
  {
    year: '2019',
    title: 'Haze returns',
    body: 'Thousands of schools close in Sarawak, Selangor and other states as readings turn very unhealthy.',
  },
]

export const QUIZ = [
  {
    question: 'Which part of haze is the biggest worry for your health?',
    options: ['Water vapour', 'PM2.5 fine particles', 'Oxygen', 'Pollen'],
    answer: 1,
    explain:
      'PM2.5 particles are small enough to reach deep into the lungs and enter the blood.',
  },
  {
    question: 'In Malaysia, what does an API reading between 101 and 200 mean?',
    options: ['Good', 'Moderate', 'Unhealthy', 'Hazardous'],
    answer: 2,
    explain:
      '101 to 200 is the unhealthy band. Sensitive groups should stay indoors.',
  },
  {
    question: 'Which mask filters out fine haze particles?',
    options: ['Cloth mask', 'Surgical mask', 'N95 respirator', 'A scarf'],
    answer: 2,
    explain:
      'A well-fitted N95 filters at least 95% of fine particles. Cloth and surgical masks let most of them through.',
  },
  {
    question: 'What causes most of the haze that crosses borders in Southeast Asia?',
    options: [
      'Volcanic eruptions',
      'Land and forest fires, especially on peat',
      'Sea spray',
      'Fireworks',
    ],
    answer: 1,
    explain:
      'Fires used to clear land, especially on drained peat, produce smoke that travels for hundreds of kilometres.',
  },
  {
    question: 'The API is above 200. What is the best thing to do?',
    options: [
      'Go for a run to clear your lungs',
      'Open all the windows',
      'Stay indoors and keep the windows closed',
      'Burn the garden waste now',
    ],
    answer: 2,
    explain:
      'Staying indoors with the windows closed cuts down how much smoke you breathe in.',
  },
]

export const PLEDGES = [
  'I will not burn waste in the open',
  'I will check the API before outdoor activities',
  'I will take public transport or carpool more often',
  'I will choose sustainably sourced products',
  'I will share what I learned with my family',
]

export const APIMS_URL = 'https://apims.doe.gov.my'
