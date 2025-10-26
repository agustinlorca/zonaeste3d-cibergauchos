import { z } from "zod";

const buyerSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    telefono: z.string().trim().min(1, "El teléfono es obligatorio"),
    email: z.string().trim().email("Email inválido"),
  })
  .partial()
  .optional();

const itemSchema = z.object({
  id: z.string().trim().min(1, "El ID del producto es obligatorio"),
  nombre: z.string().trim().min(1, "El nombre del producto es obligatorio"),
  precio: z.coerce.number().positive("El precio debe ser mayor que cero"),
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor que cero"),
  imgUrl: z.string().trim().url().optional(),
});

export const checkoutSchema = z.object({
  buyer: buyerSchema,
  items: z.array(itemSchema).nonempty("El carrito no puede estar vacío"),
});
