"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  changePasswordSchema,
  orderStatusSchema,
  productFormSchema
} from "@/lib/validators";

export async function createProductAction(raw: unknown) {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid product data" };
  const d = parsed.data;

  const exists = await prisma.product.findUnique({ where: { slug: d.slug } });
  if (exists) return { error: "Slug already exists" };

  await prisma.product.create({
    data: {
      slug: d.slug,
      name: d.name,
      tagline: d.tagline,
      category: d.category,
      price: d.price,
      drop: d.drop,
      description: d.description,
      details: JSON.stringify(d.details),
      printArea: JSON.stringify(d.printArea),
      customizable: d.customizable,
      active: d.active,
      colors: {
        create: d.colors.map((c, i) => ({
          name: c.name,
          hex: c.hex,
          fabric: c.fabric,
          printDefault: c.printDefault,
          sortOrder: i
        }))
      },
      sizes: {
        create: d.sizes.map((label, i) => ({ label, sortOrder: i }))
      }
    }
  });

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateProductAction(id: string, raw: unknown) {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid product data" };
  const d = parsed.data;

  const clash = await prisma.product.findFirst({
    where: { slug: d.slug, NOT: { id } }
  });
  if (clash) return { error: "Slug already exists" };

  await prisma.productColor.deleteMany({ where: { productId: id } });
  await prisma.productSize.deleteMany({ where: { productId: id } });

  await prisma.product.update({
    where: { id },
    data: {
      slug: d.slug,
      name: d.name,
      tagline: d.tagline,
      category: d.category,
      price: d.price,
      drop: d.drop,
      description: d.description,
      details: JSON.stringify(d.details),
      printArea: JSON.stringify(d.printArea),
      customizable: d.customizable,
      active: d.active,
      colors: {
        create: d.colors.map((c, i) => ({
          name: c.name,
          hex: c.hex,
          fabric: c.fabric,
          printDefault: c.printDefault,
          sortOrder: i
        }))
      },
      sizes: {
        create: d.sizes.map((label, i) => ({ label, sortOrder: i }))
      }
    }
  });

  revalidatePath("/shop");
  revalidatePath(`/product/${d.slug}`);
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { error: "Not found" };
  await prisma.product.delete({ where: { id } });
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateOrderStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse({ status });
  if (!parsed.success) return { error: "Invalid status" };
  await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function changePasswordAction(raw: unknown) {
  const session = await requireAdmin();
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid input" };

  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });
  if (!admin) return { error: "Admin not found" };

  const ok = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!ok) return { error: "Current password is wrong" };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  return { ok: true };
}
