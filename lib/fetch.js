import URI from 'urijs';
import axios from 'axios';

const apiUrl = new URI(process.env.BACKEND_API_URL);

const fetch = axios.create({
  baseURL: apiUrl.origin(),
  headers: { 'Content-type': 'application/json' },
});

export default fetch;
