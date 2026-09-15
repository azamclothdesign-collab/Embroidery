import { pool } from "../../pool.js";

import { type ContactMessageRecord } from "../../../../types/contact.js";

type ContactRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  order_number: string | null;
  message: string;
  created_at: Date;
};

export async function insertContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  orderNumber?: string | undefined;
  message: string;
}): Promise<ContactMessageRecord> {
  const result = await pool.query<ContactRow>(
    `INSERT INTO contact_messages (name, email, topic, order_number, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, topic, order_number, message, created_at`,
    [
      input.name,
      input.email,
      input.topic,
      input.orderNumber ?? null,
      input.message,
    ],
  );

  const row = result.rows[0];

  if (row === undefined) {
    throw new Error("contact_insert_failed");
  }

  const record: ContactMessageRecord = {
    id: row.id,
    name: row.name,
    email: row.email,
    topic: row.topic,
    message: row.message,
    createdAt: row.created_at.toISOString(),
  };

  if (row.order_number !== null) {
    record.orderNumber = row.order_number;
  }

  return record;
}
