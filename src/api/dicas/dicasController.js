const dicasService = require('./dicasService');

const getTodasDicas = async (req, res) => {
try {
const dicas = await dicasService.getTodasDicas();
res.status(200).json({
mensagem: 'Dicas recuperadas com sucesso.',
dados: dicas
});
} catch (error) {
res.status(500).json({ erro: 'Erro ao buscar dicas.' });
}
};

const getDicaPorId = async (req, res) => {
try {
const { id } = req.params;
const dica = await dicasService.getDicaPorId(id);
if (!dica) {
return res.status(404).json({ erro: 'Dica não encontrada.' });
}
res.status(200).json({
mensagem: 'Dica recuperada com sucesso.',
dados: dica
});
} catch (error) {
res.status(500).json({ erro: 'Erro ao buscar a dica. Tente novamente mais tarde.' });
}
};

const criarDica = async (req, res) => {
try {
const { titulo, conteudo } = req.body;

if (!titulo || !conteudo) {
return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
}

const novaDica = await dicasService.criarDica(req.body);
res.status(201).json({
mensagem: 'Dica criada com sucesso.',
dados: novaDica
});
} catch (error) {
res.status(500).json({ erro: 'Erro ao criar dica. Tente novamente mais tarde.' });
}
};

const atualizarDica = async (req, res) => {
try {
const { id } = req.params;
const { titulo, conteudo } = req.body;

if (!titulo || !conteudo) {
return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios para atualização.' });
}

const dicaAtualizada = await dicasService.atualizarDica(id, req.body);
res.status(200).json({
mensagem: 'Dica atualizada com sucesso.',
dados: dicaAtualizada
});
} catch (error) {
res.status(500).json({ erro: 'Erro ao atualizar dica. Tente novamente mais tarde.' });
}
};

const deletarDica = async (req, res) => {
try {
const { id } = req.params;
await dicasService.deletarDica(id);
res.status(200).json({ mensagem: 'Dica excluída com sucesso.' });
} catch (error) {
res.status(500).json({ erro: 'Erro ao excluir dica. Tente novamente mais tarde.' });
}
};

module.exports = {
getTodasDicas,
getDicaPorId,
criarDica,
atualizarDica,
deletarDica,
};
