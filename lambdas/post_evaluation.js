const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  try {
    console.log('Received event:', event);  


    const body = event;
    console.log('Parsed body:', body);
    const {
      jurado_id,
      participacion_id,
      innovacion,
      liderazgo,
      conocimiento,
      comentario
    } = body;
    if (
      !jurado_id || !participacion_id ||
      innovacion === undefined || liderazgo === undefined || conocimiento === undefined ||
      comentario === undefined
    ) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Faltan parámetros requeridos' }),
      };
    }

    const ponderado = ((innovacion + liderazgo + conocimiento) / 3).toFixed(2);
    const extra = (ponderado * 0.1).toFixed(2);
    console.log('Calculated values:', { ponderado, extra });
    const { data, error } = await supabase
      .from('evaluaciones')
      .insert([{
        jurado_id,
        participacion_id,
        innovacion,
        liderazgo,
        conocimiento,
        comentario
      }]);

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Evaluación registrada con éxito', data }),
    };

  } catch (err) {
    console.error('Handler error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};