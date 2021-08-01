const express = require('express');
const app = express();
const Joi = require('joi');
//const logger = require('./logger')
const morgan = require('morgan');
const config = require('config');
const debug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Configuracion de entorno
console.log('Aplicacion: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));

//Usos de un Middleware de tercero para peticiones http
//app.get('env') sirve para saber en que entorno estamos
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    //console.log('Morgan habilitado...');
    debug('Morgan esta habilitado')
}
//set DEBUG=app:* activa ambos entornos
//set DEBUG=app:inicio activa solo entorno de inicio
//Trabajos con la base de datos
debug('Conectando con la base de datos');

//app.use(logger.log);
//app.use(logger.auth);

const usuarios = [
    { id: 1, nombre: 'Fernando' }, { id: 2, nombre: 'Angleica' }, { id: 3, nombre: 'Mateo' }
]

/* app.get('/', (req, res) => {
    res.end('Hola feerka desde express')
}); //petición */

app.get('/api/usuarios', (req, res) => {
    //res.send(['Fernando', 'Luis', 'Ana', 'Maria', 'Felipe'])
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
    //Los parametros que vienen siempre son string, hay que convertir a numerico en este caso para que funcione porq se definieron así
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);

});

app.post('/api/usuarios', (req, res) => {
    /*   let body = req.body;
      console.log(body.nombre);
      res.json({ body }) */
    const { error, value } = validarUsuario(req.body.nombre);

    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        console.log(error);
        res.status(400).send(mensaje)
    }

    /*  if (!req.body.nombre || req.body.nombre.length <= 4) {
          //400 bad req
          res.status(400).send('Debe ingresar un nombre');
          return;
      }
      */

});

app.put('/api/usuarios/:id', (req, res) => {

    //Encontrar si existe el usuario que queremos actualizar
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    //Para saber si el nuevo nombre actualizado es valido

    const { error, value } = validarUsuario(req.body.nombre);
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    usuario.nombre = value.nombre;
    res.send(usuario);
})

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    const index = usuarios.indexOf(usuario);
    //Si no le coloco el 1 me elimina todos los elementos 
    //apartir de ese indice, por eso es importante indicar que solo quiero eliminar un elem
    usuarios.splice(index, 1);
    res.send(usuario);

})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
})


/* app.post(); //envio de datos
app.put(); //actualización
app.delete(); //eliminar */
//app.delete(); //eliminar */

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string()
            .min(3)
            .required()
    })
    return (schema.validate({ nombre: nom }));
}