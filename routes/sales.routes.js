import { Router } from "express";
import { readFile, writeFile } from "fs/promises";
import { get_user_byId } from "../utils/user.js";

const fileSales = await readFile('./data/sales.json', 'utf-8');
const salesData = JSON.parse(fileSales);

const router = Router();  // Aquí utilizamos la variable 'router' que importamos

router.get('/all', (req, res) => {
    if (salesData.length) {
        res.status(200).json(salesData);
    } else {
        res.status(400).json("No hay ventas");
    }
})

router.get('/byDate/:from/:to', (req, res) => {
    const from = req.params.from;  
    const to = req.params.to;  

    const result = salesData.filter(e => e.date >= from && e.date <= to);

    if (result.length) {
        res.status(200).json(result);
    } else {
        res.status(400).json(`No hay ventas entre ${from} y ${to}`);
    }
});

router.post('/details', (req, res) => {
    const from = req.body.from;  
    const to = req.body.to;  
    let aux_name = ''
    try {
        const arr = salesData.filter(e => e.date >= from && e.date <= to);

        const result = arr.map(e => {
            aux_name = get_user_byId(e.seller)
            aux_name = aux_name.name + ' ' + aux_name.lastname
            return {
                id: e.id,
                id_item: e.id_item,
                total: e.total,
                date: e.date,
                seller: aux_name
            };
        });
        if (result.length) {
            res.status(200).json(result);
        } else {
            res.status(400).json(`No hay ventas entre ${from} y ${to}`);
        }
    } catch (error) {
        res.status(500).json("Error al buscar...");
    }
});
router.post('/byDate', (req, res) => {
    const { date } = req.body;

    if (!date) {
        res.status(400).json({ message: "La fecha es requerida en el cuerpo de la solicitud." });
        return;
    }

    try {
        const result = salesData
            .filter(e => e.date === date)
            .map(e => ({ id: e.id, total: e.total }));

        if (result.length) {
            res.status(200).json(result);
        } else {
            res.status(404).json(`No hay ventas para la fecha ${date}`);
        }
    } catch (error) {
        res.status(500).json("Error al buscar las ventas.");
    }
});


router.put('/updateTotal/:id', async (req, res) => {
    const saleId = parseInt(req.params.id);
    const { total } = req.body;

    try {
        const existingSaleIndex = salesData.findIndex(sale => sale.id === saleId);

        if (existingSaleIndex !== -1) {
            const updatedSale = {
                ...salesData[existingSaleIndex],
                total: parseFloat(total),
            };

            salesData[existingSaleIndex] = updatedSale;

            await writeFile('./data/sales.json', JSON.stringify(salesData, null, 2));

            res.status(200).json(updatedSale);
        } else {
            res.status(404).json({ message: `Venta con ID ${saleId} no encontrada` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el total de la venta", error: error.message });
    }
});

router.delete('/deleteSale/:id', async (req, res) => {
    const saleId = parseInt(req.params.id);

    try {
        const existingSaleIndex = salesData.findIndex(sale => sale.id === saleId);

        if (existingSaleIndex !== -1) {
            const deletedSale = salesData.splice(existingSaleIndex, 1)[0];

            await writeFile('./data/sales.json', JSON.stringify(salesData, null, 2));

            res.status(200).json(deletedSale);
        } else {
            res.status(404).json({ message: `Venta con ID ${saleId} no encontrada` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la venta", error: error.message });
    }
});
export default router;