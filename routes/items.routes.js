import { Router } from "express";
import { readFile, writeFile } from "fs/promises";
import { get_user_byId } from "../utils/user.js";

const fileSales = await readFile('./data/items.json', 'utf-8');
const itemsData = JSON.parse(fileSales);

const router = Router();  

// get - mostrar todos los items
router.get('/all', (req, res) =>{
    try{
        if(itemsData.length){
            res.status(200).json(itemsData)
        }else{
            res.status(400).json("No hay items")
        }
    }catch{
        res.status(500).send("Error al leer los items")
    }
})

router.get('/byName/:art', (req,res) => {
    const articulo = req.params.art
    try{
        const result = itemsData.filter(e => e.name == articulo)
        if(result.length ){
            res.status(200).json(result)
        }else{
            res.status(400).json(`${articulo} no fue encontrado.`)
        }
    }catch{
        res.status(500).send("Error al leer los items")
    }
})

router.post('/updateSellingPrice/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const newSellingPrice = req.body.newSellingPrice;

    try {
        const itemIndex = itemsData.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            itemsData[itemIndex].selling_price = newSellingPrice;

            writeFile('./data/items.json', JSON.stringify(itemsData, null, 2), 'utf-8');

            res.status(200).json(itemsData[itemIndex]);
        } else {
            res.status(404).json({ message: `Item con id ${itemId} no encontrado.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el selling_price.' });
    }
});
router.post('/calculateProfit/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = itemsData.find(e => e.id === itemId);

    if (!item) {
        res.status(404).json({ message: `item con ID ${itemId} no encontrado` });
        return;
    }

    const purchasePrice = item.purchase_price;
    const sellingPrice = item.selling_price;
    const profit = sellingPrice - purchasePrice;

    res.status(200).json({ message: `La ganancia bruta del item con ID ${itemId}: $${profit}` });
});


router.put('/updateName/:id', async (req, res) => {
    const itemId = parseInt(req.params.id);
    const { name } = req.body;

    try {
        const existingItemIndex = itemsData.findIndex(item => item.id === itemId);

        if (existingItemIndex !== -1) {
            const updatedItem = {
                ...itemsData[existingItemIndex],
                name,
            };

            itemsData[existingItemIndex] = updatedItem;

            await writeFile('./data/items.json', JSON.stringify(itemsData, null, 2));

            res.status(200).json(updatedItem);
        } else {
            res.status(404).json({ message: `Ítem con ID ${itemId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el nombre del ítem", error: error.message });
    }
});
export default router;