import { sql } from "../config/db.js";
export const getAllProducts = async (request, response) => {
    try {
        const products = await sql`
      SELECT * FROM products ORDER BY created_at DESC
    `;
        return response.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        return response.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const createProduct = async (request, response) => {
    try {
        const { name, price, image } = request.body;
        if (!name || !price || !image)
            return response.status(400).json({
                success: false,
                message: "All fields are required!!",
            });

        const createdProduct = await sql`
      INSERT INTO products (name, price, image)
      VALUES (${name}, ${price}, ${image})
      RETURNING *
    `;
        return response.status(200).json({
            success: true,
            message: "Product created successfully!!",
            product: createdProduct[0],
        });
    } catch (error) {
        return response.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getProduct = async (request, response) => {
    try {
        const { id } = request.params;
        if (!id)
            return response.status(400).json({
                success: false,
                message: "Id is required!!",
            });
        const productFound = await sql`
      SELECT * FROM products WHERE id = ${id}
    `;
        if (productFound.length === 0)
            return response.status(404).json({
                success: false,
                message: "Product not found!",
            });
        return response.status(200).json({
            success: true,
            message: "Product found successfully!!",
            product: productFound[0],
        });
    } catch (error) {
        return response.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image } = req.body;
        if (!id)
            return res.status(400).json({ success: false, message: "Id is required!!" });
        const updates = [];
        const values = [];
        if (name !== undefined) {
            values.push(name);
            updates.push(`name = $${values.length}`);
        }
        if (price !== undefined) {
            values.push(price);
            updates.push(`price = $${values.length}`);
        }
        if (image !== undefined) {
            values.push(image);
            updates.push(`image = $${values.length}`);
        }
        if (updates.length === 0)
            return res.status(400).json({ success: false, message: "At least one field must be provided!!" });
        values.push(id);
        const query = `UPDATE products SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`;
        const updatedProduct = await sql.query(query, values);
        if (updatedProduct.length === 0)
            return res.status(404).json({ success: false, message: "Product not found!" });
        return res.status(200).json({
            success: true,
            message: "Product updated successfully!!",
            product: updatedProduct[0],
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
export const deleteProduct = async (request, response) => {
    try {
        const { id } = request.params;
        if (!id)
            return response.status(400).json({
                success: false,
                message: "Id is required!!",
            });
        const deleted = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING *
    `;
        if (deleted.length === 0)
            return response.status(404).json({
                success: false,
                message: "Product not found!",
            });
        return response.status(200).json({
            success: true,
            message: "Product deleted successfully!!",
            product: deleted[0],
        });
    } catch (error) {
        return response.status(400).json({
            success: false,
            message: error.message,
        });
    }
};