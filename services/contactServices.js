import { pool } from '../config/dbConfig.js';

const identifyContact = async (email, phoneNumber) => {
  try {
    //Check email and phoneNumber from two different existing contacts
    const mergedContactQuery = `
      SELECT * 
      FROM contact 
      WHERE (email = $1 OR phone_number = $2) AND
      link_precedence = 'primary'
      ORDER BY created_at
    `;
    const values = [email, phoneNumber];
    const mergedContact = await pool.query(mergedContactQuery, values);
    if (mergedContact.rows.length > 1) {
      // Update the second contact as Secondary
      const updateContactQuery = `
          UPDATE contact
          SET link_precedence = 'secondary',
          linked_id = $1
          WHERE id = $2
        `;
      const values = [mergedContact.rows[0].id, mergedContact.rows[1].id]
      await pool.query(updateContactQuery, values);
      const contactDetails = await getAllContactDetailsFromPrimaryContactId(mergedContact.rows[0].id);
      return contactDetails;
    } else {
      const searchContactQuery = `
      SELECT * 
      FROM contact 
      WHERE (email = $1 OR phone_number = $2)
      ORDER BY created_at
    `;
      const values = [email, phoneNumber];
      const searchContact = await pool.query(searchContactQuery, values);
      if (searchContact.rows.length && searchContact.rows[0].link_precedence === 'primary') {
        // Check if the email and phone already exists
        const existingEmail = searchContact.rows.filter(contact => contact.email === email);
        const existingPhoneNumber = searchContact.rows.filter(contact => contact.phone_number === phoneNumber);

        if ((email === null || existingEmail.length > 0) && (phoneNumber === null || existingPhoneNumber.length > 0)) {

          const contactDetails = await getAllContactDetailsFromPrimaryContactId(searchContact.rows[0].id);
          return contactDetails;
        } else {

          // Create new contact as secondary
          const insertContactQuery = `
          INSERT INTO contact (email, phone_number, linked_id, link_precedence) 
          VALUES ($1, $2, $3, $4)
          `;
          const values = [email, phoneNumber, searchContact.rows[0].id, 'secondary'];
          await pool.query(insertContactQuery, values);

          const contactDetails = await getAllContactDetailsFromPrimaryContactId(searchContact.rows[0].id);
          return contactDetails;

        }

      } if (searchContact.rows.length > 0 && searchContact.rows[0].link_precedence === 'secondary') {
        //Check if the email and phone already exists
        const existingEmail = searchContact.rows.filter(contact => contact.email === email);
        const existingPhoneNumber = searchContact.rows.filter(contact => contact.phone_number === phoneNumber);

        if ((email === null || existingEmail.length > 0) && (phoneNumber === null || existingPhoneNumber.length > 0)) {
          const contactDetails = await getAllContactDetailsFromPrimaryContactId(searchContact.rows[0].linked_id);
          return contactDetails;
        } else {

          // Create new contact as secondary
          const insertContactQuery = `
        INSERT INTO contact (email, phone_number, linked_id, link_precedence) 
        VALUES ($1, $2, $3, $4)
      `;
          const values = [email, phoneNumber, searchContact.rows[0].id, 'secondary'];
          await pool.query(insertContactQuery, values);

          const contactDetails = await getAllContactDetailsFromPrimaryContactId(searchContact.rows[0].id);
          return contactDetails;

        }
      } else {
        // Create new contact as primary
        const insertContactQuery = `
        INSERT INTO contact (email, phone_number, link_precedence) 
        VALUES ($1, $2, $3)
        RETURNING *
      `;
        const values = [email, phoneNumber, 'primary'];
        const insertedContact = await pool.query(insertContactQuery, values);
        return {
          status: 200,
          contact: {
            primaryContatctId: insertedContact.rows[0].id,
            emails: [insertedContact.rows[0].email],
            phoneNumbers: [insertedContact.rows[0].phone_number],
            secondaryContactIds: [],
          }
        }
      }
    }

  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || 'Internal server error',
    };
  }
}


const lookupIdentifiedContact = async (email, phoneNumber) => {
  const normalizedEmail =
    email != null && String(email).trim() !== '' ? String(email).trim() : null;
  const normalizedPhone =
    phoneNumber != null && String(phoneNumber).trim() !== ''
      ? String(phoneNumber).trim()
      : null;

  if (!normalizedEmail && !normalizedPhone) {
    return {
      status: 400,
      message: 'Provide at least one of email or phoneNumber query parameters',
    };
  }

  const searchContactQuery = `
    SELECT * 
    FROM contact 
    WHERE ($1::text IS NOT NULL AND email = $1)
       OR ($2::text IS NOT NULL AND phone_number = $2)
    ORDER BY created_at
  `;
  const searchContact = await pool.query(searchContactQuery, [
    normalizedEmail,
    normalizedPhone,
  ]);

  if (searchContact.rows.length === 0) {
    return { status: 404, message: 'No contact matches the given identifiers' };
  }

  const primaryIds = new Set(
    searchContact.rows.map((row) =>
      row.link_precedence === 'primary' ? row.id : row.linked_id
    )
  );

  if (primaryIds.size > 1) {
    return {
      status: 409,
      message:
        'Multiple distinct primary identities match; use POST /identify to reconcile',
    };
  }

  const [primaryId] = primaryIds;
  return getAllContactDetailsFromPrimaryContactId(primaryId);
};

const getAllContactDetailsFromPrimaryContactId = async (primaryContactId) => {
  const allContactsQuery = `
    SELECT * 
    FROM contact 
    WHERE (id = $1 OR linked_id = $1)
    ORDER BY created_at
  `;
  const values = [primaryContactId];
  const allContacts = await pool.query(allContactsQuery, values);
  //Map all the contact details
  const allEmails = new Set(allContacts.rows.map(contact => contact.email));
  const allPhoneNumber = new Set(allContacts.rows.map(contact => contact.phone_number));
  const allSecondaryIds = new Set(
    allContacts.rows
      .filter(contact => contact.link_precedence === 'secondary')
      .map(contact => contact.id)
  );

  return {
    status: 200,
    contact: {
      primaryContatctId: allContacts.rows[0].id,
      emails: [...allEmails],
      phoneNumbers: [...allPhoneNumber],
      secondaryContactIds: [...allSecondaryIds]
    }
  };
}


export { identifyContact, lookupIdentifiedContact };