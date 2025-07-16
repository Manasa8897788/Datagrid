import axios from "axios";
import { customerGrid } from "../screens/data/data";
import { Customer } from "../screens/models/customer";
import { GenericFilterRequest } from "../screens/models/genericFilterRequest";

const API_BASE_URL = "http://13.203.127.30:9999/aurave-api";

const dataService = {
  async getCustomerMasterList() {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/master/get`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Customer Master list:", error);
      throw error;
    }
  },

  async getCustomersPaginated(offset: number, pageSize: number) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer/master/get/page`,
        {
          params: { offset, pageSize },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching paginated customers:", error);
      throw error;
    }
  },

  async getCustomerMasterListBySort(
    columns: string,
    direction: "ASC" | "DESC"
  ) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer/master/get/by/sort`,
        {
          params: { columns, direction },
        }
      );
      return response.data.content;
    } catch (error) {
      console.error("Error fetching Customer Master list by sort:", error);
      throw error;
    }
  },

  async getCustomersPaginatedAndSorted(
    offset: number,
    pageSize: number,
    sortColumn: string,
    sortDirection: "ASC" | "DESC"
  ) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer/master/get/page/sort`,
        {
          params: { offset, pageSize, sortColumn, sortDirection },
        }
      );
      console.log(
        "Response from getCustomersPaginatedAndSorted:",
        response.data
      );
      return response.data.content;
    } catch (error) {
      console.error("Error fetching paginated and sorted customers:", error);
      throw error;
    }
  },

  async filterCustomers(
    requestBody: GenericFilterRequest
  ): Promise<Customer[]> {
    try {
      const response = await axios.post<Customer[]>(
        `${API_BASE_URL}/customer/master/get/page/filter`,
        requestBody
      );
      console.log("##response", response);
      return response.data;
    } catch (error: any) {
      console.error("##Error filtering customers:", error);
      throw error;
    }
  },
};

export default dataService;
