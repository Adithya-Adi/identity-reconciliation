const { pool } = require('../utils/connector');


const createContact = async (contactData) => {
  const query = 'INSERT INTO contact (email, phoneNumber, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [contactData.email, contactData.phoneNumber, contactData.linkedId, contactData.linkPrecedence, contactData.createdAt, contactData.updatedAt, contactData.deletedAt];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error occurred while creating contact:', error);
    throw error;
  }
};

async function getPrimaryContact(email, phoneNumber) {
  try {
    const result = await pool.query(
      'SELECT * FROM Contact WHERE linkprecedence = $1 AND (email = $2 OR phoneNumber = $3) ORDER BY createdAt',
      ['primary', email, phoneNumber]
    );
    
    const contact = result.rows;

    if (contact.length == 0) {
      return 'Primary Contact not found';
    }

    return contact;
  } catch (error) {
    console.error('Error occurred while retrieving primary contacts:', error);
    throw error;
  }
}



const getSecondaryContacts = async (primaryContactId) => {
  console.log(primaryContactId)
  const query = 'SELECT * FROM contact WHERE linkedId = $1';
  const values = [primaryContactId];

  try {
    const result = await pool.query(query, values);
    const secondaryContacts = result.rows;

    if (secondaryContacts.length == 0) {
      return 'Secondary Contact not found';
    }

    return secondaryContacts;
  } catch (error) {
    console.error('Error occurred while retrieving secondary contacts:', error);
    throw error;
  }
};

const updateContactAsSecondary = async (primaryContactId, updateSecondaryContactId) => {
  const query = 'UPDATE contact SET linkedId = $1, linkPrecedence = $2 where id = $3';
  const values = [primaryContactId, 'secondary', updateSecondaryContactId];
  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error occurred while updating contact:', error);
    throw error;
  }
};

module.exports = {
  createContact,
  getPrimaryContact,
  getSecondaryContacts,
  updateContactAsSecondary
};

