import { identifyContact } from "../services/contactServices.js";

const identifyContactController = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;
    const response = await identifyContact(email || null, phoneNumber);
    res.status(response.status).send({ contact: response.contact });
  } catch (error) {
    next(error);
  }
}

const identifyContactQueryController = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.query;
    if (!email && !phoneNumber) {
      return res.status(400).send({ message: 'email or phoneNumber is required' });
    }
    const response = await identifyContact(email || null, phoneNumber || null);
    res.status(response.status).send({ contact: response.contact });
  } catch (error) {
    next(error);
  }
}

export { identifyContactController, identifyContactQueryController };
