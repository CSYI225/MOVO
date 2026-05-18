import React from 'react';

export const tenants = [
  { 
    id: 1, 
    name: 'Kouamé Marc', 
    email: 'marc.k@email.com', 
    phone: '01 02 03 04 05', 
    property: 'Résidence Les Palmiers', 
    unitNumber: 'Apt 4B',
    initials: 'KM',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Vérifié',
    rating: 4.8,
    location: 'Abidjan, Cocody',
    occupancyDate: '15/01/2024',
    history: [
      { 
        id: 101, 
        property: 'Studio Riviera', 
        period: '12/01/2022 - 16/12/2023', 
        status: 'Terminé',
        propertyType: 'Studio',
        location: 'Riviera Palmeraie',
        price: '150,000 FCFA',
        arrivalDate: '12/01/2022',
        departureDate: '16/12/2023',
        relationStatus: 'Confirmée',
        landlordName: 'Kouassi Jean'
      },
      { 
        id: 102, 
        property: 'Appartement Marcory', 
        period: '01/05/2020 - 10/12/2021', 
        status: 'Terminé',
        propertyType: 'Appartement',
        location: 'Marcory Zone 4',
        price: '200,000 FCFA',
        arrivalDate: '01/05/2020',
        departureDate: '10/12/2021',
        relationStatus: 'Confirmée',
        landlordName: 'Diomande Abou'
      }
    ],
    reports: [
      { 
        id: 201, 
        date: '12/03/2024', 
        author: 'Coulibaly Sékou', 
        content: 'Locataire exemplaire, paiement toujours à l\'heure.', 
        type: 'Paiement',
        rating: 5,
        relation: 'Confirmée',
        regularity: 'Toujours à temps',
        status: 'Validé'
      }
    ]
  },
  { id: 2, name: 'Soro Jean', email: 'soro.j@email.com', phone: '07 08 09 10 11', property: 'Villa Riviera', unitNumber: 'Villa n°12', initials: 'SJ', status: 'Non-vérifié', location: 'Riviera Palmeraie', rating: 4.5 },
  { id: 3, name: 'Yao Amenan', email: 'yao.a@email.com', phone: '05 06 07 08 09', property: 'Résidence Les Palmiers', unitNumber: 'Apt 2A', initials: 'YA', photo: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'Refusé', location: 'Abidjan, Cocody', rating: 4.2 },
  { 
    id: 4, 
    name: 'Konan Koffi', 
    email: 'konan.k@email.com', 
    phone: '02 03 04 05 06', 
    property: null, 
    unitNumber: null, 
    initials: 'KK', 
    status: 'Ancien', 
    location: 'Plateau, Avenue 1', 
    rating: 3.8,
    history: [
      { 
        id: 103, 
        property: 'Appartement Plateau', 
        period: '01/01/2023 - 01/01/2024', 
        status: 'Terminé',
        propertyType: 'Appartement',
        location: 'Plateau, Avenue 1',
        price: '450,000 FCFA',
        arrivalDate: '01/01/2023',
        departureDate: '01/01/2024',
        relationStatus: 'Ancienne',
        landlordName: 'Coulibaly Sékou'
      }
    ]
  },
  { id: 5, name: 'Diabaté Fatoumata', email: 'diabate.f@email.com', phone: '01 11 21 31 41', property: 'Résidence Les Palmiers', unitNumber: 'Studio 1', initials: 'DF', photo: 'https://randomuser.me/api/portraits/women/68.jpg', status: 'Vérifié', location: 'Abidjan, Cocody', rating: 4.9 },
  { id: 6, name: 'Bakayoko Moussa', email: 'bakayoko.m@email.com', phone: '07 07 07 07 07', property: null, unitNumber: null, initials: 'BM', photo: 'https://randomuser.me/api/portraits/men/75.jpg', status: 'Vérifié', location: 'Bouaké', rating: 4.0 },
  { id: 7, name: 'Toure Alassane', email: 'toure.a@email.com', phone: '05 05 05 05 05', property: null, unitNumber: null, initials: 'AT', status: 'Non-vérifié', location: 'Yamoussoukro', rating: 3.5 },
];

export const properties = [
  { 
    id: 1, 
    name: 'Résidence Les Palmiers', 
    location: 'Cocody, Abidjan', 
    type: 'Immeuble', 
    price: '2,500,000 FCFA / mois',
    status: 'Partiellement occupé', 
    occupants: 3,
    icon: 'building',
    currentTenants: [1, 3, 5],
    units: [
      { id: 1, number: 'Apt 4B', type: '3 pièces', price: '350,000 FCFA', tenantId: 1, history: [
        { id: 501, tenantName: 'Bakayoko Moussa', period: '05/01/2022 - 20/12/2023', tenantId: 4 }
      ] },
      { id: 2, number: 'Apt 2A', type: '2 pièces', price: '250,000 FCFA', tenantId: 3, history: [] },
      { id: 3, number: 'Studio 1', type: 'Studio', price: '150,000 FCFA', tenantId: 5, history: [] },
      { id: 4, number: 'Apt 3C', type: '3 pièces', price: '350,000 FCFA', tenantId: null, history: [
        { id: 502, tenantName: 'Toure Alassane', period: '10/03/2021 - 15/11/2021', tenantId: 2 }
      ] },
      { id: 5, number: 'Apt 1B', type: '2 pièces', price: '250,000 FCFA', tenantId: null, history: [] },
    ],
    history: [
      { id: 501, tenantName: 'Bakayoko Moussa', period: '05/01/2022 - 20/12/2023', tenantId: 4 },
      { id: 502, tenantName: 'Toure Alassane', period: '10/03/2021 - 15/11/2021', tenantId: 2 }
    ]
  },
  { 
    id: 2, 
    name: 'Villa Riviera', 
    location: 'Riviera Palmeraie', 
    type: 'Villa', 
    price: '800,000 FCFA / mois',
    status: 'Occupé', 
    occupants: 1,
    icon: 'home',
    currentTenants: [2],
    history: [
      { id: 503, tenantName: 'Koffi Serge', period: '01/01/2020 - 30/12/2023', tenantId: 3 }
    ]
  },
  { 
    id: 3, 
    name: 'Appartement Plateau', 
    location: 'Plateau, Avenue 1', 
    type: 'Appartement', 
    price: '450,000 FCFA / mois', 
    status: 'Vacant', 
    icon: 'building', 
    currentTenants: [],
    history: [
        { id: 504, tenantName: 'Bamba Lanciné', period: '12/02/2022 - 10/01/2024', tenantId: 1 }
    ]
  },
  { 
    id: 4, 
    name: 'Studio Angré', 
    location: 'Angré 7ème Tranche', 
    type: 'Studio', 
    price: '150,000 FCFA / mois', 
    status: 'Vacant', 
    occupants: 0,
    icon: 'home', 
    currentTenants: [],
    history: [
        { id: 505, tenantName: 'N\'guessan Julie', period: '15/05/2023 - 20/02/2024', tenantId: 5 }
    ]
  },
];

export const allPlatformUsers = [
  { id: 1, name: 'Kouamé Marc', email: 'marc.k@email.com', phone: '01 02 03 04 05', initials: 'KM', rating: 4.8, isAssigned: true, property: 'Résidence Les Palmiers' },
  { id: 2, name: 'Soro Jean', email: 'soro.j@email.com', phone: '07 08 09 10 11', initials: 'SJ', rating: 4.5, isAssigned: true, property: 'Villa Riviera' },
  { id: 3, name: 'Yao Amenan', email: 'yao.a@email.com', phone: '05 06 07 08 09', initials: 'YA', rating: 4.2, isAssigned: true, property: 'Résidence Les Palmiers' },
  { id: 5, name: 'Diabaté Fatoumata', email: 'diabate.f@email.com', phone: '01 11 21 31 41', initials: 'DF', rating: 4.9, isAssigned: true, property: 'Résidence Les Palmiers' },
  { id: 4, name: 'Konan Koffi', email: 'konan.k@email.com', phone: '02 03 04 05 06', initials: 'KK', rating: 3.8, isAssigned: false, property: null },
  { id: 6, name: 'Bakayoko Moussa', email: 'bakayoko.m@email.com', phone: '07 07 07 07 07', initials: 'BM', rating: 4.0, isAssigned: false, property: null },
  { id: 7, name: 'Toure Alassane', email: 'toure.a@email.com', phone: '05 05 05 05 05', initials: 'AT', rating: 3.5, isAssigned: false, property: null },
  { id: 101, name: 'Bamba Ahmed', email: 'ahmed.b@email.com', phone: '01 44 55 66 77', initials: 'BA', rating: 4.7, isAssigned: false, property: null },
  { id: 102, name: 'Kouassi Affouet', email: 'affouet.k@email.com', phone: '07 88 99 00 11', initials: 'KA', rating: 4.9, isAssigned: false, property: null },
  { id: 103, name: 'Sidibé Moussa', email: 'moussa.s@email.com', phone: '05 22 33 44 55', initials: 'SM', rating: 4.2, isAssigned: false, property: null },
  { id: 104, name: 'Ouattara Fatim', email: 'fatim.o@email.com', phone: '01 01 01 01 01', initials: 'OF', rating: 4.5, isAssigned: false, property: null },
];

export const reports = [
  { 
    id: 1, 
    tenantName: 'Kouamé Marc', 
    date: '10/05/2024', 
    type: 'Paiement', 
    status: 'Validé', 
    rating: 5,
    location: 'Cocody, Abidjan',
    propertyType: 'Immeuble',
    propertyName: 'Résidence Les Palmiers',
    price: '350,000 FCFA',
    comment: 'Loyer payé avec 2 jours d\'avance.',
    relation: 'Confirmée',
    regularity: 'Toujours à temps'
  },
  { 
    id: 2, 
    tenantName: 'Soro Jean', 
    date: '05/05/2024', 
    type: 'Maintenance', 
    status: 'Contesté', 
    rating: 2,
    location: 'Riviera Palmeraie',
    propertyType: 'Villa',
    propertyName: 'Villa Riviera',
    price: '800,000 FCFA',
    comment: 'Dégâts constatés sur la robinetterie.', 
    tenantResponse: 'C\'était déjà défectueux à mon arrivée.',
    relation: 'Confirmée',
    regularity: 'Peu de Retard'
  },
];
