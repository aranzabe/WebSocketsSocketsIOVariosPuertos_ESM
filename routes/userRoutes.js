import { Router } from 'express';
import controladorUsuarios from '../controllers/userController.js';
export const router = Router();

router.get('/', controladorUsuarios.usuariosGet);
router.get('/:id', controladorUsuarios.usuariosGetParametro)
router.post('/', controladorUsuarios.usuariosPost);
router.put('/:id', controladorUsuarios.usuariosPut);//Con parámetro optativo.
router.delete('/:id', controladorUsuarios.usuariosDelete);

