import {Router} from 'express';
import { readFile, writeFile } from "fs/promises";
import { get_user_byId } from "../utils/user.js";

const fileUser = await readFile('./data/users.json', 'utf-8')
const userData = JSON.parse(fileUser)

const router = Router()


router.get('/all', (req, res) => {
    
    try{
        if (userData.length){
            res.status(200).json(userData);
        }else{
            res.status(401).send({message: 'No hay usuarios'})
        }
    }catch{
        res.status(500).send({message:'Error al leer los usuarios'});
    }
    
})

router.get('/byName/:name', (req, res) => {
    const name = req.params.name;   

    const result = userData.filter(e => e.name === name);

    if (result.length) {
        res.status(200).json(result);
    } else {
        res.status(400).json(`No hay usuarios llamados ${name}`);
    }
});

router.post('/byID', (req, res) => {
    const userID = req.body.id;
    const result = userData.filter(e => e.id == userID);

    if (result.length) {
        res.status(200).json(result);
    } else {
        res.status(400).json(`No existe el usuario: ${userID}`);
    }
});


const getRandomNumber = () => Math.floor(Math.random() * 1000).toString().padStart(3, '0');
router.post('/addUser', async (req,res) =>{
    try{
        const{name, lastname} = req.body
        const maxID = Math.max(...userData.map(user => user.id), 0)
        const pass = `${name}${getRandomNumber()}`
        const newUser={
            name,
            lastname,
            username : `${name}${lastname}`,
            pass,   
            id : maxID + 1 
        }

        userData.push(newUser)
        await writeFile('./data/users.json', JSON.stringify(userData, null, 2))
        res.status(200).json(newUser)
    }catch{
        res.status(500).json({message: "Error al agregar el usuario", error: error.message})
    }
})

router.put('/updateUser/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, lastname } = req.body;

    try {
        const existingUserIndex = userData.findIndex(user => user.id === userId);

        if (existingUserIndex !== -1) {
            const updatedUser = {
                ...userData[existingUserIndex],
                name,
                lastname,
                username: `${name}${lastname}`,
                pass: `${name}${getRandomNumber()}`,
            };

            userData[existingUserIndex] = updatedUser;

            await writeFile('./data/users.json', JSON.stringify(userData, null, 2));

            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: `Usuario con ID ${userId} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
});
export default router;