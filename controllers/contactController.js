import { getIdentifyContact, identifyContact } from "../services/contactServices.js";

const identifyContactController = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;
    const response = await identifyContact(email || null, phoneNumber);
    res.status(response.status).send({ contact: response.contact });
  } catch (error) {
    next(error);
  }
}

const getIdentifyContactController = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.query;
    const response = await getIdentifyContact(email || null, phoneNumber || null);
    res.status(response.status).send({ contact: response.contact });
  } catch (error) {
    next(error);
  }
}

export { identifyContactController, getIdentifyContactController };
