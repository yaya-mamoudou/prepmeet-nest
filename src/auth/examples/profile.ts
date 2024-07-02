import { VisibilityLevel } from 'src/utils/enum';

export const ExpertProfileUpdateExample = {
  about: 'hey there i am jone doe',
  visibilityLevel: VisibilityLevel,
  starterPrice: 10,
  recommendedPrice: 20,
  bestPrice: 15,
  videoUrl: 'http://video.com',
  focusAreaId: 1,
};

export const ExpertAvailabilityExample = [
  {
    day: 'tuesday',
    slot: [
      {
        from: '06:20',
        to: '06:40',
        availability: 'AVAILABLE',
        slotId: 36,
      },
      {
        from: '09:20',
        to: '09:40',
        availability: 'AVAILABLE',
      },
    ],
  },
];

export const addEducationalExperience = {
  eduExp: [
    {
      name: 'GCE O LEVELS',
      degreeId: 1,
      year: '2000',
    },
    {
      name: 'GCE A LEVELS',
      degreeId: 2,
      year: '2001',
    },
    {
      name: 'Btech',
      degreeId: 3,
      year: '2022',
    },
  ],
};

export const addCertification = {
  certification: [
    {
      name: 'SCRUM EXPERT',
      certificationUrl: 'certup.com',
      year: '2000',
    },
    {
      name: 'SCRUM EXPERT',
      certificationUrl: 'certup.com',
      year: '2000',
    },
  ],
};
