const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.user_id;

    const { data: katasDisponibles, error } = await supabase
      .from('katas')
      .select('id, nombre, fecha_inicio,fecha_fin, descripcion')
      .gte('fecha_inicio', new Date().toISOString());

    if (error) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*", 
          "Access-Control-Allow-Credentials": true
        },
        statusCode: 500,
        body: JSON.stringify({ error: 'Error al obtener katas', details: error.message }),
      };
    }
    const { data: participaciones, error: participacionesError } = await supabase
      .from('participaciones')
      .select('katas_id')
      .eq('user_id', userId);

    if (participacionesError) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        statusCode: 500,
        body: JSON.stringify({ error: 'Error al verificar participaciones', details: participacionesError.message }),
      };
    }

    const katasRegistradas = participaciones.map(p => p.katas_id);
    const disponibles = katasDisponibles.filter(k => !katasRegistradas.includes(k.id));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(disponibles),
    };

  } catch (err) {

    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};