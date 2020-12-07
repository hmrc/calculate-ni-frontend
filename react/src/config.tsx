import moment from 'moment';

// types
import { Calculated } from './interfaces'
import { TaxYear } from './interfaces'

export const momentDateFormat = 'D MMMM YYYY'

export const fcn = (str: string) => {
  switch (str) {
    case 'A':
      return 'A - Regular'
      case 'B':
        return 'B - Married women and widows'
      case 'C':
        return 'C - Pension age'
      case 'J':
        return 'J - Deferred'
      case 'H':
        return 'H - Apprentice under 25'
      case 'M':
        return 'M - Under 21'
      case 'Z':
        return 'Z - Deferred and under 21'
      case 'X':
        return 'X - Exempt'
  }
}

export const periods = [
  'Wk',
  'Frt',
  'Mnth',
  '4Wk'
]

export const fpn = (str: string) => {
  switch (str) {
    case 'Wk':
      return 'Weekly'
    case 'Frt':
      return 'Fortnightly'
    case 'Mnth':
      return 'Monthly'
    case '4Wk':
      return 'Four weekly'
  }
}

export const taxYearString = (ty: TaxYear) => `${moment(ty.from).format(momentDateFormat)} - ${moment(ty.to).format(momentDateFormat)}`

// export const getTaxYears = () => {
//   let currentYear = new Date().getFullYear()
//   let yearsToFill = currentYear - 1975
//   const tY = Array(yearsToFill).fill({})

//   return tY.map(() => {
//     let yearObj = {
//       from: new Date(`${(currentYear - 1).toString()}-4-6`),
//       to: new Date(`${(currentYear).toString()}-4-6`)
//     }
//     currentYear--;
//     return yearObj;
//   })

// }

export const taxYearsCategories = [
  {
    id: '1',
    from: new Date('1975-04-06'),
    to: new Date('1976-04-05'),
    categories: ['A','B','C']
  },
  {
    id: '2',
    from: new Date('1976-04-06'),
    to: new Date('1977-04-05'),
    categories: ['A','B','C']
  },
  {
    id: '3',
    from: new Date('1977-04-06'),
    to: new Date('1978-04-05'),
    categories: ['A','B','C']
  },
  {
    id: '4',
    from: new Date('1978-04-06'),
    to: new Date('1978-10-02'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '5',
    from: new Date('1978-10-02'),
    to: new Date('1979-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '6',
    from: new Date('1979-04-06'),
    to: new Date('1980-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '7',
    from: new Date('1980-04-06'),
    to: new Date('1981-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '8',
    from: new Date('1981-04-06'),
    to: new Date('1982-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '9',
    from: new Date('1982-04-06'),
    to: new Date('1982-08-02'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '10',
    from: new Date('1982-08-02'),
    to: new Date('1983-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '11',
    from: new Date('1983-04-06'),
    to: new Date('1983-08-02'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '12',
    from: new Date('1983-08-02'),
    to: new Date('1984-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '13',
    from: new Date('1984-04-06'),
    to: new Date('1984-10-02'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '14',
    from: new Date('1984-10-02'),
    to: new Date('1985-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '15',
    from: new Date('1985-04-06'),
    to: new Date('1985-10-02'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '16',
    from: new Date('1985-10-02'),
    to: new Date('1986-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '17',
    from: new Date('1986-04-06'),
    to: new Date('1987-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '18',
    from: new Date('1987-04-06'),
    to: new Date('1988-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '19',
    from: new Date('1988-04-06'),
    to: new Date('1989-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '20',
    from: new Date('1989-04-06'),
    to: new Date('1989-10-02'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '21',
    from: new Date('1989-10-02'),
    to: new Date('1990-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '22',
    from: new Date('1990-04-06'),
    to: new Date('1991-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '23',
    from: new Date('1991-04-06'),
    to: new Date('1992-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '24',
    from: new Date('1992-04-06'),
    to: new Date('1993-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '25',
    from: new Date('1993-04-06'),
    to: new Date('1994-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '26',
    from: new Date('1994-04-06'),
    to: new Date('1995-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '27',
    from: new Date('1995-04-06'),
    to: new Date('1996-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '28',
    from: new Date('1996-04-06'),
    to: new Date('1997-04-05'),
    categories: ['A','B','C','D','E']
  },
  {
    id: '29',
    from: new Date('1997-04-06'),
    to: new Date('1998-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '30',
    from: new Date('1998-04-06'),
    to: new Date('1999-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '31',
    from: new Date('1999-04-06'),
    to: new Date('2000-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '32',
    from: new Date('2000-04-06'),
    to: new Date('2001-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '33',
    from: new Date('2001-04-06'),
    to: new Date('2002-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '34',
    from: new Date('2002-04-06'),
    to: new Date('2003-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '35',
    from: new Date('2003-04-06'),
    to: new Date('2004-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '36',
    from: new Date('2004-04-06'),
    to: new Date('2005-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '37',
    from: new Date('2005-04-06'),
    to: new Date('2006-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '38',
    from: new Date('2006-04-06'),
    to: new Date('2007-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '39',
    from: new Date('2007-04-06'),
    to: new Date('2008-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '40',
    from: new Date('2008-04-06'),
    to: new Date('2009-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '41',
    from: new Date('2009-04-06'),
    to: new Date('2010-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '42',
    from: new Date('2010-04-06'),
    to: new Date('2011-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '43',
    from: new Date('2011-04-06'),
    to: new Date('2012-04-05'),
    categories: ['A','B','C','D','E','F','G','S']
  },
  {
    id: '44',
    from: new Date('2012-04-06'),
    to: new Date('2013-04-05'),
    categories: ['A','B','C','D','E','J','L']
  },
  {
    id: '45',
    from: new Date('2013-04-06'),
    to: new Date('2014-04-05'),
    categories: ['A','B','C','D','E','J','L']
  },
  {
    id: '46',
    from: new Date('2014-04-06'),
    to: new Date('2015-04-05'),
    categories: ['A','B','C','D','E','J','L']
  },
  {
    id: '47',
    from: new Date('2015-04-06'),
    to: new Date('2016-04-05'),
    categories: ['A','B','C','D','E','J','L','M','I','K','Z']
  },
  {
    id: '48',
    from: new Date('2016-04-06'),
    to: new Date('2017-04-05'),
    categories: ['A','B','C','J','M','H','Z']
  },
  {
    id: '49',
    from: new Date('2017-04-06'),
    to: new Date('2018-04-05'),
    categories: ['A','B','C','J','M','H','Z']
  },
  {
    id: '50',
    from: new Date('2018-04-06'),
    to: new Date('2019-04-05'),
    categories: ['A','B','C','J','M','H','Z']
  }
].reverse()
  
/* 


  {
    from: new Date('xxxx-04-05'),
    to: new Date('xxxx-04-05'),
    categories: []
  }


  1975 (A,B,C)
  1976 (A,B,C)
  1977 (A,B,C)
  1978-04-05,1978-10-02 (A,B,C,D,E)
  1978-10-02,1979-04-05 (A,B,C,D,E)
  1979 (A,B,C,D,E)
  1980 (A,B,C,D,E)
  1981 (A,B,C,D,E)
  1982-04-05,1982-08-02 (A,B,C,D,E)
  1982-08-02,1983-04-05 (A,B,C,D,E)
  1983-04-05,1983-08-02 (A,B,C,D,E)
  1983-08-02,1984-04-05 (A,B,C,D,E)
  1984-04-05,1984-10-02 (A,B,C,D,E)
  1984-10-02,1985-04-05 (A,B,C,D,E)
  1985-04-05,1985-10-02 (A,B,C,D,E)
  1985-10-02,1986-04-05 (A,B,C,D,E)
  1986 (A,B,C,D,E)
  1987 (A,B,C,D,E)
  1988 (A,B,C,D,E)
  1989-04-05,1989-10-02 (A,B,C,D,E)
  1989-10-02,1990-04-05 (A,B,C,D,E)
  1990 (A,B,C,D,E)
  1991 (A,B,C,D,E)
  1992 (A,B,C,D,E)
  1993 (A,B,C,D,E)
  1994 (A,B,C,D,E)
  1995 (A,B,C,D,E)
  1996 (A,B,C,D,E)
  1997 (A,B,C,D,E,F,G,S)
  1998 (A,B,C,D,E,F,G,S)
  1999 (A,B,C,D,E,F,G,S)
  2000 (A,B,C,D,E,F,G,S)
  2001 (A,B,C,D,E,F,G,S)
  2002 (A,B,C,D,E,F,G,S)
  2003 (A,B,C,D,E,F,G,J,L,S)
  2004 (A,B,C,D,E,F,G,J,L,S)
  2005 (A,B,C,D,E,F,G,J,L,S)
  2006 (A,B,C,D,E,F,G,J,L,S)
  2007 (A,B,C,D,E,F,G,J,L,S)
  2008 (A,B,C,D,E,F,G,J,L,S)
  2009 (A,B,C,D,E,F,G,J,L,S)
  2010 (A,B,C,D,E,F,G,J,L,S)
  2011 (A,B,C,D,E,F,G,J,L,S)
  2012 (A,B,C,D,E,J,L)
  2013 (A,B,C,D,E,J,L)
  2014 (A,B,C,D,E,J,L)
  2015 (A,B,C,D,E,J,L,M,I,K,Z)
  2016 (A,B,C,J,M,H,Z)
  2017 (A,B,C,J,M,H,Z)
  2018 (A,B,C,J,M,H,Z)

*/


export const calcOverUnderPayment = (value: number, type: string) => {
  if (type === 'under') {
    return (value > 0) ? value : 0
  } else {
    return (value < 0) ? Math.abs(value) : 0
  }
}

export const calcNi = (c: Calculated[], arrPosition: number) => (
  c.reduce((prev, cur) => {
    return prev + Object.keys(cur).reduce((prev, key) => {
      return prev + cur[key][arrPosition]
    }, 0)
  }, 0)
)

export const onlyUnique = (value: any, index: number, self: any[]) => self.indexOf(value) === index;
