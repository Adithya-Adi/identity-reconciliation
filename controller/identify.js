const Contact = require('../model/Contact');


const identify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    let primaryContact = await Contact.getPrimaryContact(email, phoneNumber);

    let secondaryContacts = []
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();

    // Check if primary contact does not exists
    if (primaryContact == 'Primary Contact not found') {
        primaryContact = await Contact.createContact({ email, phoneNumber, linkedId: null, linkPrecedence: 'primary', createdAt: formattedDate, updatedAt: formattedDate, detetedAt: null });
    } else if (primaryContact.length > 1) {   // Check if the this request has email and phoneNumber from two different existing contacts
        const updateSecondaryContact = primaryContact[1];
        primaryContact = primaryContact[0];
        
        //Update the contact as Secondary
        await Contact.updateContactAsSecondary(primaryContact.id, updateSecondaryContact.id)
    } else { // Create request as Secondary Contact
        _primaryContact = primaryContact[0]
        secondaryContacts == await Contact.createContact({ email, phoneNumber, linkedId: _primaryContact.id, linkPrecedence: 'secondary', createdAt: formattedDate, updatedAt: formattedDate, detetedAt: null });
    }
    
    //Get Primary Contact
    primaryContact = await Contact.getPrimaryContact(email, phoneNumber);
    primaryContact = primaryContact[0];

    //Get Secondary Contact
    const getSecondaryContacts = await Contact.getSecondaryContacts(primaryContact.id);

    let secondaryEmails = [];
    let secondaryPhoneNumbers = [];
    let secondaryContactIds = [];

    if (Array.isArray(getSecondaryContacts)) {
      secondaryEmails = getSecondaryContacts.map(contact => contact.email);
      secondaryPhoneNumbers = getSecondaryContacts.map(contact => contact.phonenumber);
      secondaryContactIds = getSecondaryContacts.map(contact => contact.id);
    }

    const emailsSet = new Set([primaryContact.email, ...secondaryEmails]);
    const emails = Array.from(emailsSet);
    const phoneNumberSet = new Set([primaryContact.phonenumber, ...secondaryPhoneNumbers]);
    const phoneNumbers = Array.from(phoneNumberSet)

    //Create the response
    const response = {
      primaryContactId: primaryContact.id,
      emails: emails,
      phoneNumbers : phoneNumbers,
      secondaryContactIds
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error occurred during identification:', error);
    res.status(500).json({ error: 'An error occurred during identification' });
  }
};

module.exports = {
  identify
};
