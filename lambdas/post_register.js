const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    const body = typeof event === 'string' ? JSON.parse(event.body) : event;
    const { nombre, email, password, rol } = body;
    const { data, error } = await supabase
      .from('users')
      .insert([{ nombre, email, password, rol }]);

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error al insertar en la base de datos', detalle: error.message }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Usuario registrado exitosamente', data }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }),
    };
  }
};