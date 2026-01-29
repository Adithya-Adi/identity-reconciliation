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

const getIdentifyContact = async (email, phoneNumber) => {
  if (!email && !phoneNumber) {
    throw {
      status: 400,
      message: 'email or phoneNumber is required',
    };
  }

  try {
    const searchContactQuery = `
      SELECT * 
      FROM contact 
      WHERE (email = $1 OR phone_number = $2)
      ORDER BY created_at
    `;
    const values = [email, phoneNumber];
    const searchContact = await pool.query(searchContactQuery, values);

    if (!searchContact.rows.length) {
      throw {
        status: 404,
        message: 'Contact not found',
      };
    }

    const firstMatch = searchContact.rows[0];
    const primaryContactId =
      firstMatch.link_precedence === 'primary' ? firstMatch.id : firstMatch.linked_id;

    const contactDetails = await getAllContactDetailsFromPrimaryContactId(primaryContactId);
    return contactDetails;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || 'Internal server error',
    };
  }
}

export { identifyContact, getIdentifyContact };
