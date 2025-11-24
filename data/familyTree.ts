import { FamilyTreeNode } from '../types';

export const familyTreeData: FamilyTreeNode = {
  id: 'grandpa-richard',
  name: 'Richard Doe',
  profilePic: 'https://images.pexels.com/photos/1684820/pexels-photo-1684820.jpeg',
  spouse: {
    id: 'grandma-eleanor',
    name: 'Eleanor Doe',
    profilePic: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg',
  },
  children: [
    {
      id: 'dad-john',
      name: 'John Doe',
      profilePic: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
      spouse: {
        id: 'mom-jane',
        name: 'Jane Doe',
        profilePic: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      },
      children: [
        {
          id: 'me-alex',
          name: 'Alex Doe (You)',
          profilePic: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg',
          children: []
        },
        {
          id: 'sister-mia',
          name: 'Mia Doe',
          profilePic: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg',
          children: []
        }
      ]
    },
    {
        id: 'aunt-susan',
        name: 'Susan Smith',
        profilePic: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
        spouse: {
            id: 'uncle-bob',
            name: 'Bob Smith',
            profilePic: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
        },
        children: [
            {
                id: 'cousin-leo',
                name: 'Leo Smith',
                profilePic: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg',
            }
        ]
    }
  ]
};