import pool from "../config/db.js";

function parseId(value) {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

const toCategory = (r) => ({
  id: r.category_id,
  name: r.category_name,
  description: r.description,
  imageUrl: r.image_url,
  isActive: Boolean(r.is_active),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  productCount: Number(r.product_count),
});

// Every column of the categories table, plus how many products use the category
const SELECT_CATEGORY = `
  SELECT c.category_id, c.category_name, c.description, c.image_url, c.is_active,
         c.created_at, c.updated_at,
         (SELECT COUNT(*) FROM products p WHERE p.category_id = c.category_id) AS product_count
  FROM categories c`;

async function findCategory(id) {
  const [rows] = await pool.execute(`${SELECT_CATEGORY} WHERE c.category_id = ?`, [id]);
  return rows[0] ? toCategory(rows[0]) : null;
}

function cleanCategory(body) {
  const { name, description, imageUrl, isActive } = body ?? {};

  if (
    typeof name !== "string" ||
    (description !== undefined && description !== null && typeof description !== "string") ||
    (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== "string")
  ) {
    return { error: "Invalid input" };
  }

  const c = {
    name: name.trim(),
    description: description?.trim() || null,
    imageUrl: imageUrl?.trim() || null,
    isActive: isActive === undefined ? 1 : [true, 1, "1"].includes(isActive) ? 1 : 0,
  };

  if (!c.name || c.name.length > 100) return { error: "Name must be 1 to 100 characters." };
  if (c.description && c.description.length > 2000) return { error: "Description must be 2000 characters or fewer." };
  if (c.imageUrl && (c.imageUrl.length > 500 || !/^(https?:\/\/|\/)/.test(c.imageUrl))) {
    return { error: "Image URL must start with http://, https:// or /, and be 500 characters or fewer." };
  }
  return c;
}

export async function listCategories(req, res) {
  try {
    const [rows] = await pool.execute(`${SELECT_CATEGORY} ORDER BY c.category_id`);
    res.json(rows.map(toCategory));
  } catch (error) {
    console.error("List categories failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to load categories" });
  }
}

export async function createCategory(req, res) {
  const c = cleanCategory(req.body);
  if (c.error) return res.status(400).json({ message: c.error });

  try {
    const [result] = await pool.execute(
      "INSERT INTO categories (category_name, description, image_url, is_active) VALUES (?, ?, ?, ?)",
      [c.name, c.description, c.imageUrl, c.isActive]
    );
    res.status(201).json(await findCategory(result.insertId));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A category with this name already exists." });
    }
    console.error("Create category failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to create category" });
  }
}

export async function updateCategory(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid category id" });

  const c = cleanCategory(req.body);
  if (c.error) return res.status(400).json({ message: c.error });

  try {
    if (!(await findCategory(id))) {
      return res.status(404).json({ message: "Category not found" });
    }

    await pool.execute(
      `UPDATE categories
       SET category_name = ?, description = ?, image_url = ?, is_active = ?
       WHERE category_id = ?`,
      [c.name, c.description, c.imageUrl, c.isActive, id]
    );
    res.json(await findCategory(id));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A category with this name already exists." });
    }
    console.error("Update category failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to update category" });
  }
}

export async function deleteCategory(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid category id" });

  try {
    const [result] = await pool.execute("DELETE FROM categories WHERE category_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    // products.category_id is ON DELETE RESTRICT
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "This category still has products. Move or remove them first, or set the category to inactive instead.",
      });
    }
    console.error("Delete category failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to delete category" });
  }
}