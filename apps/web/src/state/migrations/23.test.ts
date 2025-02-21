import { createMigrate } from 'redux-persist'
import { migration1 } from 'state/migrations/1'
import { migration10 } from 'state/migrations/10'
import { migration11 } from 'state/migrations/11'
import { migration12 } from 'state/migrations/12'
import { migration13 } from 'state/migrations/13'
import { migration14 } from 'state/migrations/14'
import { migration15 } from 'state/migrations/15'
import { migration16 } from 'state/migrations/16'
import { migration17 } from 'state/migrations/17'
import { migration18 } from 'state/migrations/18'
import { migration19 } from 'state/migrations/19'
import { migration2 } from 'state/migrations/2'
import { migration20 } from 'state/migrations/20'
import { migration21 } from 'state/migrations/21'
import { migration22 } from 'state/migrations/22'
import { migration23 } from 'state/migrations/23'
import { migration3 } from 'state/migrations/3'
import { migration4 } from 'state/migrations/4'
import { migration5 } from 'state/migrations/5'
import { migration6 } from 'state/migrations/6'
import { migration7 } from 'state/migrations/7'
import { migration8 } from 'state/migrations/8'
import { migration9 } from 'state/migrations/9'
import { FiatCurrency } from 'uniswap/src/features/fiatCurrency/constants'
import { Language } from 'uniswap/src/features/language/constants'

const previousState = {
  _persist: {
    version: 22,
    rehydrated: true,
  },
  userSettings: {
    currentCurrency: FiatCurrency.UnitedStatesDollar,
    currentLanguage: Language.English,
    hideSmallBalances: true,
    hideSpamTokens: true,
  },
}

const migrator = createMigrate(
  {
    1: migration1,
    2: migration2,
    3: migration3,
    4: migration4,
    5: migration5,
    6: migration6,
    7: migration7,
    8: migration8,
    9: migration9,
    10: migration10,
    11: migration11,
    12: migration12,
    13: migration13,
    14: migration14,
    15: migration15,
    16: migration16,
    17: migration17,
    18: migration18,
    19: migration19,
    20: migration20,
    21: migration21,
    22: migration22,
    23: migration23,
  },
  { debug: false },
)

describe('migration to v23', () => {
  it('should add visibility.tokens if it does not exist', async () => {
    const result: any = await migrator(previousState, 23)
    expect(result.visibility.tokens).toEqual({})
  })

  it('should preserve existing visibility.tokens if already set', async () => {
    const stateWithVisibility = {
      ...previousState,
      visibility: {
        tokens: { '0x123': true, '0x456': false },
      },
    }
    const result: any = await migrator(stateWithVisibility, 23)
    expect(result.visibility.tokens).toEqual({ '0x123': true, '0x456': false })
  })

  it('should add visibility.positions if it does not exist', async () => {
    const result: any = await migrator(previousState, 23)
    expect(result.visibility.positions).toEqual({})
  })

  it('should preserve existing visibility.positions if already set', async () => {
    const stateWithVisibility = {
      ...previousState,
      visibility: {
        positions: { '0x123': true, '0x456': false },
      },
    }
    const result: any = await migrator(stateWithVisibility, 23)
    expect(result.visibility.positions).toEqual({ '0x123': true, '0x456': false })
  })

  it('should not modify other properties in the state', async () => {
    const result: any = await migrator(previousState, 23)
    expect(result.userSettings.currentCurrency).toEqual(FiatCurrency.UnitedStatesDollar)
    expect(result.userSettings.currentLanguage).toEqual(Language.English)
  })

  it('should update the persist version to 23', async () => {
    const result: any = await migrator(previousState, 23)
    expect(result._persist.version).toEqual(23)
  })
})
