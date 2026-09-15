import {
  findCustomerById,
  listCustomers,
} from "../../database/repositories/customers/customerRepository.js";
import { type CustomerListItem } from "../../../types/account.js";
import { ServiceError } from "../../../utils/serviceError.js";

export async function getCustomers(): Promise<CustomerListItem[]> {
  return listCustomers();
}

export async function getCustomerById(id: string): Promise<CustomerListItem> {
  const customer = await findCustomerById(id);

  if (customer === null) {
    throw new ServiceError(404, "not_found", "Customer not found");
  }

  return customer;
}
