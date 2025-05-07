const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters.user_id;

    const { data, error } = await supabase
      .from('evaluaciones')
      .select(`
        id,
        innovacion,
        conocimiento,
        liderazgo,
        comentario,
        extra,
        ponderado,
        participaciones (
          id,
          kata:katas_id (
            id,
            nombre,
            fecha_inicio,
            fecha_fin,
            descripcion
          )
        )
      `)
      .eq('participaciones.user_id', userId);

    if (error) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        statusCode: 500,
        body: JSON.stringify({ error: 'Error al obtener evaluaciones', details: error.message }),
      };
    }

    const evaluacionesCompletas = data.filter(e => 
      e.innovacion != null &&
      e.conocimiento != null &&
      e.liderazgo != null &&
      e.comentario != null &&
      e.ponderado != null &&
      e.participaciones != null &&
      e.participaciones.kata != null
    );
    return {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      statusCode: 200,
      body: JSON.stringify(evaluacionesCompletas),
    };

  } catch (err) {
    console.error('Error interno:', err);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};