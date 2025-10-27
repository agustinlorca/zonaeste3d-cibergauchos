import { z } from "zod";

const buyerSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    telefono: z.string().trim().min(1, "El telefono es obligatorio"),
    email: z.string().trim().email("Email invalido"),
  })
  .partial()
  .optional();

const itemSchema = z.object({
  id: z.string().trim().min(1, "El ID del producto es obligatorio"),
  nombre: z.string().trim().min(1, "El nombre del producto es obligatorio"),
  precio: z.coerce.number().positive("El precio debe ser mayor que cero"),
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un numero entero")
    .positive("La cantidad debe ser mayor que cero"),
  imgUrl: z.string().trim().url().optional(),
});

const shippingAddressSchema = z
  .object({
    street: z.string().trim().min(1, "La calle es obligatoria"),
    number: z.string().trim().min(1, "El numero es obligatorio"),
    city: z.string().trim().min(1, "La ciudad es obligatoria"),
    province: z.string().trim().min(1, "La provincia es obligatoria"),
    postalCode: z.string().trim().min(1, "El codigo postal es obligatorio"),
    notes: z
      .string()
      .trim()
      .max(300, "Las notas no pueden superar los 300 caracteres")
      .optional(),
  })
  .partial({ notes: true });

const shippingSchema = z
  .object({
    method: z.enum(["pickup", "delivery"], {
      errorMap: () => ({ message: "Selecciona una forma de entrega" }),
    }),
    address: shippingAddressSchema.optional(),
  })
  .refine(
    (value) => {
      if (value.method === "delivery") {
        return Boolean(value.address);
      }
      return true;
    },
    {
      message: "Debes ingresar la direccion completa para el envio a domicilio",
      path: ["address"],
    }
  );

export const checkoutSchema = z.object({
  buyer: buyerSchema,
  items: z.array(itemSchema).nonempty("El carrito no puede estar vacio"),
  shipping: shippingSchema,
});
