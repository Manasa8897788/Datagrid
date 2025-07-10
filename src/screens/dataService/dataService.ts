import axios from 'axios';

const API_BASE_URL = 'http://13.203.127.30:9999/aurave-api';

const dataService = {
  async getCustomerMasterList() {
    try {

      const response = await axios.get(`${API_BASE_URL}/customer/master/get`, );
      return response.data;
    } catch (error) {
      console.error('Error fetching Customer Master list:', error);
      throw error;
    }
  }
};

export default dataService;

