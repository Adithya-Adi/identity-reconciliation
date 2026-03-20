import { identifyContact, lookupIdentifiedContact } from "../services/contactServices.js";

const identifyContactController = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;
    const response = await identifyContact(email || null, phoneNumber);
    res.status(response.status).send({ contact: response.contact });
  } catch (error) {
    next(error);
  }
};

const firstQuery = (value) => {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const getIdentifyContactController = async (req, res, next) => {
  try {
    const email = firstQuery(req.query.email);
    const phoneNumber = firstQuery(req.query.phoneNumber);
    const response = await lookupIdentifiedContact(
      email !== undefined ? email : null,
      phoneNumber !== undefined ? phoneNumber : null
    );
    if (response.status === 200) {
      return res.status(200).send({ contact: response.contact });
    }
    return res.status(response.status).send({ message: response.message });
  } catch (error) {
    next(error);
  }
};

export { identifyContactController, getIdentifyContactController };