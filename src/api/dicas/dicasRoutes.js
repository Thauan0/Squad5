const express = require('express');
const router = express.Router();
const dicasController = require('./dicasController.js[');

router.get('/', dicasController.getTodasDicas);
router.get('/:id', dicasController.getDicaPorId);
router.post('/', dicasController.criarDica);
router.put('/:id', dicasController.atualizarDica);
router.delete('/:id', dicasController.deletarDica);

module.exports = router;