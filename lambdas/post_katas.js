const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    console.log("evento",event)
    const body = typeof event === 'string' ? JSON.parse(event) : event;
    const requiredFields = ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin'];
    const missingFields = requiredFields.filter(field => !body || !body[field]);

    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Faltan campos requeridos: ${missingFields.join(', ')}` }),
      };
    }
    console.log("body", body)
    const { data, error } = await supabase
      .from('katas')
      .insert([body]) 
      .select();       

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error al insertar en la base de datos', detalle: error.message }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Kata creada correctamente', kata: data[0] }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }),
    };
  }
};
