export function generateId() {
  return crypto.randomUUID()
}

const SESSION_KEY = "grimorio_session"
const CHAR_KEY = "grimorio_characters"
const CAMP_KEY = "grimorio_campaigns"
const CAMP_MEMBER_KEY = "grimorio_campaign_members"
const ROLLS_KEY = "grimorio_rolls"

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const localDB = {
  getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null } catch { return null }
  },
  setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY)
  },

  getCharacters(userId) {
    return read(CHAR_KEY).filter(c => c.user_id === userId)
  },
  getAllCharacters() {
    return read(CHAR_KEY)
  },
  saveCharacter(char) {
    const list = read(CHAR_KEY)
    const idx = list.findIndex(c => c.id === char.id)
    if (idx >= 0) list[idx] = char
    else list.push(char)
    write(CHAR_KEY, list)
  },
  deleteCharacter(id) {
    write(CHAR_KEY, read(CHAR_KEY).filter(c => c.id !== id))
  },

  getCampaignsByMaster(masterId) {
    return read(CAMP_KEY).filter(c => c.master_id === masterId)
  },
  getCampaignsByIds(ids) {
    return read(CAMP_KEY).filter(c => ids.includes(c.id))
  },
  getCampaignByInvite(code) {
    return read(CAMP_KEY).find(c => c.codigo_convite === code) || null
  },
  saveCampaign(camp) {
    const list = read(CAMP_KEY)
    const idx = list.findIndex(c => c.id === camp.id)
    if (idx >= 0) list[idx] = camp
    else list.push(camp)
    write(CAMP_KEY, list)
  },

  getMembersByCampaign(campaignId) {
    return read(CAMP_MEMBER_KEY).filter(m => m.campaign_id === campaignId)
  },
  getCampaignIdsByUser(userId) {
    return read(CAMP_MEMBER_KEY).filter(m => m.user_id === userId).map(m => m.campaign_id)
  },
  addMember(member) {
    const list = read(CAMP_MEMBER_KEY)
    list.push(member)
    write(CAMP_MEMBER_KEY, list)
  },

  addRoll(roll) {
    const list = read(ROLLS_KEY)
    list.unshift(roll)
    write(ROLLS_KEY, list)
  },
  getRollsByCampaign(campaignId, limit = 20) {
    return read(ROLLS_KEY).filter(r => r.campaign_id === campaignId).slice(0, limit)
  },
}
