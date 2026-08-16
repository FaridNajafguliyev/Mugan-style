import { Customer } from "../models/Customer.js";
import { ContactLead } from "../models/ContactLead.js";

export async function listCustomers() {
  return Customer.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "customer",
        as: "orders",
      },
    },
    {
      $project: {
        name: 1,
        phone: 1,
        email: 1,
        createdAt: 1,
        ordersCount: { $size: "$orders" },
        totalSpentKopecks: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$orders",
                  cond: { $not: { $in: ["$$this.status", ["PENDING_PAYMENT", "CANCELLED"]] } },
                },
              },
              as: "o",
              in: "$$o.totalKopecks",
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  model?: string;
  message?: string;
}

export async function createLead(input: CreateLeadInput) {
  return ContactLead.create(input);
}

export async function listLeads() {
  return ContactLead.find().sort({ createdAt: -1 });
}
