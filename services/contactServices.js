import { pool } from '../config/dbConfig.js';

const identifyContact = async (email, phoneNumber) => {
  try {
    
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error",
    };
  }
}

export { identifyContact };