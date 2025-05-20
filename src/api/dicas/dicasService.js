const db = require('../database/sqlite');

const getTodasDicas = () => {
return new Promise((resolve, reject) => {
db.all('SELECT * FROM dicas', [], (err, rows) => {
if (err) reject(err);
else resolve(rows);
});
});
};

const getDicaPorId = (id) => {
return new Promise((resolve, reject) => {
db.get('SELECT * FROM dicas WHERE id = ?', [id], (err, row) => {
if (err) reject(err);
else resolve(row);
});
});
};

const criarDica = ({ titulo, conteudo }) => {
return new Promise((resolve, reject) => {
const query = 'INSERT INTO dicas (titulo, conteudo) VALUES (?, ?)';
db.run(query, [titulo, conteudo], function (err) {
if (err) reject(err);
else resolve({ id: this.lastID, titulo, conteudo });
});
});
};

const atualizarDica = (id, { titulo, conteudo }) => {
return new Promise((resolve, reject) => {
const query = 'UPDATE dicas SET titulo = ?, conteudo = ? WHERE id = ?';
db.run(query, [titulo, conteudo, id], function (err) {
if (err) reject(err);
else resolve({ id, titulo, conteudo });
});
});
};

const deletarDica = (id) => {
return new Promise((resolve, reject) => {
db.run('DELETE FROM dicas WHERE id = ?', [id], function (err) {
if (err) reject(err);
else resolve();
});
});
};

module.exports = {
getTodasDicas,
getDicaPorId,
criarDica,
atualizarDica,
deletarDica,
};