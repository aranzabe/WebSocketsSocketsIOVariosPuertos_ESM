import {response,request} from 'express';


const controladorUsuarios = { 
    usuariosGet : (req, res = response) => {
        res.status(200).json({'msg':'Get desde controlador'});
    },
    usuariosGetParametro : (req, res = response) => {
        res.status(200).json({'msg':'Get desde controlador', 'id':req.params.id});
    },
    usuariosPost : (req = request, res = response) => {
        const {nombre, edad} = req.body;
        res.status(201).json({
            msg:'Post desde controlador...',
            nombre,
            edad
        });
    },
    usuariosDelete : (req, res = response) => {
        res.status(202).json({'msg':'Delete desde controlador', 'id':req.params.id});
    },
    usuariosPut : (req, res = response) => {
        const id = req.params.id;
        res.status(202).json({'msg':'Put desde controlador.', id});
    }
}

export default controladorUsuarios