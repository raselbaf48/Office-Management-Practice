export interface IdacEmergencyContact {
  id: string;
  name: string;
  rankDesignation?: string;
  phone: string;
  whatsappPhone: string;
}

export interface IdacResponsibility {
  id: string;
  text: string;
}

const DEFAULT_RESPONSIBILITIES: IdacResponsibility[] = [
  { id: '1', text: 'If electricity off has a look whether Gen is automatically On or not.' },
  { id: '2', text: 'Any Fire occurrence.' },
  { id: '3', text: 'Any other abnormality.' },
  { id: '4', text: 'Pour out the water from dehumidifier every morning.' },
];

const DEFAULT_CONTACTS: IdacEmergencyContact[] = [
  { id: '1', name: 'WO A Baten', rankDesignation: 'Warrant Officer', phone: '01712361050', whatsappPhone: '01712361050' },
  { id: '2', name: 'WO Lutfar', rankDesignation: 'Warrant Officer', phone: '01678072477', whatsappPhone: '01678072477' },
  { id: '3', name: 'Sgt Uzzal', rankDesignation: 'Sergeant', phone: '01918523473', whatsappPhone: '01918523473' },
];

const RESPONSIBILITIES_KEY = 'baf_idac_responsibilities';
const CONTACTS_KEY = 'baf_idac_emergency_contacts';

export const getIdacResponsibilities = (): IdacResponsibility[] => {
  try {
    const raw = localStorage.getItem(RESPONSIBILITIES_KEY);
    if (!raw) return DEFAULT_RESPONSIBILITIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RESPONSIBILITIES;
  } catch {
    return DEFAULT_RESPONSIBILITIES;
  }
};

export const saveIdacResponsibilities = (list: IdacResponsibility[]): void => {
  try {
    localStorage.setItem(RESPONSIBILITIES_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('baf_idac_settings_updated'));
  } catch (e) {
    console.error('Failed to save responsibilities:', e);
  }
};

export const getIdacEmergencyContacts = (): IdacEmergencyContact[] => {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    if (!raw) return DEFAULT_CONTACTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
  } catch {
    return DEFAULT_CONTACTS;
  }
};

export const saveIdacEmergencyContacts = (list: IdacEmergencyContact[]): void => {
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('baf_idac_settings_updated'));
  } catch (e) {
    console.error('Failed to save emergency contacts:', e);
  }
};
